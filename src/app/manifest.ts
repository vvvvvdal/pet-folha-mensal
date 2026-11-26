import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PET Folha Mensal",
    short_name: "PET Folha Mensal",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f8f6",
    theme_color: "#f6f8f6",
    icons: [
      { src: "/icons/pet-folha-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/pet-folha-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/pet-folha-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
