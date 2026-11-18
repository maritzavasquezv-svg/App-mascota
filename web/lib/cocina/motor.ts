// Motor de la Cocina de Kopeet: calorías del día (FEDIAF 2024), plan mensual, porciones, compras y suplemento.
// Se guía por la etapa de vida: cachorro (2 a 12 meses), adulto y senior.
// Fuentes:
//  - FEDIAF Nutritional Guidelines, julio 2024.
//    · Adultos y senior: tablas VII-6 (edad) y VII-7 (actividad, razas): kcal = factor × peso^0,75.
//    · Cachorros 8 semanas a 1 año: tabla VII-8a: kcal = (254,1 − 135 × peso actual / peso adulto esperado) × peso^0,75.
//    · Mínimos por 1000 kcal: tabla III-3b (adulto MER 95; crecimiento temprano para cachorros).
//  - USDA FoodData Central (SR Legacy) para los nutrientes de cada ingrediente (ver lib/cocina/datos.ts).
import { INGREDIENTES, RECETAS, type Alergeno, type Receta } from "./datos";

export type Actividad = "baja" | "moderada" | "alta" | "muy_alta";
export type Contextura = "delgado" | "ideal" | "sobrepeso";
export interface DatosCocina {
  peso_kg: number; actividad: Actividad; castrado: boolean; contextura: Contextura; alergias: Alergeno[]; enfermedad: boolean;
  /** Solo cachorros: edad en meses y peso que tendrá de adulto. */
  meses?: number; peso_adulto_kg?: number;
}
export type Etapa = "cachorro" | "adulto" | "senior";

export const ALERGENOS: Alergeno[] = ["pollo", "pavo", "vacuno", "cerdo", "cordero", "pescado", "huevo", "cereales", "legumbres"];
const FACTOR_ACTIVIDAD: Record<Actividad, number> = { baja: 95, moderada: 110, alta: 125, muy_alta: 150 };
// Razas con tendencia a engordar (FEDIAF tabla VII-7: "obese prone adults" ≤ 90 kcal/kg^0,75).
const PROPENSAS = /labrador|golden|beagle|cocker|basset|dachshund|salchicha|teckel|pug|carlino|bulldog|shih|cavalier|schnauzer|rottweiler/i;
// Lo que cubre el suplemento, por 1000 kcal (yodo en µg). FEDIAF tabla III-3b.
const MIN_SUP: Record<"cachorro" | "adulto", Record<"fe" | "zn" | "cu" | "i" | "vitD" | "vitE", number>> = {
  adulto: { fe: 0, zn: 20.8, cu: 2.08, i: 300, vitD: 159, vitE: 10.4 },
  cachorro: { fe: 22, zn: 25, cu: 2.75, i: 380, vitD: 138, vitE: 12.5 },
};

export type Motivo = "muy_chico" | "faltan_datos" | "enfermedad" | "sin_recetas";

/** Etapa de vida: los perros registrados como cachorro pasan a adulto al cumplir 12 meses. */
export function etapa(edad: string | null, d: DatosCocina | null): Etapa {
  if (edad === "senior") return "senior";
  if (edad === "cachorro" && !(d?.meses != null && d.meses >= 12)) return "cachorro";
  return "adulto";
}
const tipoReceta = (e: Etapa) => (e === "cachorro" ? "cachorro" : "adulto");

/** Comidas al día según la edad. */
export function comidasDia(e: Etapa, meses?: number) {
  if (e !== "cachorro") return 2;
  return (meses ?? 6) < 4 ? 4 : 3;
}

/** Calorías diarias y de dónde sale el número. */
export function caloriasDia(d: DatosCocina, edad: string | null, raza: string): { kcal: number; factor: number; notas: string[] } {
  const e = etapa(edad, d);
  const notas: string[] = [];
  if (e === "cachorro") {
    const relacion = Math.min(0.95, d.peso_kg / Math.max(d.peso_kg, d.peso_adulto_kg ?? d.peso_kg * 2));
    const factor = Math.round(254.1 - 135 * relacion);
    if ((d.peso_adulto_kg ?? 0) > 25) notas.push("raza_grande");
    return { kcal: Math.round(factor * Math.pow(d.peso_kg, 0.75)), factor, notas };
  }
  let factor = FACTOR_ACTIVIDAD[d.actividad];
  if (/gran dan[eé]s|great dane|dogo alem[aã]n/i.test(raza)) { factor = 200; notas.push("raza_gran_danes"); }
  else if (/terranova|newfoundland/i.test(raza)) { factor = 105; notas.push("raza_terranova"); }
  if (e === "senior" && d.actividad !== "alta" && d.actividad !== "muy_alta") { factor = Math.min(factor, 95); notas.push("senior"); }
  if (d.contextura === "sobrepeso" || PROPENSAS.test(raza) || (d.castrado && d.actividad === "baja")) { factor = Math.min(factor, 90); notas.push("tendencia_engordar"); }
  if (d.contextura === "delgado") { factor = Math.round(factor * 1.1); notas.push("delgado"); }
  return { kcal: Math.round(factor * Math.pow(d.peso_kg, 0.75)), factor, notas };
}

