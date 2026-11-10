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

/** Cliente con la clave SECRETA de Supabase (salta RLS). Solo para el webhook de Hotmart. */
export function clienteAdmin() {
  // trim(): al copiar y pegar a veces se cuela un espacio o salto de línea, que rompe la cabecera HTTP.
  const clave = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!clave) throw new Error("Falta SUPABASE_SECRET_KEY en las variables del servidor");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, clave, { auth: { persistSession: false, autoRefreshToken: false } });
}
