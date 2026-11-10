import type { Metadata } from "next";
import Privacidad from "@/components/legal/Privacidad";

export const metadata: Metadata = { title: "Política de privacidade · Kopeet" };

export default function Pagina() {
  return <Privacidad i="pt" />;
}
