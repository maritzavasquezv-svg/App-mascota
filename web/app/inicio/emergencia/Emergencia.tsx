"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, MapPin, Phone } from "lucide-react";
import { mapa } from "@/lib/app-datos";

const CONSEJOS: Record<string, string> = {
  "Se tragó algo o se está ahogando": "No le des de comer ni intentes sacarlo con la mano si no lo ves fácil.",
  "Posible intoxicación": "Si sabes qué comió, lleva el envase o una foto. No le provoques el vómito sin indicación del veterinario.",
  "Sangrado": "Presiona la herida con un paño limpio mientras vas en camino.",
  "Golpe o accidente": "Muévelo lo menos posible y sostenlo sobre una manta firme.",
};

const SENALES = [
  "Se tragó un objeto o está atorado",
  "Le cuesta respirar o tiene las encías moradas",
  "Convulsiones o no reacciona",
  "Comió chocolate, uvas, cebolla, xilitol, raticida o medicamentos",
  "Sangrado que no para",
  "Golpe fuerte, caída o atropello",
  "Panza hinchada y dura, con arcadas sin vomitar",
  "Vómitos o diarrea con sangre",
];

export default function Emergencia() {
  const motivo = useSearchParams().get("motivo") ?? "";
  return (
    <div className="cuerpo entra">
      <div className="emer">
        <div className="emer-icono"><AlertTriangle size={34} /></div>
        <p className="emer-et">Emergencia</p>
        <h1>{motivo ? "Llévalo al veterinario ahora" : "¿Es una emergencia?"}</h1>
        {motivo
          ? <p className="emer-sub"><b>{motivo}.</b> {CONSEJOS[motivo] ?? "Mantén la calma y sal de inmediato."}</p>
          : <p className="emer-sub">Si ves cualquiera de estas señales, <b>ve al veterinario de inmediato</b>. No esperes.</p>}
      </div>
      <a className="cta rojo" href={mapa("veterinaria 24 horas cerca de mí")} target="_blank" rel="noopener noreferrer"><MapPin size={18} /> Buscar veterinaria 24 h cerca</a>
      <p className="nota" style={{ textAlign: "center" }}>Se abre en Google Maps con las veterinarias más cercanas. Desde ahí puedes llamar.</p>
      {!motivo && (
        <section className="tarjeta">
          <p className="tarjeta-tit"><span><Phone size={15} /> Señales de emergencia</span></p>
          <ul className="senales">{SENALES.map((s) => <li key={s}>{s}</li>)}</ul>
        </section>
      )}
      <Link className="secundario" href="/inicio/consejero">¿No es tan grave? Pregúntale al Consejero</Link>
    </div>
  );
}
