import { NextResponse } from "next/server";
import { clienteConSesion } from "@/lib/supabase/servidor";

// Resumen para el panel de administración.
// Lo arma la función resumen_admin() de la base de datos, que solo responde a las administradoras
// (tabla privada `administradores`). No necesita la clave secreta de Supabase.
export async function GET() {
  const supabase = await clienteConSesion();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const { data, error } = await supabase.rpc("resumen_admin");
  if (error) {
    if (error.code === "42501") return NextResponse.json({ error: "no autorizado" }, { status: 403 });
    console.error("resumen_admin", error.code, error.message);
    return NextResponse.json({ error: "No pudimos cargar el panel." }, { status: 500 });
  }
  return NextResponse.json(data);
}
