import { NextResponse, type NextRequest } from "next/server";
import { clienteConSesion } from "@/lib/supabase/servidor";
import { armarPanel } from "@/lib/panel";

// Datos del panel. La base solo responde si quien pide es administradora (se verifica en el servidor y en la base).
export async function GET(req: NextRequest) {
  const supabase = await clienteConSesion();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const mes = req.nextUrl.searchParams.get("mes");
  const p_mes = mes && /^\d{4}-\d{2}$/.test(mes) ? `${mes}-01` : null;
  const { data, error } = await supabase.rpc("admin_panel", { p_mes });
  if (error) {
    if (error.code === "42501") return NextResponse.json({ error: "no autorizado" }, { status: 403 });
    console.error("admin_panel", error.code, error.message);
    return NextResponse.json({ error: "No pudimos cargar el panel." }, { status: 500 });
  }
  return NextResponse.json(armarPanel(data));
}
