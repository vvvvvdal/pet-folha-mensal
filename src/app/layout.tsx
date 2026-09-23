import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "PET-Saúde Clima UFG: Folha de Frequência Mensal",
  description: "Gestão e emissão da folha de frequência mensal para bolsistas do PET-Saúde Clima (SMS Goiânia, SES Goiás e UFG).",
  icons: {
    icon: "/images/avatar-pet-clima.png"
  }
};

import { DialogProvider } from "@/context/DialogContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <Script
          id="pet-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var p = new URLSearchParams(window.location.search);
                  var t = p.get('theme') || localStorage.getItem('pet_theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', t);
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <DialogProvider>
          {children}
        </DialogProvider>
      </body>
    </html>
  );
}
