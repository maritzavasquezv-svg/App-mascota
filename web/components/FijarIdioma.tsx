"use client";
import { useEffect } from "react";
import { cambiarIdioma, idiomaActual, type Idioma } from "@/lib/i18n";

/** En páginas que ya tienen idioma propio (/, /en, /pt y legales): lo recuerda para el resto de la app. */
export default function FijarIdioma({ i }: { i: Idioma }) {
  useEffect(() => {
    if (idiomaActual() !== i || !document.cookie.includes("idioma=")) cambiarIdioma(i);
    else document.documentElement.lang = i;
  }, [i]);
  return null;
}
