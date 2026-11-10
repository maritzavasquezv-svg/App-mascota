import type { Metadata } from "next";
import Ventas from "@/components/landing/Ventas";

export const metadata: Metadata = { title: "Kopeet AI · El plan diario de tu perro", description: "Sácale una foto a tu perro, responde 6 preguntas y recibe su Plan de Bienvenida: vacunas, comida y adaptación. Para mestizos, adoptados, cachorros y adultos." };

export default function Pagina() {
  return <Ventas i="es" />;
}
