// Datos del onboarding de Kopeet: tipos, opciones y el armado del Plan de Bienvenida.
// Las respuestas viven en el navegador (sessionStorage) hasta que la persona crea su cuenta (Etapa 4).
import { locale, tr, type Idioma, type Txt } from "./idiomas";

export type Origen = "refugio" | "calle" | "criador" | "regalo";
export type Edad = "cachorro" | "adulto" | "senior" | "no-se";
export type HoraPaseo = "manana" | "mediodia" | "tarde" | "noche";

export interface Respuestas {
  nombre: string;
  origen: Origen | null;
  edad: Edad | null;
  preocupaciones: string[];
  foto: string | null; // imagen reducida en data URL
  hora: HoraPaseo | null;
  avisos: "activados" | "rechazados" | "sin-respuesta";
}

export const VACIO: Respuestas = { nombre: "", origen: null, edad: null, preocupaciones: [], foto: null, hora: null, avisos: "sin-respuesta" };

export const ORIGENES: { id: Origen; texto: Txt }[] = [
  { id: "refugio", texto: { es: "Lo adopté de un refugio", en: "I adopted from a shelter", pt: "Adotei de um abrigo" } },
  { id: "calle", texto: { es: "Lo rescaté de la calle", en: "I rescued from the street", pt: "Resgatei da rua" } },
  { id: "criador", texto: { es: "De un criador o una tienda", en: "From a breeder or a store", pt: "De um criador ou loja" } },
  { id: "regalo", texto: { es: "Me lo regalaron", en: "It was a gift", pt: "Ganhei de presente" } },
];

export const EDADES: { id: Edad; texto: Txt; detalle: Txt }[] = [
  { id: "cachorro", texto: { es: "Cachorro", en: "Puppy", pt: "Filhote" }, detalle: { es: "Menos de 1 año", en: "Under 1 year", pt: "Menos de 1 ano" } },
  { id: "adulto", texto: { es: "Adulto", en: "Adult", pt: "Adulto" }, detalle: { es: "De 1 a 7 años", en: "1 to 7 years", pt: "De 1 a 7 anos" } },
  { id: "senior", texto: { es: "Senior", en: "Senior", pt: "Idoso" }, detalle: { es: "Más de 7 años", en: "Over 7 years", pt: "Mais de 7 anos" } },
  { id: "no-se", texto: { es: "Lo adopté y no sé", en: "Adopted, not sure", pt: "Adotei e não sei" }, detalle: { es: "La estimamos con su foto", en: "We estimate it from a photo", pt: "Estimamos pela foto" } },
];

// Frases de la ficha de avatar (aprobada el 9 nov 2026). Se guardan en español en la base; se traducen al mostrarlas.
export const PREOCUPACIONES = [
  "Vomita o tiene diarrea",
  "No come",
  "Lloró la primera noche",
  "No orina en su baño",
  "Se come sus heces",
  "Su primera vacuna",
  "No sé qué edad tiene",
  "¿Cuánto tarda en adaptarse?",
];
const TRAD_PREOCUPACIONES: Record<string, [en: string, pt: string]> = {
  "Vomita o tiene diarrea": ["Vomiting or diarrhea", "Vômito ou diarreia"],
  "No come": ["Won't eat", "Não come"],
  "Lloró la primera noche": ["Cried the first night", "Chorou na primeira noite"],
  "No orina en su baño": ["Doesn't urinate in its spot", "Não faz xixi no lugar certo"],
  "Se come sus heces": ["Eats its own feces", "Come as próprias fezes"],
  "Su primera vacuna": ["First vaccine", "Primeira vacina"],
  "No sé qué edad tiene": ["Not sure how old it is", "Não sei a idade"],
  "¿Cuánto tarda en adaptarse?": ["How long to settle in?", "Quanto tempo para se adaptar?"],
};
export const preocupacion = (p: string, idioma: Idioma = "es") =>
  idioma === "es" ? p : TRAD_PREOCUPACIONES[p]?.[idioma === "en" ? 0 : 1] ?? p;

