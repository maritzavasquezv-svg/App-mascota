// Lógica de la app por dentro: perros, registros del día, rachas, premios y adaptación.
import type { Edad, Origen } from "@/lib/onboarding";
import { locale, tr, type Idioma, type Txt } from "@/lib/idiomas";

export interface Perro { id: string; nombre: string; origen: Origen | null; edad: Edad | null; preocupaciones: string[]; foto_ruta: string | null; creado_en: string; raza_declarada?: string | null; con_pedigri?: boolean; estimacion?: { mezcla: string; confianza: string; etapa: string; edad_aprox: string; tamano_adulto: string; peso_adulto_kg: string; nota: string } | null }
export interface Registro { id: string; perro_id: string; tipo: "ejercicio" | "bano" | "comida" | "paseo" | "juego" | "descanso"; minutos: number | null; fecha: string }
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
  const tipos: string[] = tipo === "ejercicio" ? ["ejercicio", "paseo", "juego"] : [tipo];
  const dias = new Set(registros.filter((r) => tipos.includes(r.tipo)).map((r) => r.fecha));
  let dia = dias.has(hoy) ? hoy : sumarDias(hoy, -1);
  let n = 0;
  while (dias.has(dia)) { n++; dia = sumarDias(dia, -1); }
  return n;
}

export const minutosDelDia = (registros: Registro[], fecha = hoyISO()) =>
  registros.filter((r) => ["ejercicio", "paseo", "juego"].includes(r.tipo) && r.fecha === fecha).reduce((s, r) => s + (r.minutos ?? 0), 0);

/** Días desde que el perro llegó a Kopeet (día 1 = el primer día). */
export function diasEnCasa(perro: Perro, hoy = new Date()): number {
  const ini = new Date(perro.creado_en); ini.setHours(0, 0, 0, 0);
  const h = new Date(hoy); h.setHours(0, 0, 0, 0);
  return Math.max(1, Math.round((h.getTime() - ini.getTime()) / 86400000) + 1);
}

export interface Premio { id: string; nombre: string; detalle: string; ganado: boolean; avance: string }
export function premios(registros: Registro[], eventos: EventoSalud[], metaMin: number, i: Idioma = "es"): Premio[] {
  const ejercicioDias = new Set(registros.filter((r) => ["ejercicio", "paseo", "juego"].includes(r.tipo)).map((r) => r.fecha));
  const rEj = racha(registros, "ejercicio");
  const rBano = racha(registros, "bano");
  const diaConMeta = [...ejercicioDias].some((f) => minutosDelDia(registros, f) >= metaMin);
  const control = eventos.some((e) => e.tipo === "control" && e.hecho);
  const vacuna = eventos.some((e) => e.tipo === "vacuna" && e.hecho);
  const logrado = (ok: boolean) => (ok ? tr(i, "¡Logrado!", "Achieved!", "Conquistado!") : tr(i, "Aún no", "Not yet", "Ainda não"));
  const de7 = (n: number) => tr(i, `${Math.min(n, 7)} de 7 días`, `${Math.min(n, 7)} of 7 days`, `${Math.min(n, 7)} de 7 dias`);
  return [
    { id: "primer-paseo", nombre: tr(i, "Primer paseo", "First walk", "Primeiro passeio"), detalle: tr(i, "Registra su primer ejercicio", "Log their first exercise", "Registre o primeiro exercício"), ganado: ejercicioDias.size > 0, avance: logrado(ejercicioDias.size > 0) },
    { id: "pelota-oro", nombre: tr(i, "Pelota de oro", "Golden ball", "Bola de ouro"), detalle: tr(i, `Cumple ${metaMin} min de ejercicio en un día`, `Reach ${metaMin} min of exercise in one day`, `Cumpra ${metaMin} min de exercício em um dia`), ganado: diaConMeta, avance: logrado(diaConMeta) },
    { id: "hueso-dorado", nombre: tr(i, "Hueso dorado", "Golden bone", "Osso dourado"), detalle: tr(i, "7 días seguidos de ejercicio", "7 days of exercise in a row", "7 dias seguidos de exercício"), ganado: rEj >= 7, avance: de7(rEj) },
    { id: "galleta-campeona", nombre: tr(i, "Galleta campeona", "Champion cookie", "Biscoito campeão"), detalle: tr(i, "7 días seguidos haciendo orina y heces en su lugar", "7 days in a row urinating and defecating in the right spot", "7 dias seguidos fazendo xixi e cocô no lugar certo"), ganado: rBano >= 7, avance: de7(rBano) },
    { id: "escudo-sano", nombre: tr(i, "Escudo sano", "Health shield", "Escudo saudável"), detalle: tr(i, "Marca una vacuna como hecha", "Mark a vaccine as done", "Marque uma vacina como feita"), ganado: vacuna, avance: logrado(vacuna) },
    { id: "corona-peludo", nombre: tr(i, "Corona de peludo", "Furry crown", "Coroa de peludo"), detalle: tr(i, "Completa un control sano", "Complete a wellness checkup", "Complete um check-up"), ganado: control, avance: logrado(control) },
  ];
}

