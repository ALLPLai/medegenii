"""
scrape_avicenne.py — Pipeline complet : annuaire → site cabinet → email
======================================================================
Étape 1 : scrape Avicenne.ma (nom, spécialité, ville, site web, téléphone)
Étape 2 : pour chaque médecin avec un site → scrape la page /contact pour email
Étape 3 : pour les restants → Google dork via DuckDuckGo pour trouver email

Usage :
    pip install requests beautifulsoup4 lxml

    python scrape_avicenne.py --inspect              # voir le HTML d'Avicenne pour calibrer les sélecteurs
    python scrape_avicenne.py --dry-run              # lister les URLs sans scraper
    python scrape_avicenne.py --ville casablanca     # tester sur une ville
    python scrape_avicenne.py                        # pipeline complet → medecins.csv

Sortie : medecins_avicenne.csv (trié : email validé > email trouvé > téléphone > rien)
"""

import csv
import re
import time
import argparse
import sys
from collections import Counter
from dataclasses import dataclass, fields, asdict
from pathlib import Path
from typing import Iterator
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────

BASE_URL = "https://www.avicenne.ma"

SPECIALITES = {
    "medecin-generaliste": "Médecin généraliste",
    "cardiologue":         "Cardiologie",
    "dermatologue":        "Dermatologie",
    "gynecologue":         "Gynécologie",
    "pediatre":            "Pédiatrie",
}

VILLES = ["casablanca", "rabat", "marrakech", "tanger", "fes", "agadir"]

# ── Sélecteurs CSS — à ajuster après --inspect ──
SELECTORS = {
    "card":       "div.doctor-card, article.medecin, div.listing-item, div[class*='doctor'], div[class*='medecin']",
    "nom":        "h2, h3, .nom, .name, [class*='name'], [class*='nom']",
    "specialite": ".specialite, .specialty, [class*='specialite'], [class*='specialty']",
    "ville":      ".ville, .city, .location, [class*='ville'], [class*='city']",
    "cabinet":    ".cabinet, .clinic, [class*='cabinet'], [class*='clinic']",
    "next_page":  "a[rel='next'], .pagination .next a, a[aria-label='Suivant'], li.next a",
}

DELAY_ANNUAIRE   = 2.0   # délai entre pages annuaire (secondes)
DELAY_SITE_WEB   = 1.5   # délai entre appels aux sites cabinets
DELAY_DUCKDUCKGO = 4.0   # délai entre requêtes DuckDuckGo (important — sinon ban)
MAX_PAGES        = 20
OUTPUT_FILE      = Path("medecins_avicenne.csv")

EMAIL_RE = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE,
)

# Domaines génériques à exclure des emails scrapés sur sites web
EMAIL_BLACKLIST = {
    "exemple.com", "example.com", "votre@email.com", "info@example",
    "wixpress.com", "squarespace.com", "wordpress.com",
    "sentry.io", "googleapis.com", "cloudflare.com",
}


# ─────────────────────────────────────────────────────────────
# Modèle de données
# ─────────────────────────────────────────────────────────────

@dataclass
class Medecin:
    nom:            str
    specialite:     str
    ville:          str
    cabinet:        str
    telephone:      str
    email:          str       # email trouvé (vide si aucun)
    email_source:   str       # "site_cabinet" | "duckduckgo" | ""
    site_web:       str
    profil_avicenne: str
    facebook:       str
    taille:         str       # "petit cabinet (1-3)" | "clinique groupée (4-5)"
    priorite:       int       # 1 (email validé) > 2 (email trouvé) > 3 (tel) > 4 (rien)


# ─────────────────────────────────────────────────────────────
# Session HTTP commune
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


def get_soup(url: str, timeout: int = 12) -> BeautifulSoup | None:
    try:
        r = session.get(url, timeout=timeout, allow_redirects=True)
        r.raise_for_status()
        return BeautifulSoup(r.text, "lxml")
    except Exception as e:
        print(f"  ⚠️  {url} → {e}", file=sys.stderr)
        return None


# ─────────────────────────────────────────────────────────────
# Helpers extraction
# ─────────────────────────────────────────────────────────────

def first_text(tag, selector: str) -> str:
    el = tag.select_one(selector)
    return el.get_text(separator=" ", strip=True) if el else ""


