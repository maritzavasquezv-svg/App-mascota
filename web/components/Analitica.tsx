"use client";
import { useEffect } from "react";
import { capturarOrigen, registrarEvento, type NombreEvento } from "@/lib/eventos";

/** En el layout: recuerda el canal de origen de la primera visita. */
export function CapturaOrigen() {
  useEffect(() => { capturarOrigen(); }, []);
  return null;
}

/** Registra un evento al abrir una pantalla. */
export function EventoAlAbrir({ nombre }: { nombre: NombreEvento }) {
  useEffect(() => { registrarEvento(nombre); }, [nombre]);
  return null;
}
