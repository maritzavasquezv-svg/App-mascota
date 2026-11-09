import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para el navegador. Usa la clave PÚBLICA: lo que protege los datos son las reglas RLS.
export function crearCliente() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
