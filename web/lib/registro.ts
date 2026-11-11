// Pasa las respuestas del onboarding a la cuenta de Supabase la primera vez que la persona entra.
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Respuestas } from "@/lib/onboarding";

export const VERSION_DOCUMENTOS = "1.0 (9 nov 2026)";
const CLAVE_PENDIENTE = "kopeet-registro-pendiente";

export interface Consentimiento { finalidad: "terminos_y_privacidad" | "transferencia_internacional_ia" | "marketing"; aceptado: boolean }

/** Guarda las respuestas en el navegador hasta que la cuenta esté confirmada (incluye la foto). */
export function guardarPendiente(r: Respuestas, plan: string) {
  try { window.localStorage.setItem(CLAVE_PENDIENTE, JSON.stringify({ r, plan })); }
  catch { try { window.localStorage.setItem(CLAVE_PENDIENTE, JSON.stringify({ r: { ...r, foto: null }, plan })); } catch { /* sin almacenamiento */ } }
}

function leerPendiente(): { r: Respuestas; plan: string } | null {
  try { const t = window.localStorage.getItem(CLAVE_PENDIENTE); return t ? JSON.parse(t) : null; } catch { return null; }
}

async function dataUrlABlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

/**
 * Se llama al entrar a /inicio. Si la cuenta todavía no tiene perro ni consentimientos,
 * los crea con lo que la persona respondió (metadatos del registro + datos guardados en el navegador).
 */
export async function completarRegistro(supabase: SupabaseClient, user: User): Promise<void> {
  const meta = (user.user_metadata ?? {}) as { onboarding?: Partial<Respuestas>; plan?: string; consentimientos?: Consentimiento[]; locale?: string; origen?: string | null; nombre?: string };
  const pendiente = leerPendiente();

  // 1) Consentimientos (solo si no hay ninguno registrado todavía)
  const { count: nCons } = await supabase.from("consentimientos").select("id", { count: "exact", head: true }).eq("usuario_id", user.id);
  if (!nCons && meta.consentimientos?.length) {
    await supabase.from("consentimientos").insert(meta.consentimientos.map((c) => ({
      usuario_id: user.id, finalidad: c.finalidad, aceptado: c.aceptado,
      version_documento: VERSION_DOCUMENTOS, locale: meta.locale ?? null, origen: "registro-web",
    })));
  }

  // 2) Perfil
  const ob = { ...(meta.onboarding ?? {}), ...(pendiente?.r ?? {}) } as Partial<Respuestas>;
  await supabase.from("perfiles").upsert({
    id: user.id, hora_paseo: ob.hora ?? null, avisos: ob.avisos ?? "sin-respuesta",
    plan_elegido: pendiente?.plan ?? meta.plan ?? null,
    ...(meta.origen ? { origen: meta.origen } : {}),
    ...(meta.nombre ? { nombre: meta.nombre } : {}),
  });

  // 3) Primer perro (solo si no tiene ninguno)
  const { count: nPerros } = await supabase.from("perros").select("id", { count: "exact", head: true }).eq("usuario_id", user.id);
  if (!nPerros) {
    let fotoRuta: string | null = null;
    if (pendiente?.r.foto) {
      const ruta = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from("fotos-perros").upload(ruta, await dataUrlABlob(pendiente.r.foto), { contentType: "image/jpeg" });
      if (!error) fotoRuta = ruta;
    }
    await supabase.from("perros").insert({
      usuario_id: user.id, nombre: (ob.nombre ?? "").trim(), origen: ob.origen ?? null, edad: ob.edad ?? null,
      preocupaciones: ob.preocupaciones ?? [], foto_ruta: fotoRuta,
    });
  }
  try { window.localStorage.removeItem(CLAVE_PENDIENTE); } catch { /* nada */ }
}
