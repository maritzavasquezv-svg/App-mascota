"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Siren } from "lucide-react";

/** Botón rojo de emergencia, siempre visible en toda la app (salvo en la propia pantalla de emergencia). */
export default function BotonEmergencia() {
  const ruta = usePathname();
  if (ruta.startsWith("/inicio/emergencia")) return null;
  return (
    <Link href="/inicio/emergencia" className="boton-sos" aria-label="Emergencia: qué hacer y veterinarias 24 horas">
      <Siren size={16} /> Emergencia
    </Link>
  );
}