export const TIPOS_EVENTO: { id: EventoSalud["tipo"]; texto: Txt }[] = [
  { id: "vacuna", texto: { es: "Vacuna", en: "Vaccine", pt: "Vacina" } },
  { id: "desparasitacion", texto: { es: "Desparasitación", en: "Deworming", pt: "Vermifugação" } },
  { id: "control", texto: { es: "Control sano", en: "Checkup", pt: "Check-up" } },
  { id: "otro", texto: { es: "Otro", en: "Other", pt: "Outro" } },
];

export function fechaCorta(iso: string, i: Idioma = "es"): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(locale(i), { day: "numeric", month: "short" }).format(new Date(a, m - 1, d));
}
export function enDias(iso: string, i: Idioma = "es", hoy = hoyISO()): string {
  const [a, m, d] = iso.split("-").map(Number); const [ha, hm, hd] = hoy.split("-").map(Number);
  const n = Math.round((new Date(a, m - 1, d).getTime() - new Date(ha, hm - 1, hd).getTime()) / 86400000);
  if (n === 0) return tr(i, "hoy", "today", "hoje");
  if (n === 1) return tr(i, "mañana", "tomorrow", "amanhã");
  if (n < 0) return n === -1 ? tr(i, "hace 1 día", "1 day ago", "há 1 dia") : tr(i, `hace ${-n} días`, `${-n} days ago`, `há ${-n} dias`);
  return tr(i, `en ${n} días`, `in ${n} days`, `em ${n} dias`);
}

// ---------- Consejero: semáforo por reglas (respaldo cuando no hay IA o como primera señal de alarma) ----------
export type Luz = "rojo" | "amarillo" | "verde" | "sin-clasificar";
export interface RespuestaConsejero { luz: Luz; titulo: string; pasos: string[]; motivo?: string }

