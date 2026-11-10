import type { Metadata } from "next";
import Ventas from "@/components/landing/Ventas";

export const metadata: Metadata = { title: "Kopeet AI · O plano diário do seu cão", description: "Tire uma foto do seu cão, responda 6 perguntas e receba o Plano de Boas-vindas: vacinas, comida e adaptação. Para vira-latas, adotados, filhotes e adultos." };

export default function Pagina() {
  return <Ventas i="pt" />;
}
