import type { Metadata } from "next";
import Reembolsos from "@/components/legal/Reembolsos";

export const metadata: Metadata = { title: "Refunds and cancellation · Kopeet" };

export default function Pagina() {
  return <Reembolsos i="en" />;
}
