import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

// Recibe el enlace de confirmación del correo, abre la sesión y lleva a /inicio.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;

  const destino = new URL("/inicio", url.origin);
  const respuesta = NextResponse.redirect(destino);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options)) } },
  );

  let ok = false;
  if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && tipo) ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })).error;

  if (!ok) return NextResponse.redirect(new URL("/entrar?error=enlace", url.origin));
  return respuesta;
}