def extract_phone(tag) -> str:
    a = tag.select_one("a[href^='tel:']")
    if a:
        return a["href"].replace("tel:", "").strip()
    raw = tag.get_text().replace(" ", "").replace(".", "").replace("-", "")
    m = re.search(r"(?:\+212|0)[5-7]\d{8}", raw)
    return m.group(0) if m else ""


def extract_site_facebook(tag) -> tuple[str, str]:
    """Retourne (site_web, facebook_url) depuis les liens d'une fiche."""
    site = facebook = ""
    for a in tag.select("a[href]"):
        href = a["href"].strip()
        if not href.startswith("http"):
            continue
        if "facebook.com" in href:
            facebook = href
        elif "avicenne.ma" not in href and "twitter.com" not in href:
            if not site:
                site = href
    return site, facebook


def extract_profil_url(tag) -> str:
    a = tag.select_one("a[href*='/medecin'], a[href*='/docteur'], a.voir-profil, a[class*='profil']")
    if not a:
        return ""
    href = a.get("href", "")
    return href if href.startswith("http") else urljoin(BASE_URL, href)


def estimer_taille(text: str) -> str:
    m = re.search(r"(\d+)\s*(?:médecins?|praticiens?|docteurs?)", text, re.I)
    if m:
        n = int(m.group(1))
        if n <= 3: return "petit cabinet (1-3)"
        if n <= 5: return "clinique groupée (4-5)"
        return f"grande structure ({n}+)"
    return "petit cabinet (1-3)"


def clean_emails(raw: set[str]) -> list[str]:
    """Filtre les emails de bruit (JS, CSS, images, domaines blacklistés)."""
    out = []
    for e in raw:
        e = e.lower().strip(".,;\"'")
        domain = e.split("@")[-1]
        if any(b in domain for b in EMAIL_BLACKLIST):
            continue
        if re.search(r"\.(png|jpg|gif|svg|css|js|woff)$", domain):
            continue
        if len(e) > 80 or " " in e:
            continue
        out.append(e)
    return out


def priorite(m: "Medecin") -> int:
    if m.email and m.email_source == "site_cabinet":
        return 1
    if m.email:
        return 2
    if m.telephone:
        return 3
    return 4


# ─────────────────────────────────────────────────────────────
# Étape 1 — Scraping Avicenne.ma
# ─────────────────────────────────────────────────────────────

def build_url(slug: str, ville: str, page: int = 1) -> str:
    base = f"{BASE_URL}/medecins/{slug}/{ville}"
    return base if page == 1 else f"{base}?page={page}"


def scrape_annuaire(slug: str, label: str, ville: str) -> Iterator[dict]:
    """Yield des dicts bruts depuis les pages de liste Avicenne."""
    print(f"\n  📍 {label} — {ville.capitalize()}")
    for page_num in range(1, MAX_PAGES + 1):
        url = build_url(slug, ville, page_num)
        print(f"     page {page_num} → {url}", end="")
        soup = get_soup(url)
        if not soup:
            break

        cards = soup.select(SELECTORS["card"])
        if not cards:
            print(f"  ← 0 fiches (ajuster SELECTORS['card'])")
            break

        count = 0
        for card in cards:
            nom = first_text(card, SELECTORS["nom"])
            if not nom:
                continue
            site, fb = extract_site_facebook(card)
            taille_text = card.get_text()
            yield {
                "nom":             nom,
                "specialite":      first_text(card, SELECTORS["specialite"]) or label,
                "ville":           first_text(card, SELECTORS["ville"]) or ville.capitalize(),
                "cabinet":         first_text(card, SELECTORS["cabinet"]),
                "telephone":       extract_phone(card),
                "site_web":        site,
                "facebook":        fb,
                "profil_avicenne": extract_profil_url(card),
                "taille":          estimer_taille(taille_text),
            }
            count += 1

        print(f"  ← {count} fiches")
        if not soup.select_one(SELECTORS["next_page"]):
            break
        time.sleep(DELAY_ANNUAIRE)


# ─────────────────────────────────────────────────────────────
# Étape 2 — Scraping du site cabinet → email
# ─────────────────────────────────────────────────────────────

CONTACT_PATHS = ["/contact", "/contact-us", "/contactez-nous", "/nous-contacter",
                 "/about", "/a-propos", "/informations", "/rdv", "/rendez-vous", "/"]


