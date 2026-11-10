import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

// Recibe los enlaces de los correos de Supabase (confirmar cuenta o crear contraseña nueva),
// abre la sesión y lleva a la pantalla que corresponde.
// - token_hash + type: funciona en cualquier navegador (plantillas de correo de Kopeet).
// - code: solo funciona en el mismo navegador donde se pidió; si falla, se explica en /entrar.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;
  const siguiente = url.searchParams.get("siguiente") === "nueva-clave" || tipo === "recovery" ? "/nueva-clave" : "/inicio";

  const respuesta = NextResponse.redirect(new URL(siguiente, url.origin));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options)) } },
  );

  let ok = false;
  if (tokenHash && tipo) ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })).error;
  else if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;

  if (!ok) {
    const aviso = tipo === "recovery" || siguiente === "/nueva-clave" ? "aviso=enlace-vencido" : "error=enlace";
    return NextResponse.redirect(new URL(`/entrar?${aviso}`, url.origin));
  }
  return respuesta;
}
