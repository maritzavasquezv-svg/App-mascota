import type { Metadata } from "next";
import Contacto from "@/components/legal/Contacto";

export const metadata: Metadata = { title: "Contacto · Kopeet" };

export default function Pagina() {
  return <Contacto i="es" />;
}
