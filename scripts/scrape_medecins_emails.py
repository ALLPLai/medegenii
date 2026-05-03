"""
scrape_medecins_emails.py — Extraction emails médecins Maroc via DuckDuckGo dorks
==================================================================================
Pour chaque combinaison spécialité × ville, envoie ~5 requêtes DuckDuckGo ciblées,
extrait les emails des snippets + visite les pages résultat prometteuses.

Usage :
    pip install requests beautifulsoup4 lxml
    python scrape_medecins_emails.py
    python scrape_medecins_emails.py --ville casablanca
    python scrape_medecins_emails.py --specialite cardiologue

Sortie : medecins_emails.csv (trié : email vérifié > email trouvé > aucun)
"""

import csv, re, time, argparse, sys
from dataclasses import dataclass, asdict, fields
from pathlib import Path
from urllib.parse import urlparse, urljoin
from collections import defaultdict
import requests
from bs4 import BeautifulSoup
from ddgs import DDGS

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────

SPECIALITES = {
    "medecin-generaliste": "Médecin généraliste",
    "cardiologue":          "Cardiologie",
    "dermatologue":         "Dermatologie",
    "gynecologue":          "Gynécologie",
    "pediatre":             "Pédiatrie",
}

SPECIALITE_FR = {
    "medecin-generaliste": ["médecin généraliste", "médecin de famille", "généraliste"],
    "cardiologue":          ["cardiologue", "cardiologie"],
    "dermatologue":         ["dermatologue", "dermatologie"],
    "gynecologue":          ["gynécologue", "gynécologue obstétricien", "gynécologie"],
    "pediatre":             ["pédiatre", "pédiatrie"],
}

VILLES = ["casablanca", "rabat", "marrakech", "tanger", "fes", "agadir"]

# Délais pour ne pas se faire bloquer
DELAY_DDG      = 5.0   # entre chaque requête DuckDuckGo
DELAY_SITE     = 1.5   # entre chaque visite de site web
DDG_URL        = "https://html.duckduckgo.com/html/"
OUTPUT_FILE    = Path("medecins_emails.csv")

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", re.I)
PHONE_RE = re.compile(r"(?:\+212|0)[5-7][\s.\-]?\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2}")

EMAIL_NOISE = {
    # Technique
    "example.com", "exemple.com", "duckduckgo.com", "google.com",
    "bing.com", "sentry.io", "wixpress.com", "squarespace.com",
    "wordpress.com", "cloudflare.com", "googleapis.com",
    "schema.org", "w3.org", "openstreetmap.org",
    # Annuaires génériques (pas des médecins)
    "annuaire-horaire.fr", "goafricaonline.com", "edicom.ma",
    "city-info.ma", "pagesmaroc.com", "anuneo.com", "medicalis.ma",
    "pages-maroc.com", "marocannuaire.org", "telecontact.ma",
    "annuaire.ma", "jobergroup.com", "emploimedecin.com",
    "medecin-a-domicile.ma", "pediatresadomicile.com",
    # Hors Maroc / hors cible
    "consulfrance.org", "aminata.com", "estheticon.fr",
    "dominiquedenjean.com", "pinterest.com", "pinterest.fr",
    "les-cabinets.net", "journalsantemaroc.com",
}

# Domaines pertinents Maroc (bonus de confiance)
MA_DOMAINS = {".ma", "gmail.com", "hotmail.com", "yahoo.fr", "yahoo.com", "outlook.com"}


# ─────────────────────────────────────────────────────────────
# Modèle de données
# ─────────────────────────────────────────────────────────────

@dataclass
class Medecin:
    nom:          str
    specialite:   str
    ville:        str
    email:        str
    email_source: str   # "snippet" | "site_web" | "snippet+site"
    telephone:    str
    site_web:     str
    contexte:     str   # extrait du snippet pour vérifier manuellement
    priorite:     int   # 1=email+site · 2=email seul · 3=tel · 4=rien


# ─────────────────────────────────────────────────────────────
# HTTP session
# ─────────────────────────────────────────────────────────────

session = requests.Session()
session.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "fr-FR,fr;q=0.9,ar;q=0.8",
    "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
})


def get_soup(url: str, timeout: int = 10) -> BeautifulSoup | None:
    try:
        r = session.get(url, timeout=timeout, allow_redirects=True)
        r.raise_for_status()
        return BeautifulSoup(r.text, "lxml")
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────
# Nettoyage des emails
# ─────────────────────────────────────────────────────────────

def is_valid_email(email: str) -> bool:
    email = email.lower()
    domain = email.split("@")[-1]
    if domain in EMAIL_NOISE:
        return False
    if any(n in domain for n in EMAIL_NOISE):
        return False
    if re.search(r"\.(png|jpg|gif|svg|css|js|woff|eot|ttf)$", domain):
        return False
    if len(email) > 80 or " " in email:
        return False
    # Doit avoir au moins 2 chars avant l'@
    if len(email.split("@")[0]) < 2:
        return False
    return True


