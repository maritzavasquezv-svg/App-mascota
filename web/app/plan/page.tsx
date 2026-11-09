import type { Metadata } from "next";
import { PaywallCliente } from "@/components/SoloCliente";
import "../flujo.css";

export const metadata: Metadata = { title: "Tu Plan de Bienvenida · Kopeet" };

export default function Plan() {
  return <PaywallCliente />;
}
