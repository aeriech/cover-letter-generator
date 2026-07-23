import fs from "fs";
import path from "path";

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  experienceSummary: string;
  keySkills: string;
}

export function loadUserProfile(): UserProfile | null {
  try {
    const filePath = path.join(process.cwd(), "user-profile.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<UserProfile>;

    return {
      fullName: parsed.fullName ?? "",
      email: parsed.email ?? "",
      phone: parsed.phone ?? "",
      experienceSummary: parsed.experienceSummary ?? "",
      keySkills: parsed.keySkills ?? "",
    };
  } catch {
    return null;
  }
}
