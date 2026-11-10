"use client";
import { useEffect } from "react";
import { idiomaActual } from "@/lib/i18n";

/** Pone en <html lang> el idioma elegido (sirve a lectores de pantalla y traductores). */
export default function IdiomaHtml() {
  useEffect(() => { document.documentElement.lang = idiomaActual(); }, []);
  return null;
}