// Palabras clave en español, inglés y portugués.
const ROJO: [RegExp, Txt][] = [
  [/(trag|atorad|ahog|asfixi|swallow|chok|stuck in|engasg|engol)/i, { es: "Se tragó algo o se está ahogando", en: "Swallowed something or is choking", pt: "Engoliu algo ou está engasgado" }],
  [/(convuls|ataque|temblor fuerte|seizure)/i, { es: "Convulsiones", en: "Seizures", pt: "Convulsões" }],
  [/(no respira|respira con dificultad|le cuesta respirar|can'?t breathe|not breathing|trouble breathing|n[aã]o respira|dificuldade para respirar)/i, { es: "Le cuesta respirar", en: "Trouble breathing", pt: "Dificuldade para respirar" }],
  [/(sangr|bleed|blood)/i, { es: "Sangrado", en: "Bleeding", pt: "Sangramento" }],
  [/(veneno|envenen|raticida|chocolate|\buvas?\b|pasas de uva|cebolla|xilitol|xylitol|medicamento|pastilla|poison|rat bait|grapes?|raisins?|onion|pills?|medicine|rem[eé]dio|cebola|chocolate)/i, { es: "Posible intoxicación", en: "Possible poisoning", pt: "Possível intoxicação" }],
  [/(atropell|golpe fuerte|se cay[oó] de|hit by a car|run over|fell from|atropel|caiu de)/i, { es: "Golpe o accidente", en: "Injury or accident", pt: "Pancada ou acidente" }],
  [/(desmay|no reacciona|inconsciente|unconscious|collaps|not responding|desmai|n[aã]o reage|inconsciente)/i, { es: "No reacciona", en: "Not responding", pt: "Não reage" }],
  [/(panza hinchada|abdomen hinchado|barriga hinchada|bloat|swollen belly|barriga inchada)/i, { es: "Panza hinchada", en: "Swollen belly", pt: "Barriga inchada" }],
];
const AMARILLO: [RegExp, Txt[]][] = [
  [/(vomit|v[oó]mit|throw(ing)? up)/i, [
    { es: "Ofrécele agua de a poco, sin forzar.", en: "Offer water a little at a time, without forcing.", pt: "Ofereça água aos poucos, sem forçar." },
    { es: "Espera unas horas antes de darle comida y luego dale porciones chicas.", en: "Wait a few hours before feeding, then give small portions.", pt: "Espere algumas horas antes de dar comida e depois dê porções pequenas." },
    { es: "Pide hora al veterinario si vuelve a vomitar, si está decaído o si es cachorro.", en: "Book a vet visit if it vomits again, seems down, or is a puppy.", pt: "Marque o veterinário se vomitar de novo, estiver abatido ou for filhote." }]],
  [/(diarrea|diarrh|caca blanda|heces l[ií]quidas|loose stool|fezes moles|diarreia)/i, [
    { es: "Que tenga agua fresca siempre a mano.", en: "Keep fresh water always available.", pt: "Deixe água fresca sempre à mão." },
    { es: "Dale porciones chicas de su comida habitual.", en: "Give small portions of its usual food.", pt: "Dê porções pequenas da comida habitual." },
    { es: "Consulta si dura más de 24 horas, si ves sangre o si es cachorro.", en: "See a vet if it lasts over 24 hours, you see blood, or it's a puppy.", pt: "Consulte se durar mais de 24 horas, se vir sangue ou se for filhote." }]],
  [/(no come|no quiere comer|sin apetito|won'?t eat|not eating|no appetite|n[aã]o come|sem apetite)/i, [
    { es: "Es común los primeros días en casa nueva por el estrés.", en: "It's common in the first days in a new home because of stress.", pt: "É comum nos primeiros dias em casa nova por causa do estresse." },
    { es: "Ofrécele comida en un lugar tranquilo y a la misma hora.", en: "Offer food in a quiet place at the same time each day.", pt: "Ofereça comida em um lugar tranquilo e no mesmo horário." },
    { es: "Consulta si pasan más de 24 a 48 horas sin comer, o antes si es cachorro.", en: "See a vet if it goes 24 to 48 hours without eating, or sooner if it's a puppy.", pt: "Consulte se passar de 24 a 48 horas sem comer, ou antes se for filhote." }]],
  [/(cojea|renguea|le duele la pata|limp|hurt(s)? (its|his|her) (leg|paw)|manca|mancando|d[oó]i a pata)/i, [
    { es: "Déjalo descansar y evita saltos o carreras.", en: "Let it rest and avoid jumping or running.", pt: "Deixe descansar e evite saltos ou corridas." },
    { es: "Revisa con cuidado si tiene algo clavado entre los dedos.", en: "Gently check for anything stuck between its toes.", pt: "Verifique com cuidado se há algo preso entre os dedos." },
    { es: "Consulta si no mejora en 24 horas o si no apoya la pata.", en: "See a vet if it doesn't improve in 24 hours or won't put weight on the leg.", pt: "Consulte se não melhorar em 24 horas ou se não apoiar a pata." }]],
  [/(\btos\b|estornud|mocos|cough|sneez|tosse|espirr|coriza)/i, [
    { es: "Evita paseos largos y el frío.", en: "Avoid long walks and the cold.", pt: "Evite passeios longos e o frio." },
    { es: "Observa si come y tiene energía.", en: "Watch whether it eats and has energy.", pt: "Observe se come e tem energia." },
    { es: "Consulta si dura más de 2 días o si le cuesta respirar.", en: "See a vet if it lasts over 2 days or it struggles to breathe.", pt: "Consulte se durar mais de 2 dias ou se tiver dificuldade para respirar." }]],
];

export function triage(texto: string, i: Idioma = "es"): RespuestaConsejero {
  for (const [re, motivo] of ROJO) if (re.test(texto)) return {
    luz: "rojo", titulo: tr(i, "Veterinario ya", "Vet now", "Veterinário já"),
    pasos: [tr(i, "Esto puede ser una emergencia. Lleva a tu perro al veterinario ahora.", "This may be an emergency. Take your dog to the vet now.", "Isto pode ser uma emergência. Leve seu cão ao veterinário agora.")],
    motivo: motivo[i],
  };
  for (const [re, pasos] of AMARILLO) if (re.test(texto)) return { luz: "amarillo", titulo: tr(i, "Consulta pronto", "See a vet soon", "Consulte em breve"), pasos: pasos.map((p) => p[i]) };
  return {
    luz: "sin-clasificar", titulo: tr(i, "Recibimos tu pregunta", "We got your question", "Recebemos sua pergunta"),
    pasos: [
      tr(i, "Para responder esta duda con detalle se usa el Consejero con IA.", "The AI Advisor answers this kind of question in detail.", "Para responder esta dúvida em detalhe usamos o Conselheiro com IA."),
      tr(i, "Si notas algo raro en su salud o su conducta, consulta con tu veterinario.", "If you notice anything odd in its health or behavior, check with your vet.", "Se notar algo estranho na saúde ou no comportamento, consulte seu veterinário."),
    ],
  };
}

export const mapa = (q: string) => `https://www.google.com/maps/search/${encodeURIComponent(q)}`;

/** Cuántas comidas al día se sugieren según la etapa (orientación general; el veterinario manda). */
export const comidasDelDia = (edad: string | null) => (edad === "cachorro" ? 3 : 2);
/** Horas de sueño diarias habituales según la etapa (orientación general). */
export const horasSueno = (edad: string | null, i: Idioma = "es") => {
  const r = edad === "cachorro" ? "18–20" : edad === "senior" ? "14–18" : "12–14";
  return tr(i, `${r.replace("–", " a ")} h`, `${r} h`, `${r.replace("–", " a ")} h`);
};
export const vecesHoy = (registros: Registro[], tipo: Registro["tipo"], fecha = hoyISO()) => registros.filter((r) => r.tipo === tipo && r.fecha === fecha).length;
export const minutosHoy = (registros: Registro[], tipo: Registro["tipo"], fecha = hoyISO()) => registros.filter((r) => r.tipo === tipo && r.fecha === fecha).reduce((s, r) => s + (r.minutos ?? 0), 0);