def scrape_email_from_site(site_url: str) -> str:
    """Cherche un email sur le site du cabinet (page contact en priorité)."""
    domain = urlparse(site_url).scheme + "://" + urlparse(site_url).netloc

    # D'abord essayer la page racine
    pages_to_try = [site_url]
    # Puis les chemins contact courants
    for path in CONTACT_PATHS[1:]:
        pages_to_try.append(domain.rstrip("/") + path)

    found_emails: set[str] = set()
    for url in pages_to_try:
        soup = get_soup(url)
        if not soup:
            continue
        # 1. Liens mailto:
        for a in soup.select("a[href^='mailto:']"):
            found_emails.add(a["href"].replace("mailto:", "").split("?")[0].strip())
        # 2. Regex dans le texte visible
        text = soup.get_text()
        found_emails.update(EMAIL_RE.findall(text))
        if found_emails:
            break
        time.sleep(0.5)

    cleaned = clean_emails(found_emails)
    return cleaned[0] if cleaned else ""


# ─────────────────────────────────────────────────────────────
# Étape 3 — DuckDuckGo dork → email
# ─────────────────────────────────────────────────────────────

DDG_URL = "https://html.duckduckgo.com/html/"


def duckduckgo_email(nom: str, specialite: str, ville: str) -> str:
    """
    Recherche DuckDuckGo : "Dr Nom" "casablanca" email
    Scrape les extraits de résultats pour trouver un email.
    """
    query = f'"{nom}" "{ville}" email OR "@gmail.com" OR "contact"'
    try:
        r = session.post(DDG_URL, data={"q": query}, timeout=15)
        r.raise_for_status()
    except Exception:
        return ""

    soup = BeautifulSoup(r.text, "lxml")
    snippets = " ".join(
        el.get_text() for el in soup.select(".result__snippet, .result__body, .result__url")
    )
    emails = clean_emails(set(EMAIL_RE.findall(snippets)))
    # Préférer les emails non-génériques
    for e in emails:
        domain = e.split("@")[-1]
        if domain not in ("gmail.com", "yahoo.fr", "hotmail.com", "outlook.com"):
            return e
    return emails[0] if emails else ""


# ─────────────────────────────────────────────────────────────
# Pipeline complet
# ─────────────────────────────────────────────────────────────

def run_pipeline(villes: list[str], specialites: dict[str, str]) -> list[Medecin]:
    # ── Étape 1 : annuaire ──
    print("\n═══ ÉTAPE 1 — Scraping Avicenne.ma ═══")
    raw_list: list[dict] = []
    seen: set[str] = set()
    for slug, label in specialites.items():
        for ville in villes:
            for doc in scrape_annuaire(slug, label, ville):
                uid = f"{doc['nom'].lower()}|{doc['ville'].lower()}"
                if uid not in seen:
                    seen.add(uid)
                    raw_list.append(doc)

    print(f"\n✅ {len(raw_list)} médecins uniques extraits de l'annuaire")

    # ── Étape 2 : email via site web ──
    with_site = [d for d in raw_list if d["site_web"]]
    print(f"\n═══ ÉTAPE 2 — Scraping sites cabinets ({len(with_site)} avec site web) ═══")
    email_map: dict[str, tuple[str, str]] = {}   # nom|ville → (email, source)

    for i, doc in enumerate(with_site, 1):
        uid = f"{doc['nom'].lower()}|{doc['ville'].lower()}"
        print(f"  [{i}/{len(with_site)}] {doc['nom']} → {doc['site_web']}", end=" ")
        email = scrape_email_from_site(doc["site_web"])
        if email:
            print(f"→ ✉️  {email}")
            email_map[uid] = (email, "site_cabinet")
        else:
            print("→ —")
        time.sleep(DELAY_SITE_WEB)

    # ── Étape 3 : DuckDuckGo pour les sans-email ──
    without_email = [d for d in raw_list
                     if f"{d['nom'].lower()}|{d['ville'].lower()}" not in email_map]
    print(f"\n═══ ÉTAPE 3 — DuckDuckGo dork ({len(without_email)} sans email trouvé) ═══")

    for i, doc in enumerate(without_email, 1):
        uid = f"{doc['nom'].lower()}|{doc['ville'].lower()}"
        print(f"  [{i}/{len(without_email)}] {doc['nom']} ({doc['ville']})", end=" ")
        email = duckduckgo_email(doc["nom"], doc["specialite"], doc["ville"])
        if email:
            print(f"→ ✉️  {email}")
            email_map[uid] = (email, "duckduckgo")
        else:
            print("→ —")
        time.sleep(DELAY_DUCKDUCKGO)

    # ── Assemblage final ──
    medecins: list[Medecin] = []
    for doc in raw_list:
        uid = f"{doc['nom'].lower()}|{doc['ville'].lower()}"
        email, source = email_map.get(uid, ("", ""))
        m = Medecin(
            nom=doc["nom"],
            specialite=doc["specialite"],
            ville=doc["ville"],
            cabinet=doc["cabinet"],
            telephone=doc["telephone"],
            email=email,
            email_source=source,
            site_web=doc["site_web"],
            profil_avicenne=doc["profil_avicenne"],
            facebook=doc["facebook"],
            taille=doc["taille"],
            priorite=0,
        )
        m.priorite = priorite(m)
        medecins.append(m)

    medecins.sort(key=lambda m: (m.priorite, m.ville, m.specialite))
    return medecins


