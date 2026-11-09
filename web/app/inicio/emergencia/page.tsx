import type { Metadata } from "next";
import { Suspense } from "react";
import Emergencia from "./Emergencia";

export const metadata: Metadata = { title: "Emergencia · Kopeet" };

export default function PaginaEmergencia() {
  return <Suspense fallback={null}><Emergencia /></Suspense>;
}
