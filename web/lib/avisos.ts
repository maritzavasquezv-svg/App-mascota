"use client";
// Recordatorios por notificación push (paseo, vacunas y racha). Gratis: usa el navegador del celular.
import { crearCliente } from "@/lib/supabase/cliente";
import type { Idioma } from "@/lib/idiomas";

export type EstadoAvisos = "cargando" | "no-soportado" | "ios-instalar" | "denegado" | "activo" | "inactivo";

const APAGADOS = "kopeet-avisos-apagados"; // la persona los apagó a propósito: no reactivar solos

const esIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const instalada = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
const soportado = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

function claveABytes(base64: string): Uint8Array<ArrayBuffer> {
  const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
  const crudo = atob((base64 + relleno).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(crudo.length));
  for (let i = 0; i < crudo.length; i++) out[i] = crudo.charCodeAt(i);
  return out;
}

async function registro() {
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  return reg;
}

export async function estadoAvisos(): Promise<EstadoAvisos> {
  if (!soportado()) return esIOS() && !instalada() ? "ios-instalar" : "no-soportado";
  if (Notification.permission === "denied") return "denegado";
  if (Notification.permission !== "granted") return "inactivo";
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  return sub ? "activo" : "inactivo";
}

/** Pide permiso (si falta), suscribe este celular y lo guarda en la cuenta. */
export async function activarAvisos(idioma: Idioma): Promise<EstadoAvisos> {
  if (!soportado()) return esIOS() && !instalada() ? "ios-instalar" : "no-soportado";
  const permiso = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permiso !== "granted") return permiso === "denied" ? "denegado" : "inactivo";
  const reg = await registro();
  const sb = crearCliente();
  const { data: clave } = await sb.rpc("push_clave_publica");
  if (!clave) throw new Error("sin clave pública");
  const sub = (await reg.pushManager.getSubscription())
    ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: claveABytes(clave as string) });
  const j = sub.toJSON();
  const { error } = await sb.rpc("push_guardar", {
    p_endpoint: j.endpoint, p_p256dh: j.keys?.p256dh, p_auth: j.keys?.auth,
    p_zona: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Santiago", p_idioma: idioma,
  });
  if (error) throw error;
  try { localStorage.removeItem(APAGADOS); } catch { /* nada */ }
  return "activo";
}

export async function apagarAvisos(): Promise<EstadoAvisos> {
  try { localStorage.setItem(APAGADOS, "1"); } catch { /* nada */ }
  const reg = await navigator.serviceWorker?.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await crearCliente().rpc("push_quitar", { p_endpoint: sub.endpoint });
    await sub.unsubscribe().catch(() => false);
  }
  return "inactivo";
}

export async function avisoDePrueba(): Promise<boolean> {
  const { data } = await crearCliente().rpc("push_pedir_prueba");
  return data === true;
}

/** Al abrir la app: si ya dio permiso (por ejemplo en el recorrido inicial), deja este celular conectado. */
export async function sincronizarAvisos(idioma: Idioma) {
  try {
    if (!soportado() || Notification.permission !== "granted" || localStorage.getItem(APAGADOS)) return;
    await activarAvisos(idioma);
  } catch { /* sin avisos: la app sigue igual */ }
}
