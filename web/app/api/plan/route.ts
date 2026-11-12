import { NextResponse } from "next/server";
import { clienteConSesion } from "@/lib/supabase/servidor";
import { estadoPlan } from "@/lib/plan";
import { PAGOS_HOTMART } from "@/lib/pagos";

// Dice a la app si la persona tiene el plan activo, y los enlaces de pago de Hotmart.
export async function GET() {
  const supabase = await clienteConSesion();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "sin sesión" }, { status: 401 });
  const e = await estadoPlan(supabase, user);
  return NextResponse.json({
    ...e,
    pagar: {
      anual: process.env.NEXT_PUBLIC_HOTMART_PAGO_ANUAL || PAGOS_HOTMART.anual,
      mensual: process.env.NEXT_PUBLIC_HOTMART_PAGO_MENSUAL || PAGOS_HOTMART.mensual,
      familiar_anual: process.env.NEXT_PUBLIC_HOTMART_PAGO_FAMILIAR_ANUAL || PAGOS_HOTMART.familiar_anual,
      familiar_mensual: process.env.NEXT_PUBLIC_HOTMART_PAGO_FAMILIAR_MENSUAL || PAGOS_HOTMART.familiar_mensual,
    },
  });
}
