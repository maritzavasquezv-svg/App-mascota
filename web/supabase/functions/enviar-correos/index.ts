// Correos a clientes por Gmail (soporte de la marca): "tu pago no pasó" y aviso antes del primer cobro.
// La llama pg_cron cada hora (y el botón "Enviar correo de prueba" del Panel) con la cabecera x-kopeet-cron.
// La clave de aplicación de Gmail la guarda la dueña en el Panel (privado.secretos); aquí solo se lee.
import nodemailer from "npm:nodemailer@6.9.16";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const APP = "Kopeet";
const URL_APP = "https://app-mascota-navy.vercel.app";

function claveServicio(): string {
  const directa = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (directa) return directa;
  try {
    const varias = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    return varias.default ?? Object.values(varias)[0] ?? "";
  } catch { return ""; }
}
const sb = createClient(Deno.env.get("SUPABASE_URL")!, claveServicio(), { auth: { persistSession: false } });

type Idioma = "es" | "en" | "pt";
interface Correo { clave: string; email: string; tipo: "pago_fallido" | "aviso_cobro"; idioma: string; datos: { hasta?: string; cobro?: string; plan?: string } }

const tr = (i: Idioma, es: string, en: string, pt: string) => (i === "en" ? en : i === "pt" ? pt : es);
const fecha = (iso: string | undefined, i: Idioma) => iso
  ? new Date(iso).toLocaleDateString(i === "en" ? "en-US" : i === "pt" ? "pt-BR" : "es-CL", { day: "numeric", month: "long", timeZone: "America/Santiago" })
  : "";

function armar(c: Correo, soporte: string): { asunto: string; texto: string } {
  const i: Idioma = c.idioma === "en" || c.idioma === "pt" ? c.idioma : "es";
  const firma = tr(i, `\n\n¿Dudas? Responde este correo.\nEquipo ${APP} · ${URL_APP}`, `\n\nQuestions? Just reply to this email.\nThe ${APP} team · ${URL_APP}`, `\n\nDúvidas? Responda este e-mail.\nEquipe ${APP} · ${URL_APP}`);
  if (c.tipo === "pago_fallido") {
    const hasta = fecha(c.datos.hasta, i);
    return {
      asunto: tr(i, `Tu pago de ${APP} no pasó`, `Your ${APP} payment didn't go through`, `Seu pagamento do ${APP} não passou`),
      texto: tr(i,
        `Hola:\n\nHotmart no pudo cobrar la renovación de tu plan ${APP}. Para no perder el acceso, actualiza tu tarjeta en Hotmart${hasta ? ` antes del ${hasta}` : ""}:\n\n1. Entra a https://consumer.hotmart.com con el correo con que pagaste.\n2. Ve a Compras, elige tu suscripción de ${APP} y cambia la forma de pago.\n\nNo compres otro plan: se duplicaría el cobro.`,
        `Hi,\n\nHotmart couldn't charge your ${APP} plan renewal. To keep your access, update your card in Hotmart${hasta ? ` before ${hasta}` : ""}:\n\n1. Go to https://consumer.hotmart.com with the email you paid with.\n2. Open Purchases, choose your ${APP} subscription and change the payment method.\n\nDon't buy another plan: you'd be charged twice.`,
        `Olá,\n\nA Hotmart não conseguiu cobrar a renovação do seu plano ${APP}. Para não perder o acesso, atualize seu cartão na Hotmart${hasta ? ` antes de ${hasta}` : ""}:\n\n1. Entre em https://consumer.hotmart.com com o e-mail com que pagou.\n2. Vá em Compras, escolha sua assinatura do ${APP} e altere a forma de pagamento.\n\nNão compre outro plano: a cobrança ficaria duplicada.`) + firma,
    };
  }
  const cobro = fecha(c.datos.cobro, i);
  return {
    asunto: tr(i, `Tu prueba gratis de ${APP} termina pronto`, `Your ${APP} free trial ends soon`, `Seu teste grátis do ${APP} termina em breve`),
    texto: tr(i,
      `Hola:\n\nTe avisamos con tiempo: ${cobro ? `el ${cobro}` : "en unos días"} Hotmart hará el primer cobro de tu plan ${APP}.\n\n- Si quieres seguir, no tienes que hacer nada.\n- Si no, cancela antes de esa fecha en ${APP} → Cuenta → "Cancelar mi suscripción", y no se te cobrará nada.`,
      `Hi,\n\nA heads-up: ${cobro ? `on ${cobro}` : "in a few days"} Hotmart will make the first charge for your ${APP} plan.\n\n- If you want to continue, you don't need to do anything.\n- If not, cancel before that date in ${APP} → Account → "Cancel my subscription" and you won't be charged.`,
      `Olá,\n\nAvisamos com antecedência: ${cobro ? `em ${cobro}` : "em alguns dias"} a Hotmart fará a primeira cobrança do seu plano ${APP}.\n\n- Se quiser continuar, não precisa fazer nada.\n- Se não, cancele antes dessa data em ${APP} → Conta → "Cancelar minha assinatura" e nada será cobrado.`) + firma,
  };
}

