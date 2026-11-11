import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

/** Cliente de Supabase con la sesión de la persona (respeta RLS). Para route handlers. */
export async function clienteConSesion() {
  const tienda = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => tienda.getAll(), setAll: (cs) => { try { cs.forEach(({ name, value, options }) => tienda.set(name, value, options)); } catch { /* sin escritura en este contexto */ } } } },
  );
}

/**
 * Cliente sin sesión, con la clave pública. Lo usan el aviso de Hotmart (que se valida con su hottok dentro
 * de la base) y el envío de enlaces de acceso. Ya no hace falta la clave secreta de Supabase.
 */
export function clientePublico(flujo: "pkce" | "implicit" = "pkce") {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, flowType: flujo },
  });
}