def clean_emails(raw: set[str]) -> list[str]:
    out = [e.lower().strip(".,;\"'><()[]") for e in raw]
    out = [e for e in out if is_valid_email(e)]
    # Trier : domaines .ma et professionnels en premier
    def score(e):
        d = e.split("@")[1]
        if d.endswith(".ma"):
            return 0
        if "gmail" in d or "hotmail" in d or "yahoo" in d or "outlook" in d:
            return 1
        return 2
    return sorted(set(out), key=score)


# ─────────────────────────────────────────────────────────────
# Génération des requêtes DuckDuckGo
# ─────────────────────────────────────────────────────────────

def build_queries(specialite_slug: str, ville: str) -> list[str]:
    termes = SPECIALITE_FR[specialite_slug]
    t  = termes[0]    # terme principal
    t2 = termes[1] if len(termes) > 1 else t

    return [
        f'{t} {ville} cabinet email gmail',
        f'{t} {ville} cabinet contact email',
        f'cabinet {t2} {ville} email rendez-vous',
        f'Dr {t} {ville} gmail.com OR hotmail.com cabinet privé',
        f'{t} {ville} site:facebook.com email cabinet',
    ]


# ─────────────────────────────────────────────────────────────
# DuckDuckGo → résultats + snippets
# ─────────────────────────────────────────────────────────────

@dataclass
class DDGResult:
    title:   str
    url:     str
    snippet: str


_ddgs_client = DDGS()


def duckduckgo_search(query: str) -> list[DDGResult]:
    try:
        raw = list(_ddgs_client.text(query, max_results=10, region="fr-FR"))
        return [
            DDGResult(
                title=r.get("title", ""),
                url=r.get("href", ""),
                snippet=r.get("body", ""),
            )
            for r in raw
        ]
    except Exception as e:
        print(f"    ⚠️  DDG: {e}", file=sys.stderr)
        return []


# ─────────────────────────────────────────────────────────────
# Extraction email depuis une page web
# ─────────────────────────────────────────────────────────────

CONTACT_PATHS = ["/contact", "/contact-us", "/contactez-nous",
                 "/nous-contacter", "/a-propos", "/about", "/"]


def scrape_email_from_url(url: str) -> tuple[str, str]:
    """Retourne (email, telephone) trouvés sur la page."""
    if not url or url.startswith("https://www.facebook"):
        return "", ""
    try:
        domain = urlparse(url).scheme + "://" + urlparse(url).netloc
    except Exception:
        return "", ""

    pages = [url]
    for path in CONTACT_PATHS:
        candidate = domain.rstrip("/") + path
        if candidate != url:
            pages.append(candidate)

    all_emails: set[str] = set()
    all_phones: set[str] = set()

    for page_url in pages[:4]:   # max 4 pages par site
        soup = get_soup(page_url)
        if not soup:
            continue
        # mailto: links
        for a in soup.select("a[href^='mailto:']"):
            all_emails.add(a["href"].replace("mailto:", "").split("?")[0].strip())
        # tel: links
        for a in soup.select("a[href^='tel:']"):
            all_phones.add(a["href"].replace("tel:", "").strip())
        # regex texte
        text = soup.get_text()
        all_emails.update(EMAIL_RE.findall(text))
        all_phones.update(PHONE_RE.findall(text))
        if all_emails:
            break
        time.sleep(0.4)

    emails = clean_emails(all_emails)
    phones = list(all_phones)
    return (emails[0] if emails else ""), (phones[0] if phones else "")


# ─────────────────────────────────────────────────────────────
# Extraction nom médecin depuis le contexte
# ─────────────────────────────────────────────────────────────

DR_RE = re.compile(
    r"(?:Dr\.?\s+|Docteur\s+|Pr\.?\s+|Prof\.?\s+)"
    r"([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ][a-zàâäéèêëîïôùûü\-]+(?:\s+[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ][a-zàâäéèêëîïôùûü\-]+){0,3})",
    re.UNICODE,
)


def extract_nom(text: str) -> str:
    m = DR_RE.search(text)
    return f"Dr {m.group(1)}" if m else ""


# ─────────────────────────────────────────────────────────────
# Pipeline par combo spécialité × ville
# ─────────────────────────────────────────────────────────────

