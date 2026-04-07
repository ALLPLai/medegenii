import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Ensure doctor record exists
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: doctor } = await supabase
          .from("doctors")
          .select("id")
          .eq("id", user.id)
          .single()

        if (!doctor) {
          const { error: insertError } = await supabase.from("doctors").insert({
            id: user.id,
            email: user.email!,
            name: user.email!.split("@")[0] ?? "Docteur",
          })
          if (insertError) {
            return NextResponse.redirect(`${origin}/login?error=profile`)
          }
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
