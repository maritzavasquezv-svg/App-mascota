// Lógica de la app por dentro: perros, registros del día, rachas, premios y adaptación.
import type { Edad, Origen } from "@/lib/onboarding";

export interface Perro { id: string; nombre: string; origen: Origen | null; edad: Edad | null; preocupaciones: string[]; foto_ruta: string | null; creado_en: string; estimacion?: { mezcla: string; confianza: string; etapa: string; edad_aprox: string; tamano_adulto: string; peso_adulto_kg: string; nota: string } | null }
export interface Registro { id: string; perro_id: string; tipo: "ejercicio" | "bano"; minutos: number | null; fecha: string }
export interface EventoSalud { id: string; perro_id: string; tipo: "vacuna" | "desparasitacion" | "control" | "otro"; titulo: string; fecha: string; hecho: boolean }

/** Fecha local de hoy en formato AAAA-MM-DD. */
export function hoyISO(d = new Date()): string {
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function sumarDias(iso: string, n: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  return hoyISO(new Date(a, m - 1, d + n));
}

/** Días seguidos con al menos un registro del tipo (cuenta desde hoy, o desde ayer si hoy aún no hay). */
export function racha(registros: Registro[], tipo: Registro["tipo"], hoy = hoyISO()): number {
  const dias = new Set(registros.filter((r) => r.tipo === tipo).map((r) => r.fecha));
  let dia = dias.has(hoy) ? hoy : sumarDias(hoy, -1);
  let n = 0;
  while (dias.has(dia)) { n++; dia = sumarDias(dia, -1); }
  return n;
}

export const minutosDelDia = (registros: Registro[], fecha = hoyISO()) =>
  registros.filter((r) => r.tipo === "ejercicio" && r.fecha === fecha).reduce((s, r) => s + (r.minutos ?? 0), 0);

/** Días desde que el perro llegó a Kopeet (día 1 = el primer día). */
export function diasEnCasa(perro: Perro, hoy = new Date()): number {
  const ini = new Date(perro.creado_en); ini.setHours(0, 0, 0, 0);
  const h = new Date(hoy); h.setHours(0, 0, 0, 0);
  return Math.max(1, Math.round((h.getTime() - ini.getTime()) / 86400000) + 1);
}

export interface Premio { id: string; nombre: string; detalle: string; ganado: boolean; avance: string }
export function premios(registros: Registro[], eventos: EventoSalud[], metaMin: number): Premio[] {
  const ejercicioDias = new Set(registros.filter((r) => r.tipo === "ejercicio").map((r) => r.fecha));
  const rEj = racha(registros, "ejercicio");
  const rBano = racha(registros, "bano");
  const diaConMeta = [...ejercicioDias].some((f) => minutosDelDia(registros, f) >= metaMin);
  const control = eventos.some((e) => e.tipo === "control" && e.hecho);
  const vacuna = eventos.some((e) => e.tipo === "vacuna" && e.hecho);
  return [
    { id: "primer-paseo", nombre: "Primer paseo", detalle: "Registra su primer ejercicio", ganado: ejercicioDias.size > 0, avance: ejercicioDias.size > 0 ? "¡Logrado!" : "Aún no" },
    { id: "pelota-oro", nombre: "Pelota de oro", detalle: `Cumple ${metaMin} min de ejercicio en un día`, ganado: diaConMeta, avance: diaConMeta ? "¡Logrado!" : "Aún no" },
    { id: "hueso-dorado", nombre: "Hueso dorado", detalle: "7 días seguidos de ejercicio", ganado: rEj >= 7, avance: `${Math.min(rEj, 7)} de 7 días` },
    { id: "galleta-campeona", nombre: "Galleta campeona", detalle: "7 días seguidos haciendo en su baño", ganado: rBano >= 7, avance: `${Math.min(rBano, 7)} de 7 días` },
    { id: "escudo-sano", nombre: "Escudo sano", detalle: "Marca una vacuna como hecha", ganado: vacuna, avance: vacuna ? "¡Logrado!" : "Aún no" },
    { id: "corona-peludo", nombre: "Corona de peludo", detalle: "Completa un control sano", ganado: control, avance: control ? "¡Logrado!" : "Aún no" },
  ];
}

export const TIPOS_EVENTO: { id: EventoSalud["tipo"]; texto: string }[] = [
  { id: "vacuna", texto: "Vacuna" }, { id: "desparasitacion", texto: "Desparasitación" },
  { id: "control", texto: "Control sano" }, { id: "otro", texto: "Otro" },
];

const fmtCorto = new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short" });
export function fechaCorta(iso: string): string { const [a, m, d] = iso.split("-").map(Number); return fmtCorto.format(new Date(a, m - 1, d)); }
export function enDias(iso: string, hoy = hoyISO()): string {
  const [a, m, d] = iso.split("-").map(Number); const [ha, hm, hd] = hoy.split("-").map(Number);
  const n = Math.round((new Date(a, m - 1, d).getTime() - new Date(ha, hm - 1, hd).getTime()) / 86400000);
  if (n === 0) return "hoy"; if (n === 1) return "mañana"; if (n < 0) return `hace ${-n} día${n === -1 ? "" : "s"}`;
  return `en ${n} días`;
}

// ---------- Consejero: semáforo por reglas (la IA real se conecta en la etapa de servicios) ----------
export type Luz = "rojo" | "amarillo" | "verde" | "sin-clasificar";
export interface RespuestaConsejero { luz: Luz; titulo: string; pasos: string[]; motivo?: string }

const ROJO: [RegExp, string][] = [
  [/(trag|atorad|ahog|se est[aá] asfixiando)/i, "Se tragó algo o se está ahogando"],
  [/(convuls|ataque|temblor fuerte)/i, "Convulsiones"],
  [/(no respira|respira con dificultad|le cuesta respirar)/i, "Le cuesta respirar"],
  [/(sangr)/i, "Sangrado"],
  [/(veneno|envenen|raticida|chocolate|\buvas?\b|pasas de uva|cebolla|xilitol|medicamento|pastilla)/i, "Posible intoxicación"],
  [/(atropell|golpe fuerte|se cay[oó] de)/i, "Golpe o accidente"],
  [/(desmay|no reacciona|inconsciente)/i, "No reacciona"],
  [/(panza hinchada|abdomen hinchado|barriga hinchada)/i, "Panza hinchada"],
];
const AMARILLO: [RegExp, string[]][] = [
  [/(vomit|v[oó]mito)/i, ["Ofrécele agua de a poco, sin forzar.", "Espera unas horas antes de darle comida y luego dale porciones chicas.", "Pide hora al veterinario si vuelve a vomitar, si está decaído o si es cachorro."]],
  [/(diarrea|caca blanda|heces l[ií]quidas)/i, ["Que tenga agua fresca siempre a mano.", "Dale porciones chicas de su comida habitual.", "Consulta si dura más de 24 horas, si ves sangre o si es cachorro."]],
  [/(no come|no quiere comer|sin apetito)/i, ["Es común los primeros días en casa nueva por el estrés.", "Ofrécele comida en un lugar tranquilo y a la misma hora.", "Consulta si pasan más de 24 a 48 horas sin comer, o antes si es cachorro."]],
  [/(cojea|renguea|le duele la pata)/i, ["Déjalo descansar y evita saltos o carreras.", "Revisa con cuidado si tiene algo clavado entre los dedos.", "Consulta si no mejora en 24 horas o si no apoya la pata."]],
  [/(tos|estornud|mocos)/i, ["Evita paseos largos y el frío.", "Observa si come y tiene energía.", "Consulta si dura más de 2 días o si le cuesta respirar."]],
];

export function triage(texto: string): RespuestaConsejero {
  for (const [re, motivo] of ROJO) if (re.test(texto)) return { luz: "rojo", titulo: "Veterinario ya", pasos: ["Esto puede ser una emergencia. Lleva a tu perro al veterinario ahora."], motivo };
  for (const [re, pasos] of AMARILLO) if (re.test(texto)) return { luz: "amarillo", titulo: "Consulta pronto", pasos };
  return { luz: "sin-clasificar", titulo: "Recibimos tu pregunta", pasos: ["Las respuestas personalizadas con IA se activan en la próxima etapa de la app.", "Si notas algo raro en su salud o su conducta, consulta con tu veterinario."] };
}

export const mapa = (q: string) => `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
