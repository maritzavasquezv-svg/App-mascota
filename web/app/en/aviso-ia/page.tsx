import type { Metadata } from "next";
import AvisoIA from "@/components/legal/AvisoIA";

export const metadata: Metadata = { title: "AI notice · Kopeet" };

export default function Pagina() {
  return <AvisoIA i="en" />;
}
