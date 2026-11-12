import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
import "./globals.css";
import "./interface.css";

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
    <html lang="pt-BR" data-theme="light" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
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
                  var preference = requested === 'light' || requested === 'dark' || requested === 'system' ? requested : saved === 'system' || saved === 'dark' ? saved : 'light';
                  var t = preference === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preference;
                  document.documentElement.setAttribute('data-theme-preference', preference);
                  document.documentElement.setAttribute('data-theme', t);
                  if (requested === 'light' || requested === 'dark' || requested === 'system') localStorage.setItem('pet_theme', preference);
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
