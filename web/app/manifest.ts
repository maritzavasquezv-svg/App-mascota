import type { MetadataRoute } from "next";

/** Permite instalar Kopeet en la pantalla de inicio (en iPhone es necesario para recibir avisos). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kopeet AI · El plan diario de tu perro",
    short_name: "Kopeet",
    description: "El plan diario de tu perro: rutina, salud, avisos y un consejero 24 horas.",
    start_url: "/inicio",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2f6bff",
    lang: "es",
    icons: [
      { src: "/marca/isotipo-kopeet-180.png", sizes: "180x180", type: "image/png" },
      { src: "/marca/isotipo-kopeet-512.png", sizes: "512x512", type: "image/png" },
      { src: "/marca/isotipo-kopeet-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
