"use client";
// Idiomas de Kopeet: español (por defecto), inglés y portugués.
// El idioma se guarda en la cookie "idioma" (la lee también el servidor) y se elige solo la primera vez
// según el idioma del celular. Cada texto se escribe en los tres idiomas: t("Hola", "Hello", "Olá").
import { useCallback, useSyncExternalStore } from "react";
import { idiomaDeNavegador, type Idioma } from "./idiomas";

export { IDIOMAS, locale, tr, type Idioma, type Txt } from "./idiomas";
const oyentes = new Set<() => void>();

function leerCookie(): Idioma | null {
  const m = document.cookie.match(/(?:^|; )idioma=(es|en|pt)/);
  return (m?.[1] as Idioma) ?? null;
}

export function idiomaActual(): Idioma {
  if (typeof document === "undefined") return "es";
  return leerCookie() ?? idiomaDeNavegador(navigator.language);
}

export function cambiarIdioma(i: Idioma) {
  document.cookie = `idioma=${i}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = i;
  oyentes.forEach((f) => f());
}

function suscribir(f: () => void) { oyentes.add(f); return () => oyentes.delete(f); }

/** Devuelve el idioma activo y t(es, en, pt) para escribir cada texto en los tres idiomas. */
export function useT() {
  const idioma = useSyncExternalStore(suscribir, idiomaActual, () => "es" as Idioma);
  const t = useCallback((es: string, en: string, pt: string) => (idioma === "en" ? en : idioma === "pt" ? pt : es), [idioma]);
  return { idioma, t };
}
