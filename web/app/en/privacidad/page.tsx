import type { Metadata } from "next";
import Privacidad from "@/components/legal/Privacidad";

export const metadata: Metadata = { title: "Privacy policy · Kopeet" };

export default function Pagina() {
  return <Privacidad i="en" />;
}
