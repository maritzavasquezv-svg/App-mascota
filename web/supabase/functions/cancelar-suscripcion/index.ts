// Cancela la suscripción de la persona que llama (con su sesión de Kopeet) usando la API de Hotmart.
// No recibe correos ni códigos del navegador: todo sale de la sesión y de la base, así nadie puede cancelar a otra persona.
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

function claveServicio(): string {
  const directa = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (directa) return directa;
  try {
    const varias = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    return varias.default ?? Object.values(varias)[0] ?? "";
  } catch { return ""; }
}

const ORIGENES = ["https://app-mascota-navy.vercel.app", "http://localhost:3000"];
const sb = createClient(Deno.env.get("SUPABASE_URL")!, claveServicio(), { auth: { persistSession: false } });

function respuesta(req: Request, cuerpo: unknown, status = 200) {
  const origen = req.headers.get("origin") ?? "";
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ORIGENES.includes(origen) ? origen : ORIGENES[0],
      "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    },
  });
}

function fecha(x: string | null | undefined): string | null {
  if (!x) return null;
  const n = Number(x);
  const d = Number.isFinite(n) ? new Date(n > 1e12 ? n : n * 1000) : new Date(x);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return respuesta(req, {});
  if (req.method !== "POST") return respuesta(req, { error: "método" }, 405);

  // 1) ¿Quién llama? (sesión de Kopeet)
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: u } = await sb.auth.getUser(token);
  const email = u?.user?.email;
  if (!email) return respuesta(req, { error: "sin_sesion" }, 401);

  // 2) Su suscripción y las credenciales de Hotmart
  const { data: d, error } = await sb.rpc("hotmart_cancelacion_datos", { p_email: email });
  if (error || !d) return respuesta(req, { error: "interno" }, 500);
  const s = d.suscripcion as { estado: string; origen: string; ultimo_evento: string | null; vence_en: string | null } | null;
  if (!s || s.origen !== "hotmart" || s.estado !== "activa") return respuesta(req, { error: "sin_suscripcion" }, 404);
  if (s.ultimo_evento === "SUBSCRIPTION_CANCELLATION") return respuesta(req, { ok: true, yaCancelada: true, hasta: s.vence_en });
  if (!d.codigo) return respuesta(req, { error: "sin_codigo" }, 409);
  if (!d.client_id || !d.client_secret || !d.basic) return respuesta(req, { error: "sin_credenciales" }, 503);

  // 3) Token de Hotmart
  const url = `https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(d.client_id)}&client_secret=${encodeURIComponent(d.client_secret)}`;
  const t = await fetch(url, { method: "POST", headers: { Authorization: `Basic ${d.basic}`, "Content-Type": "application/json" } });
  const tj = await t.json().catch(() => ({}));
  if (!t.ok || !tj.access_token) {
    await sb.rpc("registrar_error", { p_origen: "cancelar_hotmart", p_mensaje: `token ${t.status}` }).then(() => {}, () => {});
    return respuesta(req, { error: "hotmart_token" }, 502);
  }

  // 4) Cancelar en Hotmart (le manda también su correo de confirmación al cliente)
  const c = await fetch(`https://developers.hotmart.com/payments/api/v1/subscriptions/${encodeURIComponent(d.codigo)}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tj.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ send_mail: true }),
  });
  if (!c.ok) {
    const txt = await c.text().catch(() => "");
    await sb.rpc("registrar_error", { p_origen: "cancelar_hotmart", p_mensaje: `cancel ${c.status} ${txt.slice(0, 200)}` }).then(() => {}, () => {});
    return respuesta(req, { error: "hotmart_cancelar" }, 502);
  }

  // 5) Registrar al instante: acceso hasta el próximo cobro (fin del período pagado o de la prueba)
  const hasta = fecha(d.proximo_cobro);
  await sb.rpc("hotmart_marcar_cancelada", { p_email: email, p_fin: hasta });
  return respuesta(req, { ok: true, hasta });
});
