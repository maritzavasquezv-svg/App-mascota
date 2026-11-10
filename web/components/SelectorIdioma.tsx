"use client";
import { usePathname, useRouter } from "next/navigation";
import { IDIOMAS, cambiarIdioma, useT, type Idioma } from "@/lib/i18n";

// Rutas que tienen versión propia por idioma: /en/... y /pt/... (página de ventas y legales).
const CON_VERSION = ["/", "/terminos", "/privacidad", "/reembolsos", "/contacto"];

/** Quita el prefijo /en o /pt de la ruta. */
function rutaBase(ruta: string) {
  const m = ruta.match(/^\/(en|pt)(\/.*)?$/);
  return m ? m[2] || "/" : ruta;
}

/** Botón ES / EN / PT. En la página de ventas y en lo legal también cambia de página. */
export default function SelectorIdioma({ claro = false }: { claro?: boolean }) {
  const { idioma } = useT();
  const ruta = usePathname();
  const router = useRouter();

  function elegir(i: Idioma) {
    cambiarIdioma(i);
    const base = rutaBase(ruta);
    if (CON_VERSION.includes(base)) {
      const destino = i === "es" ? base : `/${i}${base === "/" ? "" : base}`;
      if (destino !== ruta) { router.push(destino); return; }
    }
    router.refresh();
  }

  return (
    <div className={`selector-idioma${claro ? " claro" : ""}`} role="group" aria-label="Idioma / Language / Idioma">
      {IDIOMAS.map((i) => (
        <button key={i} type="button" aria-pressed={idioma === i} onClick={() => elegir(i)}>{i.toUpperCase()}</button>
      ))}
    </div>
  );
}