Deno.serve(async (req) => {
  const { data: valido } = await sb.rpc("push_cron_valido", { p_token: req.headers.get("x-kopeet-cron") ?? "" });
  if (valido !== true) return new Response("no autorizado", { status: 401 });
  const prueba = Boolean((await req.json().catch(() => ({})))?.prueba);

  const { data: cfg, error } = await sb.rpc("correos_preparar");
  if (error) {
    await sb.rpc("registrar_error", { p_origen: "correos", p_mensaje: error.message }).then(() => {}, () => {});
    return Response.json({ ok: false }, { status: 500 });
  }
  if (!cfg?.usuario || !cfg?.clave) return Response.json({ ok: true, sinConfigurar: true });

  const smtp = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: cfg.usuario, pass: cfg.clave } });
  const de = `"${APP}" <${cfg.usuario}>`;

  if (prueba) {
    try {
      await smtp.sendMail({ from: de, to: cfg.usuario, subject: `Prueba de correos de ${APP}`, text: `¡Funciona! ${APP} ya puede enviar correos a tus clientes desde ${cfg.usuario}.\n\nEjemplo del aviso "tu pago no pasó":\n\n${armar({ clave: "", email: "", tipo: "pago_fallido", idioma: "es", datos: { hasta: new Date(Date.now() + 5 * 864e5).toISOString() } }, cfg.usuario).texto}` });
      await sb.rpc("correos_marcar", { p_clave: `prueba:${Date.now()}`, p_email: cfg.usuario, p_tipo: "prueba" });
      return Response.json({ ok: true });
    } catch (e) {
      await sb.rpc("registrar_error", { p_origen: "correos", p_mensaje: `prueba: ${e instanceof Error ? e.message : String(e)}`.slice(0, 300) }).then(() => {}, () => {});
      return Response.json({ ok: false }, { status: 502 });
    }
  }

  let enviados = 0, fallidos = 0;
  for (const c of (cfg.correos ?? []) as Correo[]) {
    try {
      const { asunto, texto } = armar(c, cfg.usuario);
      await smtp.sendMail({ from: de, to: c.email, replyTo: cfg.usuario, subject: asunto, text: texto });
      await sb.rpc("correos_marcar", { p_clave: c.clave, p_email: c.email, p_tipo: c.tipo });
      enviados++;
    } catch (e) {
      fallidos++;
      await sb.rpc("registrar_error", { p_origen: "correos", p_mensaje: `${c.tipo}: ${e instanceof Error ? e.message : String(e)}`.slice(0, 300) }).then(() => {}, () => {});
    }
  }
  return Response.json({ ok: true, enviados, fallidos });
});
