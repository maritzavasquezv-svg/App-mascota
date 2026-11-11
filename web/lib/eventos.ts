"use client";
// Registro de uso (fuente única de la analítica del panel). Nunca rompe la app: si falla, se ignora.
// Es medición NO esencial: solo funciona si la persona aceptó en el aviso de cookies (consentimiento "si").
import { crearCliente } from "@/lib/supabase/cliente";

export type NombreEvento =
  | "pagina_ventas" | "onboarding_paso" | "plan_visto" | "plan_elegido" | "cuenta_creada" | "app_abierta"
  | "perro_creado" | "rutina" | "consejero" | "escaner" | "premios_vistos" | "destino_abierto" | "emergencia_abierta";

// ---------- Consentimiento de medición ----------
const CLAVE_CONSENTIMIENTO = "kopeet-consentimiento"; // "si" | "no" (cookie, para que el aviso no reaparezca)
const oyentes = new Set<() => void>();

export type Consentimiento = "si" | "no" | null;
export function leerConsentimiento(): Consentimiento {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )kopeet-consentimiento=(si|no)/);
  return (m?.[1] as Consentimiento) ?? null;
}
export function guardarConsentimiento(v: "si" | "no" | null) {
  document.cookie = v
    ? `${CLAVE_CONSENTIMIENTO}=${v}; path=/; max-age=15552000; samesite=lax` // 6 meses
    : `${CLAVE_CONSENTIMIENTO}=; path=/; max-age=0`;
  if (v === "si") persistirOrigenPendiente();
  if (v === "no") {
    // Si la persona rechaza, se borra lo que la medición hubiera guardado en este navegador.
    try { ["kopeet-sesion", "kopeet-origen"].forEach((k) => window.localStorage.removeItem(k)); } catch { /* nada */ }
  }
  oyentes.forEach((f) => f());
}
export function suscribirConsentimiento(f: () => void) { oyentes.add(f); return () => { oyentes.delete(f); }; }
const permitido = () => leerConsentimiento() === "si";

/** Identificador anónimo del navegador (para contar el embudo antes de que exista la cuenta). */
function sesion(): string {
  try {
    let s = window.localStorage.getItem("kopeet-sesion");
    if (!s) { s = crypto.randomUUID(); window.localStorage.setItem("kopeet-sesion", s); }
    return s;
  } catch { return ""; }
}

export function registrarEvento(nombre: NombreEvento, props: Record<string, string | number | boolean> = {}) {
  if (!permitido()) return;
  try {
    void crearCliente().rpc("registrar_evento", { p_nombre: nombre, p_sesion: sesion(), p_props: props }).then(() => {}, () => {});
  } catch { /* sin registro */ }
}

/** Una vez al día por navegador (p. ej. "app_abierta"). */
export function registrarUnaVezAlDia(nombre: NombreEvento) {
  if (!permitido()) return;
  try {
    const clave = `kopeet-evento-${nombre}`, hoy = new Date().toDateString();
    if (window.localStorage.getItem(clave) === hoy) return;
    window.localStorage.setItem(clave, hoy);
  } catch { /* igual se registra */ }
  registrarEvento(nombre);
}

// ---------- Canal de origen (primer contacto) ----------
const CLAVE_ORIGEN = "kopeet-origen";
let origenPendiente: string | null = null; // se recuerda en memoria hasta que la persona acepte

/** Detecta de dónde llegó la persona: ?origen=instagram, ?utm_source=tiktok, ?ref=... o la página anterior. */
export function capturarOrigen() {
  try {
    if (window.localStorage.getItem(CLAVE_ORIGEN)) return;
    const q = new URLSearchParams(window.location.search);
    const crudo = q.get("origen") ?? q.get("utm_source") ?? q.get("ref") ?? q.get("src");
    let origen = crudo?.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30) || "";
    if (!origen && document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (!host.endsWith(window.location.hostname)) {
        origen = /instagram/.test(host) ? "instagram" : /facebook|fb\./.test(host) ? "facebook" : /tiktok/.test(host) ? "tiktok"
          : /google\./.test(host) ? "google" : /youtube/.test(host) ? "youtube" : /hotmart/.test(host) ? "hotmart" : host.slice(0, 30);
      }
    }
    if (!origen) return;
    if (permitido()) window.localStorage.setItem(CLAVE_ORIGEN, origen);
    else origenPendiente = origen;
  } catch { /* nada */ }
}
function persistirOrigenPendiente() {
  try { if (origenPendiente && !window.localStorage.getItem(CLAVE_ORIGEN)) window.localStorage.setItem(CLAVE_ORIGEN, origenPendiente); } catch { /* nada */ }
}

export function leerOrigen(): string | null {
  if (!permitido()) return null;
  try { return window.localStorage.getItem(CLAVE_ORIGEN); } catch { return null; }
}
