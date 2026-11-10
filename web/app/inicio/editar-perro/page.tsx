import type { Metadata } from "next";
import { Suspense } from "react";
import EditarPerro from "./EditarPerro";

export const metadata: Metadata = { title: "Editar perro · Kopeet" };

export default function Pagina() {
  return <Suspense fallback={<p className="sub">Cargando…</p>}><EditarPerro /></Suspense>;
}
