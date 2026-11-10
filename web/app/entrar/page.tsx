import type { Metadata } from "next";
import { Suspense } from "react";
import Entrar from "./Entrar";
import "../flujo.css";

export const metadata: Metadata = { title: "Entrar · Kopeet" };

export default function PaginaEntrar() {
  return (
    <main className="flujo">
      <div className="marco"><Suspense fallback={null}><Entrar /></Suspense></div>
    </main>
  );
}
