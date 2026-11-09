import type { Metadata } from "next";
import Inicio from "./Inicio";
import "../flujo.css";

export const metadata: Metadata = { title: "Mi plan · Kopeet" };

export default function PaginaInicio() {
  return (
    <main className="flujo">
      <div className="marco"><Inicio /></div>
    </main>
  );
}
