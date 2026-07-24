import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const fullName =
          user.user_metadata?.full_name || user.user_metadata?.name || "";

        await supabase.from("user_profiles").upsert(
          {
            user_id: user.id,
            email: user.email ?? "",
            full_name: fullName,
          },
          { onConflict: "user_id", ignoreDuplicates: false }
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}?error=auth_error`);
}
