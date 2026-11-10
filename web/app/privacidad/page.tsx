import type { Metadata } from "next";
import Privacidad from "@/components/legal/Privacidad";

export const metadata: Metadata = { title: "Política de privacidad · Kopeet" };

export default function Pagina() {
  return <Privacidad i="es" />;
}
