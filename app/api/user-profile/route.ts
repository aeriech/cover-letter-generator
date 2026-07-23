import { NextResponse } from "next/server";
import { loadUserProfile } from "@/lib/userProfile";

export async function GET() {
  const profile = loadUserProfile();
  return NextResponse.json(profile ?? {});
}
