// Datos del onboarding de Kopeet: tipos, opciones y el armado del Plan de Bienvenida.
// Las respuestas viven en el navegador (sessionStorage) hasta que la persona crea su cuenta (Etapa 4).

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

export const ORIGENES: { id: Origen; texto: string }[] = [
  { id: "refugio", texto: "Lo adopté de un refugio" },
  { id: "calle", texto: "Lo rescaté de la calle" },
  { id: "criador", texto: "De un criador o una tienda" },
  { id: "regalo", texto: "Me lo regalaron" },
];

export const EDADES: { id: Edad; texto: string; detalle: string }[] = [
  { id: "cachorro", texto: "Cachorro", detalle: "Menos de 1 año" },
  { id: "adulto", texto: "Adulto", detalle: "De 1 a 7 años" },
  { id: "senior", texto: "Senior", detalle: "Más de 7 años" },
  { id: "no-se", texto: "Lo adopté y no sé", detalle: "La estimamos con su foto" },
];

// Frases de la ficha de avatar (aprobada el 9 nov 2026)
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

export const HORAS: { id: HoraPaseo; texto: string; detalle: string; hora: string }[] = [
  { id: "manana", texto: "En la mañana", detalle: "Cerca de las 7:00", hora: "7:00" },
  { id: "mediodia", texto: "Al mediodía", detalle: "Cerca de las 13:00", hora: "13:00" },
  { id: "tarde", texto: "En la tarde", detalle: "Cerca de las 18:00", hora: "18:00" },
  { id: "noche", texto: "En la noche", detalle: "Cerca de las 21:00", hora: "21:00" },
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

export const nombreDe = (r: Respuestas) => r.nombre.trim() || "tu perro";

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

export function etiquetaEdad(edad: Edad | null): string {
  switch (edad) {
    case "cachorro": return "cachorro";
    case "adulto": return "adulto";
    case "senior": return "senior";
    default: return "edad por estimar";
  }
}

export function etiquetaOrigen(o: Origen | null): string {
  switch (o) {
    case "refugio": return "adoptado de un refugio";
    case "calle": return "rescatado de la calle";
    case "criador": return "de criador o tienda";
    case "regalo": return "llegó de regalo";
    default: return "";
  }
}

const fmt = new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long" });
export function fechasPrueba(hoy = new Date()) {
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
    img.onerror = () => { URL.revokeObjectURL(url); mal(new Error("No pudimos leer esa imagen. Prueba con otra foto (JPG o PNG).")); };
    img.src = url;
  });
}
