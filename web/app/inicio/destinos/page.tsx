import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { mapa } from "@/lib/app-datos";

export const metadata: Metadata = { title: "Destinos · Kopeet" };

const GRUPOS: { titulo: string; lugares: { emoji: string; nombre: string; detalle: string; busqueda: string }[] }[] = [
  { titulo: "Para pasear y jugar", lugares: [
    { emoji: "🌳", nombre: "Parques para perros", detalle: "Con zona para correr suelto", busqueda: "parque para perros cerca de mí" },
    { emoji: "🏖️", nombre: "Playas y lugares al aire libre", detalle: "Que aceptan perros", busqueda: "playa pet friendly cerca de mí" },
    { emoji: "🥾", nombre: "Senderos y cerros", detalle: "Para paseos largos", busqueda: "sendero pet friendly cerca de mí" },
  ] },
  { titulo: "Para salir con tu perro", lugares: [
    { emoji: "☕", nombre: "Cafés y restaurantes", detalle: "Que aceptan perros", busqueda: "café pet friendly cerca de mí" },
    { emoji: "🏨", nombre: "Hoteles y alojamientos", detalle: "Para viajar con él", busqueda: "hotel pet friendly cerca de mí" },
  ] },
  { titulo: "Para su cuidado", lugares: [
    { emoji: "🏥", nombre: "Veterinarias 24 horas", detalle: "Abiertas ahora", busqueda: "veterinaria 24 horas cerca de mí" },
    { emoji: "✂️", nombre: "Peluquerías caninas", detalle: "Baño y corte", busqueda: "peluquería canina cerca de mí" },
    { emoji: "🦴", nombre: "Tiendas de mascotas", detalle: "Comida y accesorios", busqueda: "tienda de mascotas cerca de mí" },
    { emoji: "🏠", nombre: "Guarderías y paseadores", detalle: "Cuando no puedes estar", busqueda: "guardería canina cerca de mí" },
  ] },
];

export default function Destinos() {
  return (
    <div className="cuerpo entra">
      <p className="fecha-hoy">Destinos</p>
      <h1>Lugares para ir con tu perro</h1>
      <p className="sub">Cerca de ti, en Google Maps.</p>
      {GRUPOS.map((g) => (
        <section className="tarjeta" key={g.titulo}>
          <p className="tarjeta-tit"><span>{g.titulo}</span></p>
          <div className="destinos">
            {g.lugares.map((l) => (
              <a key={l.nombre} href={mapa(l.busqueda)} target="_blank" rel="noopener noreferrer">
                <span className="dest-emoji" aria-hidden="true">{l.emoji}</span>
                <span className="dest-tx"><b>{l.nombre}</b><em>{l.detalle}</em></span>
                <ExternalLink size={15} />
              </a>
            ))}
          </div>
        </section>
      ))}
      <p className="nota" style={{ textAlign: "center" }}>Se abre Google Maps con tu ubicación. Antes de ir, confirma que el lugar acepte perros.</p>
    </div>
  );
}
