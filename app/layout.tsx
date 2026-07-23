import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cover Letter Generator",
  description: "Generate tailored cover letters from your profile and a job description.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
