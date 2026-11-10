import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para el navegador. Usa la clave PÚBLICA: lo que protege los datos son las reglas RLS.
export function crearCliente() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

/**
 * Cliente solo para PEDIR correos (registro y "olvidé mi contraseña").
 * Usa el flujo "implícito": el enlace del correo trae la sesión y funciona en cualquier
 * navegador o celular (el flujo PKCE solo funciona en el mismo navegador donde se pidió).
 * La sesión se recibe en /auth/listo y se guarda con el cliente normal.
 */
export function crearClienteCorreos() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
