"use client";
// Pixel de Meta (auditoría H3). Solo se carga si existe NEXT_PUBLIC_META_PIXEL_ID en Vercel y la persona tocó
// "Aceptar" en el aviso de cookies. Si rechaza o no responde, no se carga nada de Meta.
// Aquí se envía PageView en cada pantalla; ViewContent, Lead e InitiateCheckout salen de registrarEvento() (lib/eventos.ts).
import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { leerConsentimiento, suscribirConsentimiento } from "@/lib/eventos";
import { pixelConfigurado, rastrearPixel } from "@/lib/pixel";

export default function MetaPixel() {
  const consentimiento = useSyncExternalStore(suscribirConsentimiento, () => leerConsentimiento() ?? "pendiente", () => "servidor");
  const ruta = usePathname();
  useEffect(() => {
    if (pixelConfigurado && consentimiento === "si") rastrearPixel("PageView");
  }, [consentimiento, ruta]);
  return null;
}
