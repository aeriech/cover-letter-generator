"use client";

import AuthButtons from "./AuthButtons";
import UserMenu from "./UserMenu";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="border-b border-border bg-panel">
      <div className="mx-auto flex max-w-[1040px] items-center justify-between px-5 py-3 sm:px-8">
        <span className="text-base font-semibold tracking-tight text-text font-display">
          Cover Letter Generator
        </span>
        {!loading && (user ? <UserMenu /> : <AuthButtons />)}
      </div>
    </header>
  );
}
