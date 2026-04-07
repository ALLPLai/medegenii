"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "L'adresse email est requise." }
  }

  const supabase = await createClient()
  const headersList = await headers()

  // Build origin from headers — origin header may be missing in some contexts
  const origin =
    headersList.get("origin") ||
    `${headersList.get("x-forwarded-proto") ?? "http"}://${headersList.get("host") ?? "localhost:3000"}`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes("rate limit")) {
      return { error: "Trop de tentatives. Attendez quelques minutes avant de réessayer." }
    }
    return { error: `Erreur : ${error.message}` }
  }

  return { success: true }
}
