import type { Metadata } from "next";
import Entrar from "./Entrar";
import "../flujo.css";

export const metadata: Metadata = { title: "Entrar · Kopeet" };

export default function PaginaEntrar() {
  return (
    <main className="flujo">
      <div className="marco"><Entrar /></div>
    </main>
  );
}
