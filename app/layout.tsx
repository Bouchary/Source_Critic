import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Source Critic V2",
  description:
    "Outil d’analyse critique des sources, lecture argumentée, import PDF et historique local.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}