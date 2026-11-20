// Pixel de Meta (auditoría H3): carga y envío de eventos. Quien lo llama debe revisar antes el consentimiento.
// Píxel "Kopeet web" (creado el 20 nov 2026 en el portafolio comercial Kopeet). Es público; una variable
// NEXT_PUBLIC_META_PIXEL_ID en Vercel lo puede reemplazar.
const ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID || "1680923340048290").replace(/\D/g, "");
export const pixelConfigurado = ID.length >= 10;

type Fbq = ((...a: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[][]; loaded?: boolean; version?: string; push?: unknown };
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq } }

/** Crea el píxel (una sola vez). Los eventos enviados antes de que cargue el script quedan en cola. */
export function asegurarPixel(): Fbq | null {
  if (!pixelConfigurado || typeof window === "undefined") return null;
  if (window.fbq) return window.fbq;
  const f = function (...a: unknown[]) { if (f.callMethod) f.callMethod(...a); else f.queue.push(a); } as Fbq;
  f.queue = []; f.loaded = true; f.version = "2.0"; f.push = f;
  window.fbq = f; window._fbq = f;
  const s = document.createElement("script");
  s.async = true; s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  f("init", ID);
  return f;
}

export function rastrearPixel(evento: string, datos: Record<string, string> = {}) {
  try { asegurarPixel()?.("track", evento, datos); } catch { /* sin píxel */ }
}
