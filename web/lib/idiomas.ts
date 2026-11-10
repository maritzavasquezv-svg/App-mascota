// Lo común a servidor y navegador sobre idiomas (sin React).
export type Idioma = "es" | "en" | "pt";
export const IDIOMAS: Idioma[] = ["es", "en", "pt"];

/** Un texto en los tres idiomas. */
export type Txt = Record<Idioma, string>;

export const esIdioma = (x: unknown): x is Idioma => x === "es" || x === "en" || x === "pt";

/** Elige idioma a partir de "es-CL", "pt-BR", "en-US", etc. Si no es ninguno, inglés. */
export function idiomaDeNavegador(lengua: string | undefined | null): Idioma {
  const l = (lengua ?? "").toLowerCase();
  if (!l || l.startsWith("es")) return "es";
  if (l.startsWith("pt")) return "pt";
  return "en";
}

/** Idioma de una petición al servidor: el que manda la app, si no la cookie, si no el del navegador. */
export function idiomaDePeticion(req: { cookies: { get(n: string): { value: string } | undefined }; headers: Headers }, pedido?: unknown): Idioma {
  if (esIdioma(pedido)) return pedido;
  const c = req.cookies.get("idioma")?.value;
  if (esIdioma(c)) return c;
  return idiomaDeNavegador(req.headers.get("accept-language"));
}

export const NOMBRE_IDIOMA: Record<Idioma, string> = {
  es: "español neutro latinoamericano, con tuteo",
  en: "English (simple, friendly, American spelling)",
  pt: "português do Brasil, com linguagem simples e próxima",
};

/** Fechas y números con el formato del idioma. */
export const locale = (i: Idioma) => (i === "en" ? "en-US" : i === "pt" ? "pt-BR" : "es-CL");

/** Elige el texto de un idioma: tr(i, "Hola", "Hello", "Olá"). Útil fuera de componentes (API, datos). */
export const tr = (i: Idioma, es: string, en: string, pt: string) => (i === "en" ? en : i === "pt" ? pt : es);
