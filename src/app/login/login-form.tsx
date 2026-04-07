"use client"

import { useActionState } from "react"
import { signInWithMagicLink } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

function loginAction(_prev: { error?: string; success?: boolean } | null, formData: FormData) {
  return signInWithMagicLink(formData)
}

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null)

  if (state?.success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Vérifiez votre email</CardTitle>
          <CardDescription>
            Un lien de connexion a été envoyé à votre adresse email.
            Cliquez dessus pour accéder à votre tableau de bord.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>
          Entrez votre email pour recevoir un lien de connexion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="docteur@exemple.ma"
              required
              autoFocus
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Envoi en cours..." : "Recevoir le lien magique"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
