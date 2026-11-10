import type { Metadata } from "next";
import Contacto from "@/components/legal/Contacto";

export const metadata: Metadata = { title: "Contact · Kopeet" };

export default function Pagina() {
  return <Contacto i="en" />;
}
