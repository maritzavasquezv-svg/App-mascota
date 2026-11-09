"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, MapPin } from "lucide-react";
import { mapa } from "@/lib/app-datos";

const CONSEJOS: Record<string, string> = {
  "Se tragó algo o se está ahogando": "No le des de comer ni intentes sacarlo con la mano si no lo ves fácil.",
  "Posible intoxicación": "Si sabes qué comió, lleva el envase o una foto. No le provoques el vómito sin indicación del veterinario.",
  "Sangrado": "Presiona la herida con un paño limpio mientras vas en camino.",
  "Golpe o accidente": "Muévelo lo menos posible y sostenlo sobre una manta firme.",
};

export default function Emergencia() {
  const motivo = useSearchParams().get("motivo") ?? "";
  return (
    <div className="cuerpo entra">
      <div className="emer">
        <div className="emer-icono"><AlertTriangle size={34} /></div>
        <p className="emer-et">Emergencia</p>
        <h1>Llévalo al veterinario ahora</h1>
        {motivo && <p className="emer-sub"><b>{motivo}.</b> {CONSEJOS[motivo] ?? "Mantén la calma y sal de inmediato."}</p>}
      </div>
      <a className="cta rojo" href={mapa("veterinaria 24 horas cerca de mí")} target="_blank" rel="noopener noreferrer"><MapPin size={18} /> Buscar veterinaria 24 h cerca</a>
      <p className="nota" style={{ textAlign: "center" }}>Se abre en Google Maps con las veterinarias abiertas más cercanas.</p>
      <Link className="secundario" href="/inicio/consejero">Volver al Consejero</Link>
    </div>
  );
}
