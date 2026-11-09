import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import PlanElegido from "./PlanElegido";
import "../flujo.css";

export const metadata: Metadata = { title: "Crea tu cuenta · Kopeet" };

// Etapa 4 (cuentas con Supabase) reemplaza esta pantalla por el registro real.
export default function CrearCuenta() {
  return (
    <main className="flujo">
      <div className="marco">
        <div className="cuerpo entra">
          <h1>Crea tu cuenta</h1>
          <Suspense fallback={<p className="sub">Plan elegido: …</p>}><PlanElegido /></Suspense>
          <p className="aviso-prueba" style={{ marginTop: 16 }}>En construcción: el registro con correo se conecta en la etapa de cuentas (Supabase).</p>
          <div className="espacio" />
          <Link className="cta" href="/plan">Volver a mi plan</Link>
        </div>
      </div>
    </main>
  );
}
