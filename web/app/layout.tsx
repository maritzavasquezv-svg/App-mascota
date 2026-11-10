import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import IdiomaHtml from "@/components/IdiomaHtml";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-poppins", display: "swap" });

export const metadata: Metadata = {
  title: "Kopeet AI · El plan diario de tu perro",
  description: "Sácale una foto a tu perro, responde 6 preguntas y recibe su Plan de Bienvenida: vacunas, comida y adaptación. Para mestizos, adoptados, cachorros y adultos.",
  icons: { icon: "/marca/isotipo-kopeet-180.png", apple: "/marca/isotipo-kopeet-180.png" },
};
export const viewport: Viewport = { themeColor: "#f3f6fb" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={poppins.variable}>
      <body><IdiomaHtml />{children}</body>
    </html>
  );
}
