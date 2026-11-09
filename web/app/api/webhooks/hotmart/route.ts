import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { clienteAdmin } from "@/lib/supabase/servidor";

// Hotmart avisa aquí cada compra, cancelación o reembolso.
// Se verifica con el "hottok" secreto del producto (variable HOTMART_HOTTOK).
const ESTADOS: Record<string, "activa" | "cancelada" | "reembolsada" | "vencida"> = {
  PURCHASE_APPROVED: "activa",
  PURCHASE_COMPLETE: "activa",
  PURCHASE_REFUNDED: "reembolsada",
  PURCHASE_CHARGEBACK: "reembolsada",
  PURCHASE_PROTEST: "reembolsada",
  PURCHASE_CANCELED: "cancelada",
  SUBSCRIPTION_CANCELLATION: "cancelada",
  PURCHASE_EXPIRED: "vencida",
  PURCHASE_DELAYED: "vencida",
};

function hottokValido(recibido: string | null): boolean {
  const esperado = process.env.HOTMART_HOTTOK;
  if (!esperado || !recibido) return false;
  const a = Buffer.from(recibido), b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!hottokValido(req.headers.get("x-hotmart-hottok"))) return NextResponse.json({ error: "no autorizado" }, { status: 401 });

  const cuerpo = await req.json().catch(() => null) as {
    event?: string;
    data?: { buyer?: { email?: string }; purchase?: { transaction?: string; recurrence_number?: number }; subscription?: { plan?: { name?: string } } };
  } | null;
  const evento = cuerpo?.event ?? "";
  const email = cuerpo?.data?.buyer?.email?.trim().toLowerCase();
  const estado = ESTADOS[evento];
  if (!email || !estado) return NextResponse.json({ ok: true, ignorado: evento || "sin evento" });

  const nombrePlan = (cuerpo?.data?.subscription?.plan?.name ?? "").toLowerCase();
  const plan = nombrePlan.includes("anual") ? "anual" : nombrePlan.includes("mensual") ? "mensual" : null;

  const { error } = await clienteAdmin().from("suscripciones").upsert({
    email, estado, plan, hotmart_transaccion: cuerpo?.data?.purchase?.transaction ?? null,
    ultimo_evento: evento, actualizado_en: new Date().toISOString(),
  });
  if (error) { console.error("hotmart", error); return NextResponse.json({ error: "no se pudo guardar" }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
