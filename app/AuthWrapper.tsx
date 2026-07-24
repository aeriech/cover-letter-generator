"use client";

import { AuthProvider } from "./components/AuthProvider";
import Header from "./components/Header";
import { type ReactNode } from "react";

export default function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      {children}
    </AuthProvider>
  );
}
