import type { Metadata } from "next";
import AvisoIA from "@/components/legal/AvisoIA";

export const metadata: Metadata = { title: "Aviso sobre la IA · Kopeet" };

export default function Pagina() {
  return <AvisoIA i="es" />;
}
