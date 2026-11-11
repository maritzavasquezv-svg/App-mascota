import { NextResponse, type NextRequest } from "next/server";
import { clientePublico } from "@/lib/supabase/servidor";

// Hotmart avisa aquí cada compra, renovación, cancelación o reembolso.
// Todo lo hace la función hotmart_recibir() de la base: valida el hottok (que la dueña guarda en el panel),
// guarda la venta con sus montos y comisiones, y activa o corta el plan de esa persona.
export async function POST(req: NextRequest) {
  const cuerpo = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!cuerpo) return NextResponse.json({ error: "cuerpo inválido" }, { status: 400 });
  // Hotmart manda el hottok en la cabecera X-HOTMART-HOTTOK (y en versiones antiguas, dentro del cuerpo).
  const hottok = req.headers.get("x-hotmart-hottok") ?? (typeof cuerpo.hottok === "string" ? cuerpo.hottok : null);

  const { data, error } = await clientePublico().rpc("hotmart_recibir", { p_hottok: hottok, p_payload: cuerpo });
  if (error) {
    console.error("hotmart", error.code, error.message);
    return NextResponse.json({ error: "no se pudo guardar" }, { status: 500 }); // Hotmart reintenta
  }
  const r = data as { ok: boolean; motivo?: string };
  if (!r.ok) return NextResponse.json({ error: r.motivo }, { status: r.motivo === "hottok" ? 401 : 503 });
  return NextResponse.json(r);
}
