// Envía los recordatorios de Kopeet como notificaciones push.
// La llama pg_cron cada 15 minutos (y el botón "Enviar aviso de prueba") con la cabecera x-kopeet-cron.
// La primera vez genera las claves VAPID y las guarda en privado.secretos: nadie tiene que copiarlas.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

function claveServicio(): string {
  const directa = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (directa) return directa;
  try {
    const varias = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    return varias.default ?? Object.values(varias)[0] ?? "";
  } catch { return ""; }
}

const sb = createClient(Deno.env.get("SUPABASE_URL")!, claveServicio(), { auth: { persistSession: false } });

interface Envio { endpoint: string; p256dh: string; auth: string; mensaje: Record<string, string> }

Deno.serve(async (req) => {
  const { data: valido } = await sb.rpc("push_cron_valido", { p_token: req.headers.get("x-kopeet-cron") ?? "" });
  if (valido !== true) return new Response("no autorizado", { status: 401 });

  let { data: cfg } = await sb.rpc("push_config");
  if (!cfg?.publica || !cfg?.privada) {
    const k = webpush.generateVAPIDKeys();
    await sb.rpc("push_guardar_vapid", { p_publica: k.publicKey, p_privada: k.privateKey });
    ({ data: cfg } = await sb.rpc("push_config"));
  }
  webpush.setVapidDetails("https://app-mascota-navy.vercel.app", cfg.publica, cfg.privada);

  const { data: lista, error } = await sb.rpc("push_preparar");
  if (error) {
    await sb.rpc("registrar_error", { p_origen: "avisos_push", p_mensaje: error.message }).then(() => {}, () => {});
    return Response.json({ ok: false }, { status: 500 });
  }

  let enviados = 0, fallidos = 0;
  await Promise.all(((lista ?? []) as Envio[]).map(async (e) => {
    try {
      await webpush.sendNotification({ endpoint: e.endpoint, keys: { p256dh: e.p256dh, auth: e.auth } },
        JSON.stringify(e.mensaje), { TTL: 6 * 3600, urgency: "normal" });
      enviados++;
    } catch (err) {
      fallidos++;
      const codigo = (err as { statusCode?: number }).statusCode;
      // 404/410: la persona desinstaló o quitó el permiso → se borra esa dirección.
      if (codigo === 404 || codigo === 410) await sb.rpc("push_borrar_endpoint", { p_endpoint: e.endpoint });
    }
  }));
  return Response.json({ ok: true, enviados, fallidos });
});
