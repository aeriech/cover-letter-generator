import type { Metadata } from "next";
import "./globals.css";
import AuthWrapper from "./AuthWrapper";

export const metadata: Metadata = {
  title: "Cover Letter Generator",
  description:
    "Generate tailored cover letters from your profile and a job description.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-panel-2 font-body text-text antialiased">
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}
