import { NextResponse } from "next/server";
import { clienteConSesion } from "@/lib/supabase/servidor";
import { estadoPlan } from "@/lib/plan";
import { PAGOS_HOTMART } from "@/lib/pagos";
import { esPlan, PLANES_ID, type PlanId } from "@/lib/planes";

/**
 * Arma el enlace de pago de Hotmart para esta cuenta (auditoría H1):
 * - email: Hotmart abre el checkout con el correo de la cuenta ya escrito.
 * - xcod: el id de la cuenta; Hotmart lo devuelve en el aviso de compra y la base activa el plan
 *   en esta cuenta aunque la persona cambie el correo en Hotmart.
 */
function enlacePago(base: string | null, email: string | undefined, id: string): string | null {
  if (!base) return null;
  try {
    const u = new URL(base);
    if (email) u.searchParams.set("email", email);
    u.searchParams.set("xcod", id);
    return u.toString();
  } catch { return base; }
}

// Dice a la app si la persona tiene el plan activo, el plan que eligió al registrarse y sus enlaces de pago.
export async function GET() {
  const supabase = await clienteConSesion();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "sin sesión" }, { status: 401 });
  const e = await estadoPlan(supabase, user);
  const bases: Record<PlanId, string | null> = {
    anual: process.env.NEXT_PUBLIC_HOTMART_PAGO_ANUAL || PAGOS_HOTMART.anual,
    mensual: process.env.NEXT_PUBLIC_HOTMART_PAGO_MENSUAL || PAGOS_HOTMART.mensual,
    familiar_anual: process.env.NEXT_PUBLIC_HOTMART_PAGO_FAMILIAR_ANUAL || PAGOS_HOTMART.familiar_anual,
    familiar_mensual: process.env.NEXT_PUBLIC_HOTMART_PAGO_FAMILIAR_MENSUAL || PAGOS_HOTMART.familiar_mensual,
  };
  const pagar = Object.fromEntries(PLANES_ID.map((p) => [p, enlacePago(bases[p], user.email, user.id)])) as Record<PlanId, string | null>;
  const elegido = user.user_metadata?.plan;
  return NextResponse.json({ ...e, elegido: esPlan(elegido) ? elegido : null, pagar });
}
