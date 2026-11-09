import type { Metadata } from "next";
import Inicio from "./Inicio";

export const metadata: Metadata = { title: "Hoy · Kopeet" };

export default function PaginaInicio() {
  return <Inicio />;
}
