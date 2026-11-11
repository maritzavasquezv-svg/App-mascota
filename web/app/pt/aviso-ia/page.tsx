import type { Metadata } from "next";
import AvisoIA from "@/components/legal/AvisoIA";

export const metadata: Metadata = { title: "Aviso sobre a IA · Kopeet" };

export default function Pagina() {
  return <AvisoIA i="pt" />;
}
