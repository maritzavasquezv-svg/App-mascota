import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { clienteConSesion } from "@/lib/supabase/servidor";
import PanelAdmin from "./PanelAdmin";
import "../flujo.css";
import "./admin.css";

export const metadata: Metadata = { title: "Panel · Kopeet", robots: { index: false, follow: false } };

/** Verificación EN EL SERVIDOR: si no es administradora, no se entrega nada del panel. */
async function Guardia() {
  const supabase = await clienteConSesion();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: admin } = user ? await supabase.rpc("es_admin") : { data: false };
  if (!admin) {
    return (
      <div className="cuerpo entra">
        <h1>Esta página es privada</h1>
        <p className="sub">Solo la administración de Kopeet puede verla.</p>
        <Link className="cta azul" href="/inicio">Volver a la app</Link>
      </div>
    );
  }
  return <PanelAdmin correo={user!.email ?? ""} />;
}

export default function PaginaAdmin() {
  return (
    <main className="panel-admin">
      <Suspense fallback={<p className="pa-cargando">Cargando el panel…</p>}>
        <Guardia />
      </Suspense>
    </main>
  );
}
