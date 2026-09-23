import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PET-Saúde Clima UFG — Folha de Frequência Mensal",
  description: "Gestão e emissão da folha de frequência mensal para bolsistas do PET-Saúde Clima (SMS Goiânia, SES Goiás e UFG).",
  icons: {
    icon: "/images/logo-pet-clima.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="gentle-dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