const totalG = (r: Receta) => Object.values(r.gramos).reduce((a, b) => a + b, 0);
/** kcal por cada 100 g de la receta terminada. */
export function densidad(r: Receta) {
  const kcal = Object.entries(r.gramos).reduce((a, [k, g]) => a + INGREDIENTES[k].n.kcal * g / 100, 0);
  return kcal / totalG(r) * 100;
}

export const recetasPermitidas = (alergias: Alergeno[], e: Etapa) => {
  // "aves" era la opción antigua (pollo y pavo juntos).
  const a = (alergias as string[]).flatMap((x) => (x === "aves" ? ["pollo", "pavo"] : [x]));
  return RECETAS.filter((r) => r.etapa === tipoReceta(e) && !r.alergenos.some((x) => a.includes(x)));
};

/** 4 semanas; una receta distinta cada semana, rotando según el mes para que cada mes cambie. */
export function planDelMes(alergias: Alergeno[], e: Etapa, fecha: Date): Receta[] {
  const ok = recetasPermitidas(alergias, e);
  if (!ok.length) return [];
  const inicio = (fecha.getFullYear() * 12 + fecha.getMonth()) * 4;
  return [0, 1, 2, 3].map((w) => ok[(inicio + w) % ok.length]);
}

const redondear = (g: number) => (g < 20 ? Math.round(g * 2) / 2 : Math.round(g / 5) * 5);

/** Ingredientes en gramos para cocinar `dias` días de una receta, para un perro que come `gramosDia`. */
export function tanda(r: Receta, gramosDia: number, dias: number) {
  const f = (gramosDia * dias) / totalG(r);
  return Object.entries(r.gramos).map(([k, g]) => ({ id: k, g: redondear(g * f) }));
}

export function porcionDia(r: Receta, kcal: number) { return Math.round(kcal / densidad(r) * 100 / 5) * 5; }

/** Lo que el suplemento debe aportar al día (lo que la comida no alcanza según FEDIAF). */
export function suplementoDia(r: Receta, kcal: number) {
  const min = MIN_SUP[r.etapa];
  const g = porcionDia(r, kcal), f = g / totalG(r);
  const aporte = { fe: 0, zn: 0, cu: 0, i: 0, vitD: 0, vitE: 0 };
  for (const [k, gr] of Object.entries(r.gramos)) { const n = INGREDIENTES[k].n; for (const x of Object.keys(aporte) as (keyof typeof aporte)[]) aporte[x] += n[x] * gr * f / 100; }
  const falta = (x: keyof typeof aporte) => Math.max(0, min[x] * kcal / 1000 - aporte[x]);
  return { fe: +falta("fe").toFixed(1), zn: +falta("zn").toFixed(1), cu: +falta("cu").toFixed(2), i: Math.round(falta("i")), vitD: Math.round(falta("vitD")), vitE: Math.round(falta("vitE")) };
}

/** Lista de compras de varias semanas, agrupada por pasillo (arroz y lentejas se compran en crudo). */
export function listaCompras(recetas: Receta[], gramosDia: (r: Receta) => number) {
  const tot: Record<string, number> = {};
  for (const r of recetas) for (const { id, g } of tanda(r, gramosDia(r), 7)) tot[id] = (tot[id] ?? 0) + g * INGREDIENTES[id].compra;
  return Object.entries(tot).map(([id, g]) => ({ id, g: redondear(g), pasillo: INGREDIENTES[id].pasillo }))
    .sort((a, b) => a.pasillo.localeCompare(b.pasillo) || b.g - a.g);
}

/** Medida casera aproximada ("1½ taza", "2 unidades"). */
export function medidaCasera(id: string, g: number): { n: string; unidad: string } | null {
  const m = INGREDIENTES[id].medida; if (!m) return null;
  const x = g / m.g;
  if (m.unidad === "unidad" || m.unidad === "lata") return { n: String(Math.max(1, Math.round(x))), unidad: m.unidad };
  const cuartos = Math.round(x * 4) / 4; if (cuartos <= 0) return null;
  const ent = Math.floor(cuartos), fr = cuartos - ent;
  const frac = fr === 0.25 ? "¼" : fr === 0.5 ? "½" : fr === 0.75 ? "¾" : "";
  return { n: `${ent || ""}${frac}` || "¼", unidad: m.unidad };
}

export function puedeTenerPlan(d: DatosCocina, edad: string | null): Motivo | null {
  const e = etapa(edad, d);
  if (e === "cachorro") {
    if (d.meses == null || !d.peso_adulto_kg) return "faltan_datos";
    if (d.meses < 2) return "muy_chico";
  }
  if (d.enfermedad) return "enfermedad";
  if (!recetasPermitidas(d.alergias, e).length) return "sin_recetas";
  return null;
}

/** Peso adulto estimado por el escáner ("20 a 25 kg" → 22,5). */
export function pesoAdultoEstimado(texto: string | null | undefined): number | null {
  const n = (texto ?? "").replace(",", ".").match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (!n.length) return null;
  return Math.round((n.length > 1 ? (n[0] + n[1]) / 2 : n[0]) * 10) / 10;
}
