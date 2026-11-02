import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "PET-Saúde Clima UFG: Folha de Frequência Mensal",
  description:
    "Gestão e emissão da folha de frequência mensal para bolsistas do PET-Saúde Clima (SMS Goiânia, SES Goiás e UFG).",
  icons: {
    icon: "/images/avatar-pet-clima.png",
  },
};

import { DialogProvider } from "@/context/DialogContext";
import { Analytics } from "@vercel/analytics/next";

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
                  var requested = p.get('theme');
                  var saved = localStorage.getItem('pet_theme');
                  var t = requested === 'light' || requested === 'dark' ? requested : saved === 'light' ? 'light' : 'dark';
                  document.documentElement.setAttribute('data-theme', t);
                  if (requested === 'light' || requested === 'dark') localStorage.setItem('pet_theme', t);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <DialogProvider>{children}</DialogProvider>
        <Analytics />
      </body>
    </html>
  );
}
