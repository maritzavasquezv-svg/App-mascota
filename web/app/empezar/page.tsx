import type { Metadata } from "next";
import { OnboardingCliente } from "@/components/SoloCliente";
import "../flujo.css";

export const metadata: Metadata = { title: "Crea el plan de tu perro · Kopeet" };

export default function Empezar() {
  return <OnboardingCliente />;
}
