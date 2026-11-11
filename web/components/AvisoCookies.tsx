"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { guardarConsentimiento, leerConsentimiento, suscribirConsentimiento } from "@/lib/eventos";
import { useT } from "@/lib/i18n";

/**
 * Aviso de cookies: "Aceptar" y "Rechazar" igual de fáciles. Nada de medición se guarda ni se envía
 * antes de aceptar (ver lib/eventos.ts). Las cookies necesarias (sesión e idioma) no requieren permiso.
 */
export default function AvisoCookies() {
  const { t, idioma } = useT();
  // En el servidor no se sabe la elección: se asume "ya respondió" para no mostrar el aviso de golpe y luego ocultarlo.
  const eleccion = useSyncExternalStore(suscribirConsentimiento, () => leerConsentimiento() ?? "pendiente", () => "servidor");
  if (eleccion !== "pendiente") return null;
  const ruta = idioma === "es" ? "/cookies" : `/${idioma}/cookies`;
  return (
    <div className="aviso-cookies" role="region" aria-label={t("Aviso de cookies", "Cookie notice", "Aviso de cookies")}>
      <p>
        {t("Usamos cookies necesarias para que Kopeet funcione. Con tu permiso, también medimos de forma anónima cómo se usa, para mejorarla. ",
          "We use necessary cookies so Kopeet works. With your permission, we also measure anonymously how it's used, to improve it. ",
          "Usamos cookies necessários para o Kopeet funcionar. Com sua permissão, também medimos de forma anônima como ele é usado, para melhorá-lo. ")}
        <Link href={ruta}>{t("Más información", "Learn more", "Saiba mais")}</Link>
      </p>
      <div className="aviso-cookies-bt">
        <button type="button" onClick={() => guardarConsentimiento("no")}>{t("Rechazar", "Reject", "Recusar")}</button>
        <button type="button" onClick={() => guardarConsentimiento("si")}>{t("Aceptar", "Accept", "Aceitar")}</button>
      </div>
    </div>
  );
}

/** Botón para cambiar la elección (en la página de cookies). */
export function CambiarCookies() {
  const { t } = useT();
  const eleccion = useSyncExternalStore(suscribirConsentimiento, () => leerConsentimiento() ?? "pendiente", () => "pendiente");
  return (
    <p>
      {t("Tu elección actual: ", "Your current choice: ", "Sua escolha atual: ")}
      <b>{eleccion === "si" ? t("medición aceptada", "measurement accepted", "medição aceita") : eleccion === "no" ? t("medición rechazada", "measurement rejected", "medição recusada") : t("sin elegir", "not chosen", "não escolhida")}</b>.{" "}
      <button type="button" className="boton-legal" onClick={() => guardarConsentimiento(null)}>{t("Cambiar mi elección", "Change my choice", "Mudar minha escolha")}</button>
    </p>
  );
}
