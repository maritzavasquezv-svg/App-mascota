"use client";
import { usePathname, useRouter } from "next/navigation";
import { IDIOMAS, cambiarIdioma, useT, type Idioma } from "@/lib/i18n";

// Rutas que tienen versión propia por idioma: /en/... y /pt/... (página de ventas y legales).
const CON_VERSION = ["/", "/terminos", "/privacidad", "/reembolsos", "/cookies", "/aviso-ia", "/contacto"];

const NOMBRES: Record<Idioma, string> = { es: "Español", en: "English", pt: "Português" };

/** Banderas dibujadas (los emojis de bandera no se ven en Windows). Chile, EE. UU. y Brasil. */
function Bandera({ i }: { i: Idioma }) {
  if (i === "es") return (
    <svg className="bandera" viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" fill="#d52b1e" />
      <rect width="30" height="10" fill="#fff" />
      <rect width="10" height="10" fill="#0039a6" />
      <path d="M5 2.2l.8 2.3h2.4l-1.9 1.4.7 2.3L5 6.8 3 8.2l.7-2.3-1.9-1.4h2.4z" fill="#fff" />
    </svg>
  );
  if (i === "en") return (
    <svg className="bandera" viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((n) => <rect key={n} y={(n * 20) / 13} width="30" height={20 / 13} fill="#b22234" />)}
      <rect width="13" height={(20 / 13) * 7} fill="#3c3b6e" />
      {[[2.5, 2.2], [6.5, 2.2], [10.5, 2.2], [4.5, 5.4], [8.5, 5.4], [2.5, 8.6], [6.5, 8.6], [10.5, 8.6]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r=".75" fill="#fff" />)}
    </svg>
  );
  return (
    <svg className="bandera" viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" fill="#009c3b" />
      <path d="M15 2.5 27.5 10 15 17.5 2.5 10z" fill="#ffdf00" />
      <circle cx="15" cy="10" r="4.6" fill="#002776" />
      <path d="M10.6 9.1c3-.6 6.2-.2 8.8 1.4l-.3 1c-2.5-1.5-5.5-1.9-8.4-1.3z" fill="#fff" />
    </svg>
  );
}

/** Quita el prefijo /en o /pt de la ruta. */
function rutaBase(ruta: string) {
  const m = ruta.match(/^\/(en|pt)(\/.*)?$/);
  return m ? m[2] || "/" : ruta;
}

/** Botón con bandera ES / EN / PT. En la página de ventas y en lo legal también cambia de página. */
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
        <button key={i} type="button" aria-pressed={idioma === i} aria-label={NOMBRES[i]} title={NOMBRES[i]} lang={i} onClick={() => elegir(i)}>
          <Bandera i={i} /><span className="cod">{i.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
