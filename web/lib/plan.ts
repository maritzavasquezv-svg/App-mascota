import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Correos con acceso de administración y plan completo (variable ADMIN_EMAILS, separados por coma). */
export function esAdmin(email?: string | null): boolean {
  const lista = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && lista.includes(email.toLowerCase()));
}

export interface EstadoPlan { activo: boolean; admin: boolean; estado: string | null; plan: string | null }

/** El plan está activo si Hotmart avisó una compra vigente, si la dueña dio acceso a mano (y no venció), o si es administradora. */
export async function estadoPlan(supabase: SupabaseClient, user: User): Promise<EstadoPlan> {
  const admin = esAdmin(user.email);
  const { data } = await supabase.from("suscripciones").select("estado,plan,vence_en").maybeSingle();
  const vencio = Boolean(data?.vence_en && new Date(data.vence_en) < new Date());
  const estado = vencio ? "vencida" : data?.estado ?? null;
  return { activo: admin || estado === "activa", admin, estado, plan: data?.plan ?? null };
}
