"use client";
import { useSyncExternalStore } from "react";

let fechaCliente: Date | null = null;
const sinCambios = () => () => {};
/** Fecha de hoy leída solo en el navegador (en el prerender del servidor es null). */
export function useHoy() { return useSyncExternalStore(sinCambios, () => (fechaCliente ??= new Date()), () => null); }