export const HORAS: { id: HoraPaseo; texto: Txt; detalle: Txt; hora: string }[] = [
  { id: "manana", hora: "7:00", texto: { es: "En la mañana", en: "In the morning", pt: "De manhã" }, detalle: { es: "Cerca de las 7:00", en: "Around 7 AM", pt: "Por volta das 7:00" } },
  { id: "mediodia", hora: "13:00", texto: { es: "Al mediodía", en: "At noon", pt: "Ao meio-dia" }, detalle: { es: "Cerca de las 13:00", en: "Around 1 PM", pt: "Por volta das 13:00" } },
  { id: "tarde", hora: "18:00", texto: { es: "En la tarde", en: "In the afternoon", pt: "À tarde" }, detalle: { es: "Cerca de las 18:00", en: "Around 6 PM", pt: "Por volta das 18:00" } },
  { id: "noche", hora: "21:00", texto: { es: "En la noche", en: "At night", pt: "À noite" }, detalle: { es: "Cerca de las 21:00", en: "Around 9 PM", pt: "Por volta das 21:00" } },
];

const CLAVE = "kopeet-onboarding";

export function leer(): Respuestas {
  if (typeof window === "undefined") return VACIO;
  try {
    const t = window.sessionStorage.getItem(CLAVE);
    return t ? { ...VACIO, ...(JSON.parse(t) as Partial<Respuestas>) } : VACIO;
  } catch {
    return VACIO;
  }
}

export function guardar(r: Respuestas): void {
  try {
    window.sessionStorage.setItem(CLAVE, JSON.stringify(r));
  } catch {
    // Si la foto no cabe en el almacenamiento, se guarda sin ella.
    try { window.sessionStorage.setItem(CLAVE, JSON.stringify({ ...r, foto: null })); } catch { /* sin almacenamiento */ }
  }
}

export const nombreDe = (r: Respuestas, idioma: Idioma = "es") => r.nombre.trim() || tr(idioma, "tu perro", "your dog", "seu cão");

/** Cuántas respuestas dio la persona (para "Hecho con tus N respuestas"). */
export function contarRespuestas(r: Respuestas): number {
  return [r.nombre.trim(), r.origen, r.edad, r.preocupaciones.length ? 1 : null, r.foto, r.hora].filter(Boolean).length;
}

/** Minutos de ejercicio diario sugeridos según la etapa de vida (orientación general). */
export function minutosEjercicio(edad: Edad | null): number {
  switch (edad) {
    case "cachorro": return 25;
    case "senior": return 20;
    case "adulto": return 35;
    default: return 30;
  }
}

export function etiquetaEdad(edad: Edad | null, i: Idioma = "es"): string {
  switch (edad) {
    case "cachorro": return tr(i, "cachorro", "puppy", "filhote");
    case "adulto": return tr(i, "adulto", "adult", "adulto");
    case "senior": return tr(i, "senior", "senior", "idoso");
    default: return tr(i, "edad por estimar", "age to be estimated", "idade a estimar");
  }
}

export function etiquetaOrigen(o: Origen | null, i: Idioma = "es"): string {
  switch (o) {
    case "refugio": return tr(i, "adoptado de un refugio", "adopted from a shelter", "adotado de um abrigo");
    case "calle": return tr(i, "rescatado de la calle", "rescued from the street", "resgatado da rua");
    case "criador": return tr(i, "de criador o tienda", "from a breeder or store", "de criador ou loja");
    case "regalo": return tr(i, "llegó de regalo", "came as a gift", "veio de presente");
    default: return "";
  }
}

export function fechasPrueba(hoy = new Date(), idioma: Idioma = "es") {
  const fmt = new Intl.DateTimeFormat(locale(idioma), { day: "numeric", month: "long" });
  const dia = (n: number) => { const d = new Date(hoy); d.setDate(d.getDate() + n); return d; };
  return { hoy: fmt.format(hoy), aviso: fmt.format(dia(5)), cobro: fmt.format(dia(7)) };
}

/** Reduce una foto a máx. 640 px para guardarla y mostrarla rápido. */
export function reducirFoto(archivo: File, lado = 640): Promise<string> {
  return new Promise((ok, mal) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, lado / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      ok(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      const i = document.documentElement.lang as Idioma;
      mal(new Error(tr(i, "No pudimos leer esa imagen. Prueba con otra foto (JPG o PNG).", "We couldn't read that image. Try another photo (JPG or PNG).", "Não conseguimos ler essa imagem. Tente outra foto (JPG ou PNG).")));
    };
    img.src = url;
  });
}