# ─────────────────────────────────────────────────────────────
# Export CSV
# ─────────────────────────────────────────────────────────────

CSV_FIELDS = [f.name for f in fields(Medecin)]


def write_csv(medecins: list[Medecin], path: Path) -> None:
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        w.writeheader()
        for m in medecins:
            w.writerow(asdict(m))

    print(f"\n💾 {len(medecins)} lignes → {path}")
    p1 = sum(1 for m in medecins if m.priorite == 1)
    p2 = sum(1 for m in medecins if m.priorite == 2)
    p3 = sum(1 for m in medecins if m.priorite == 3)
    p4 = sum(1 for m in medecins if m.priorite == 4)
    print(f"   🟢 Priorité 1 (email site cabinet) : {p1}")
    print(f"   🟡 Priorité 2 (email DuckDuckGo)   : {p2}")
    print(f"   🟠 Priorité 3 (téléphone seulement): {p3}")
    print(f"   ⚪ Priorité 4 (aucun contact)       : {p4}")


# ─────────────────────────────────────────────────────────────
# Mode --inspect
# ─────────────────────────────────────────────────────────────

def inspect_mode(slug: str, ville: str) -> None:
    url = build_url(slug, ville)
    print(f"\n🔍 {url}\n")
    soup = get_soup(url)
    if not soup:
        return
    print(soup.body.prettify()[:5000] if soup.body else soup.prettify()[:5000])
    print("\n─── Classes CSS ───")
    classes = sorted({c for tag in soup.find_all(True) for c in tag.get("class", [])})
    print(", ".join(classes[:100]))


# ─────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser(description="Scraper médecins Avicenne.ma + recherche email")
    p.add_argument("--inspect",    action="store_true")
    p.add_argument("--dry-run",    action="store_true")
    p.add_argument("--ville",      help="Ex: casablanca")
    p.add_argument("--specialite", help="Ex: cardiologue")
    p.add_argument("--output",     default=str(OUTPUT_FILE))
    args = p.parse_args()

    villes = [args.ville] if args.ville else VILLES
    specs  = ({args.specialite: SPECIALITES[args.specialite]}
              if args.specialite and args.specialite in SPECIALITES
              else SPECIALITES)

    if args.inspect:
        slug = next(iter(specs))
        inspect_mode(slug, villes[0])
        return

    if args.dry_run:
        print("\nURLs qui seraient scrapées :\n")
        for slug in specs:
            for ville in villes:
                print(f"  {build_url(slug, ville)}")
        return

    medecins = run_pipeline(villes, specs)
    if not medecins:
        print("\n⚠️  Aucun résultat — lancer --inspect pour calibrer les sélecteurs CSS.")
        return

    write_csv(medecins, Path(args.output))

    print("\n📊 Par spécialité :")
    for spec, n in Counter(m.specialite for m in medecins).most_common():
        print(f"   {spec:<30} {n}")
    print("\n📊 Par ville :")
    for ville, n in Counter(m.ville for m in medecins).most_common():
        print(f"   {ville:<20} {n}")


if __name__ == "__main__":
    main()
