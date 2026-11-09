import type { Metadata } from "next";
import { Suspense } from "react";
import Registro from "./Registro";
import "../flujo.css";

export const metadata: Metadata = { title: "Crea tu cuenta · Kopeet" };

export default function CrearCuenta() {
  return (
    <main className="flujo">
      <div className="marco">
        <Suspense fallback={null}><Registro /></Suspense>
      </div>
    </main>
  );
}
