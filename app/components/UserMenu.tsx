"use client";

import { useAuth } from "./AuthProvider";

export default function UserMenu() {
  const { user, loading, signOut } = useAuth();

  if (loading) return null;
  if (!user) return null;

  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "User";

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block text-right">
        <p className="text-sm font-medium text-text leading-tight">
          {displayName}
        </p>
        <p className="text-xs text-muted/70">{user.email}</p>
      </div>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-8 w-8 rounded-full border border-border"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-panel-2 text-sm font-semibold text-text">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <button
        onClick={signOut}
        className="text-xs font-medium text-muted transition-all hover:text-danger"
      >
        Sign out
      </button>
    </div>
  );
}
