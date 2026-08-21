import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({});
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({});
  }

  return NextResponse.json({
    fullName: profile.full_name ?? "",
    experienceSummary: profile.experience_summary ?? "",
    keySkills: profile.key_skills ?? "",
    formality: profile.formality ?? 7,
    friendliness: profile.friendliness ?? 5,
  });
}

export async function PUT(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { error } = await supabase.from("user_profiles").upsert(
    {
      user_id: user.id,
      full_name: body.fullName ?? "",
      experience_summary: body.experienceSummary ?? "",
      key_skills: body.keySkills ?? "",
      formality: body.formality ?? 7,
      friendliness: body.friendliness ?? 5,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
