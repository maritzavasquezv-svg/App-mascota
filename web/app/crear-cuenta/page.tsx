import type { Metadata } from "next";
import Link from "next/link";
import "../flujo.css";

export const metadata: Metadata = { title: "Crea tu cuenta · Kopeet" };

// Etapa 4 (cuentas con Supabase) reemplaza esta pantalla por el registro real.
export default async function CrearCuenta({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  return (
    <main className="flujo">
      <div className="marco">
        <div className="cuerpo entra">
          <h1>Crea tu cuenta</h1>
          <p className="sub">Plan elegido: <b>{plan === "mensual" ? "Mensual · US$6,99" : "Anual · US$4,17 al mes"}</b>.</p>
          <p className="aviso-prueba" style={{ marginTop: 16 }}>En construcción: el registro con correo se conecta en la etapa de cuentas (Supabase).</p>
          <div className="espacio" />
          <Link className="cta" href="/plan">Volver a mi plan</Link>
        </div>
      </div>
    </main>
  );
}
