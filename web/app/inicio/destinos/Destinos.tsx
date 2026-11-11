"use client";
import { ExternalLink } from "lucide-react";
import { mapa } from "@/lib/app-datos";
import { useT, type Txt } from "@/lib/i18n";
import { registrarEvento } from "@/lib/eventos";

interface Lugar { emoji: string; nombre: Txt; detalle: Txt; busqueda: Txt }
const GRUPOS: { titulo: Txt; lugares: Lugar[] }[] = [
  { titulo: { es: "Para pasear y jugar", en: "To walk and play", pt: "Para passear e brincar" }, lugares: [
    { emoji: "🌳", nombre: { es: "Parques para perros", en: "Dog parks", pt: "Parques para cães" }, detalle: { es: "Con zona para correr suelto", en: "With an off-leash area", pt: "Com área para correr solto" }, busqueda: { es: "parque para perros cerca de mí", en: "dog park near me", pt: "parque para cachorros perto de mim" } },
    { emoji: "🏖️", nombre: { es: "Playas y lugares al aire libre", en: "Beaches and outdoor spots", pt: "Praias e lugares ao ar livre" }, detalle: { es: "Que aceptan perros", en: "That welcome dogs", pt: "Que aceitam cães" }, busqueda: { es: "playa pet friendly cerca de mí", en: "dog friendly beach near me", pt: "praia pet friendly perto de mim" } },
    { emoji: "🥾", nombre: { es: "Senderos y cerros", en: "Trails and hills", pt: "Trilhas e morros" }, detalle: { es: "Para paseos largos", en: "For long walks", pt: "Para passeios longos" }, busqueda: { es: "sendero pet friendly cerca de mí", en: "dog friendly trail near me", pt: "trilha pet friendly perto de mim" } },
  ] },
  { titulo: { es: "Para salir con tu perro", en: "To go out with your dog", pt: "Para sair com seu cão" }, lugares: [
    { emoji: "☕", nombre: { es: "Cafés y restaurantes", en: "Cafés and restaurants", pt: "Cafés e restaurantes" }, detalle: { es: "Que aceptan perros", en: "That welcome dogs", pt: "Que aceitam cães" }, busqueda: { es: "café pet friendly cerca de mí", en: "dog friendly cafe near me", pt: "café pet friendly perto de mim" } },
    { emoji: "🏨", nombre: { es: "Hoteles y alojamientos", en: "Hotels and stays", pt: "Hotéis e hospedagens" }, detalle: { es: "Para viajar con él", en: "To travel together", pt: "Para viajar com ele" }, busqueda: { es: "hotel pet friendly cerca de mí", en: "pet friendly hotel near me", pt: "hotel pet friendly perto de mim" } },
  ] },
  { titulo: { es: "Para su cuidado", en: "For their care", pt: "Para o cuidado dele" }, lugares: [
    { emoji: "🏥", nombre: { es: "Veterinarias 24 horas", en: "24-hour vets", pt: "Veterinárias 24 horas" }, detalle: { es: "Abiertas ahora", en: "Open now", pt: "Abertas agora" }, busqueda: { es: "veterinaria 24 horas cerca de mí", en: "24 hour emergency vet near me", pt: "veterinária 24 horas perto de mim" } },
    { emoji: "✂️", nombre: { es: "Peluquerías caninas", en: "Dog groomers", pt: "Pet shops de banho e tosa" }, detalle: { es: "Baño y corte", en: "Bath and trim", pt: "Banho e tosa" }, busqueda: { es: "peluquería canina cerca de mí", en: "dog groomer near me", pt: "banho e tosa perto de mim" } },
    { emoji: "🦴", nombre: { es: "Tiendas de mascotas", en: "Pet stores", pt: "Lojas de animais" }, detalle: { es: "Comida y accesorios", en: "Food and accessories", pt: "Ração e acessórios" }, busqueda: { es: "tienda de mascotas cerca de mí", en: "pet store near me", pt: "pet shop perto de mim" } },
    { emoji: "🏠", nombre: { es: "Guarderías y paseadores", en: "Daycare and dog walkers", pt: "Creches e passeadores" }, detalle: { es: "Cuando no puedes estar", en: "When you can't be there", pt: "Quando você não pode estar" }, busqueda: { es: "guardería canina cerca de mí", en: "dog daycare near me", pt: "creche para cachorro perto de mim" } },
  ] },
];

export default function Destinos() {
  const { t, idioma } = useT();
  return (
    <div className="cuerpo entra">
      <p className="fecha-hoy">{t("Destinos", "Places", "Destinos")}</p>
      <h1>{t("Lugares para ir con tu perro", "Places to go with your dog", "Lugares para ir com seu cão")}</h1>
      <p className="sub">{t("Cerca de ti, en Google Maps.", "Near you, on Google Maps.", "Perto de você, no Google Maps.")}</p>
      {GRUPOS.map((g) => (
        <section className="tarjeta" key={g.titulo.es}>
          <p className="tarjeta-tit"><span>{g.titulo[idioma]}</span></p>
          <div className="destinos">
            {g.lugares.map((l) => (
              <a key={l.nombre.es} href={mapa(l.busqueda[idioma])} target="_blank" rel="noopener noreferrer" onClick={() => registrarEvento("destino_abierto", { lugar: l.emoji })}>
                <span className="dest-emoji" aria-hidden="true">{l.emoji}</span>
                <span className="dest-tx"><b>{l.nombre[idioma]}</b><em>{l.detalle[idioma]}</em></span>
                <ExternalLink size={15} />
              </a>
            ))}
          </div>
        </section>
      ))}
      <p className="nota" style={{ textAlign: "center" }}>{t("Se abre Google Maps con tu ubicación. Antes de ir, confirma que el lugar acepte perros.", "Google Maps opens with your location. Before going, confirm the place accepts dogs.", "O Google Maps abre com sua localização. Antes de ir, confirme se o lugar aceita cães.")}</p>
    </div>
  );
}
