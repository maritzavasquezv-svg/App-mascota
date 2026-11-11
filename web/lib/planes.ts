// Planes de Kopeet (fuente única de precios). Individual: 1 perro. Familiar: hasta 4 perros.
import { tr, type Idioma } from "./idiomas";

export type PlanId = "anual" | "mensual" | "familiar_anual" | "familiar_mensual";
export const PLANES_ID: PlanId[] = ["anual", "mensual", "familiar_anual", "familiar_mensual"];
export const esPlan = (x: unknown): x is PlanId => typeof x === "string" && (PLANES_ID as string[]).includes(x);

export const PERROS_FAMILIAR = 4;

export const PLANES: Record<PlanId, { familiar: boolean; anual: boolean; total: number; porMes: number; ahorro: number | null }> = {
  anual: { familiar: false, anual: true, total: 49.99, porMes: 4.17, ahorro: 40 },
  mensual: { familiar: false, anual: false, total: 6.99, porMes: 6.99, ahorro: null },
  familiar_anual: { familiar: true, anual: true, total: 69.99, porMes: 5.83, ahorro: 41 },
  familiar_mensual: { familiar: true, anual: false, total: 9.99, porMes: 9.99, ahorro: null },
};

/** Precio con el formato de cada idioma: US$49,99 · US$49.99 · US$ 49,99 */
export function precio(n: number, i: Idioma): string {
  const s = n.toFixed(2);
  return i === "en" ? `US$${s}` : i === "pt" ? `US$ ${s.replace(".", ",")}` : `US$${s.replace(".", ",")}`;
}

export function nombrePlan(p: PlanId | string | null | undefined, i: Idioma): string {
  switch (p) {
    case "anual": return tr(i, "Individual anual", "Individual yearly", "Individual anual");
    case "mensual": return tr(i, "Individual mensual", "Individual monthly", "Individual mensal");
    case "familiar_anual": return tr(i, "Familiar anual", "Family yearly", "Familiar anual");
    case "familiar_mensual": return tr(i, "Familiar mensual", "Family monthly", "Familiar mensal");
    case "cortesia": return tr(i, "Cortesía", "Complimentary", "Cortesia");
    default: return tr(i, "Sin elegir", "Not chosen", "Não escolhido");
  }
}

/** "Individual anual · US$4,17/mes" */
export function resumenPlan(p: PlanId, i: Idioma): string {
  const d = PLANES[p];
  return `${nombrePlan(p, i)} · ${precio(d.porMes, i)}${tr(i, "/mes", "/mo", "/mês")}`;
}