def process_combo(slug: str, label: str, ville: str) -> list[Medecin]:
    print(f"\n  📍 {label} — {ville.capitalize()}")
    queries = build_queries(slug, ville)

    # Étape A : collecter tous les résultats DDG
    all_results: list[DDGResult] = []
    for q in queries:
        print(f"    🔍 {q[:80]}…", end=" ")
        results = duckduckgo_search(q)
        print(f"→ {len(results)} résultats")
        all_results.extend(results)
        time.sleep(DELAY_DDG)

    # Étape B : extraire emails depuis les snippets
    snippet_emails: dict[str, tuple[str, str, str]] = {}  # email → (nom, site, contexte)
    for res in all_results:
        combined = f"{res.title} {res.snippet}"
        emails = clean_emails(set(EMAIL_RE.findall(combined)))
        nom = extract_nom(combined)
        for email in emails:
            if email not in snippet_emails:
                snippet_emails[email] = (nom, res.url, combined[:200])

    print(f"    📧 {len(snippet_emails)} emails trouvés dans les snippets")

    # Étape C : visiter les pages prometteuses sans email dans snippet
    site_emails: dict[str, tuple[str, str, str, str]] = {}  # email → (nom, url, tel, contexte)
    visited_domains: set[str] = set()
    promising = [
        r for r in all_results
        if r.url
        and "facebook.com" not in r.url
        and "duckduckgo" not in r.url
        and urlparse(r.url).netloc not in visited_domains
    ]
    # Dédupliquer par domaine
    seen = set()
    unique_promising = []
    for r in promising:
        dom = urlparse(r.url).netloc
        if dom not in seen:
            seen.add(dom)
            unique_promising.append(r)

    print(f"    🌐 Visite de {min(len(unique_promising), 15)} sites…")
    for res in unique_promising[:15]:
        email, tel = scrape_email_from_url(res.url)
        if email and email not in snippet_emails and email not in site_emails:
            nom = extract_nom(f"{res.title} {res.snippet}")
            site_emails[email] = (nom, res.url, tel, f"{res.title} {res.snippet}"[:200])
            print(f"      ✉️  {email}  ({res.url[:60]})")
        time.sleep(DELAY_SITE)

    # Étape D : assembler les Medecin
    medecins: list[Medecin] = []
    seen_emails: set[str] = set()

    for email, (nom, site, contexte) in snippet_emails.items():
        if email in seen_emails:
            continue
        seen_emails.add(email)
        tel = ""
        m = Medecin(
            nom=nom or "— à vérifier",
            specialite=label,
            ville=ville.capitalize(),
            email=email,
            email_source="snippet",
            telephone=tel,
            site_web=site,
            contexte=contexte,
            priorite=2,
        )
        if site:
            m.priorite = 1
        medecins.append(m)

    for email, (nom, site, tel, contexte) in site_emails.items():
        if email in seen_emails:
            continue
        seen_emails.add(email)
        m = Medecin(
            nom=nom or "— à vérifier",
            specialite=label,
            ville=ville.capitalize(),
            email=email,
            email_source="site_web",
            telephone=tel,
            site_web=site,
            contexte=contexte,
            priorite=1,
        )
        medecins.append(m)

    return medecins


# ─────────────────────────────────────────────────────────────
# Export CSV
# ─────────────────────────────────────────────────────────────

CSV_FIELDS = [f.name for f in fields(Medecin)]


def write_csv(medecins: list[Medecin], path: Path) -> None:
    medecins.sort(key=lambda m: (m.priorite, m.ville, m.specialite))
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        w.writeheader()
        for m in medecins:
            w.writerow(asdict(m))

    print(f"\n💾 {len(medecins)} entrées → {path}")
    p1 = sum(1 for m in medecins if m.priorite == 1)
    p2 = sum(1 for m in medecins if m.priorite == 2)
    print(f"   🟢 Priorité 1 (email + site confirmé) : {p1}")
    print(f"   🟡 Priorité 2 (email dans snippet)    : {p2}")


# ─────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--ville",      help="Ex: casablanca")
    p.add_argument("--specialite", help="Ex: cardiologue")
    p.add_argument("--output",     default=str(OUTPUT_FILE))
    args = p.parse_args()

    villes = [args.ville] if args.ville else VILLES
    specs  = ({args.specialite: SPECIALITES[args.specialite]}
              if args.specialite and args.specialite in SPECIALITES
              else SPECIALITES)

    nb_combos = len(specs) * len(villes)
    nb_queries = nb_combos * 5
    duree_min  = int(nb_queries * DELAY_DDG / 60)
    print(f"\n🚀 {nb_combos} combos × 5 requêtes = {nb_queries} appels DDG")
    print(f"⏱  Durée estimée : ~{duree_min}-{duree_min*2} minutes (délais anti-ban inclus)\n")

    all_medecins: list[Medecin] = []
    seen_emails: set[str] = set()

    for slug, label in specs.items():
        for ville in villes:
            results = process_combo(slug, label, ville)
            for m in results:
                if m.email not in seen_emails:
                    seen_emails.add(m.email)
                    all_medecins.append(m)

    if not all_medecins:
        print("\n⚠️  Aucun email trouvé.")
        return

    write_csv(all_medecins, Path(args.output))

    from collections import Counter
    print("\n📊 Par spécialité :")
    for s, n in Counter(m.specialite for m in all_medecins).most_common():
        print(f"   {s:<30} {n}")
    print("\n📊 Par ville :")
    for v, n in Counter(m.ville for m in all_medecins).most_common():
        print(f"   {v:<20} {n}")


if __name__ == "__main__":
    main()
