"use client";
// Registro de uso (fuente única de la analítica del panel). Nunca rompe la app: si falla, se ignora.
import { crearCliente } from "@/lib/supabase/cliente";

export type NombreEvento =
  | "pagina_ventas" | "onboarding_paso" | "plan_visto" | "plan_elegido" | "cuenta_creada" | "app_abierta"
  | "perro_creado" | "rutina" | "consejero" | "escaner" | "premios_vistos" | "destino_abierto" | "emergencia_abierta";

/** Identificador anónimo del navegador (para contar el embudo antes de que exista la cuenta). */
function sesion(): string {
  try {
    let s = window.localStorage.getItem("kopeet-sesion");
    if (!s) { s = crypto.randomUUID(); window.localStorage.setItem("kopeet-sesion", s); }
    return s;
  } catch { return ""; }
}

export function registrarEvento(nombre: NombreEvento, props: Record<string, string | number | boolean> = {}) {
  try {
    void crearCliente().rpc("registrar_evento", { p_nombre: nombre, p_sesion: sesion(), p_props: props }).then(() => {}, () => {});
  } catch { /* sin registro */ }
}

/** Una vez al día por navegador (p. ej. "app_abierta"). */
export function registrarUnaVezAlDia(nombre: NombreEvento) {
  try {
    const clave = `kopeet-evento-${nombre}`, hoy = new Date().toDateString();
    if (window.localStorage.getItem(clave) === hoy) return;
    window.localStorage.setItem(clave, hoy);
  } catch { /* igual se registra */ }
  registrarEvento(nombre);
}

// ---------- Canal de origen (primer contacto) ----------
const CLAVE_ORIGEN = "kopeet-origen";

/** Guarda de dónde llegó la persona la primera vez: ?origen=instagram, ?utm_source=tiktok, ?ref=... */
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
    if (origen) window.localStorage.setItem(CLAVE_ORIGEN, origen);
  } catch { /* nada */ }
}

export function leerOrigen(): string | null {
  try { return window.localStorage.getItem(CLAVE_ORIGEN); } catch { return null; }
}
