import type { Metadata } from "next";
import Reembolsos from "@/components/legal/Reembolsos";

export const metadata: Metadata = { title: "Reembolsos y cancelación · Kopeet" };

export default function Pagina() {
  return <Reembolsos i="es" />;
}
