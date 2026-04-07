"use client"

import { useActionState, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { updateDoctorProfile } from "./actions"
import { SPECIALTIES } from "@/config/specialties"
import type { Doctor } from "@/lib/types/database"

export function SettingsForm({ doctor }: { doctor: Doctor }) {
  const [state, action, isPending] = useActionState(updateDoctorProfile, null)
  const [specialty, setSpecialty] = useState(doctor.specialty || "generaliste")
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <input type="hidden" name="specialty" value={specialty} />

            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                name="name"
                defaultValue={doctor.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={doctor.phone ?? ""}
                placeholder="0612345678"
              />
            </div>

            <div className="space-y-2">
              <Label>Spécialité</Label>
              <Select value={specialty} onValueChange={(v) => setSpecialty(v ?? "generaliste")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une spécialité" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                name="city"
                defaultValue={doctor.city ?? ""}
                placeholder="Casablanca"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            {state?.success && (
              <p className="text-sm text-green-600">Profil mis à jour.</p>
            )}

            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connecté en tant que <strong>{doctor.email}</strong>
          </p>
          <Button variant="destructive" onClick={handleLogout}>
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
