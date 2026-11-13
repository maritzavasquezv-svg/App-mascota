"use client";
import { useState } from "react";
import { CircleCheck, XCircle } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { locale, useT } from "@/lib/i18n";
import type { Plan } from "@/components/app/AvisoPlan";

/**
 * Cancelar la suscripción con un clic, sin entrar a Hotmart ("tan fácil como contratar").
 * La función Edge "cancelar-suscripcion" identifica a la persona por su sesión y cancela en Hotmart.
 */
export default function CancelarSuscripcion({ plan }: { plan: Plan | null }) {
  const { t, idioma } = useT();
  const [paso, setPaso] = useState<"inicio" | "confirmar" | "cancelando" | "lista" | "error">("inicio");
  const [hasta, setHasta] = useState<string | null>(null);

  if (!plan || plan.admin || plan.origen !== "hotmart" || !plan.activo) return null;

  const fecha = (s: string | null | undefined) =>
    s ? new Intl.DateTimeFormat(locale(idioma), { day: "numeric", month: "long", year: "numeric" }).format(new Date(s)) : null;

  const yaCancelada = plan.cancelada || paso === "lista";
  const fin = fecha(hasta ?? plan.vence);

  if (yaCancelada) {
    return (
      <div className="cancelada-ok" role="status">
        <CircleCheck size={18} />
        <p><b>{t("Tu suscripción está cancelada.", "Your subscription is canceled.", "Sua assinatura está cancelada.")}</b>{" "}
          {t("No se te cobrará más.", "You won't be charged again.", "Você não será mais cobrado(a).")}
          {fin ? t(` Sigues teniendo acceso hasta el ${fin}.`, ` You keep access until ${fin}.`, ` Você continua com acesso até ${fin}.`) : ""}</p>
      </div>
    );
  }

  async function cancelar() {
    setPaso("cancelando");
    try {
      const { data } = await crearCliente().auth.getSession();
      const token = data.session?.access_token;
      const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cancelar-suscripcion`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, "Content-Type": "application/json" },
        body: "{}",
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error ?? "error");
      setHasta(j.hasta ?? null);
      setPaso("lista");
    } catch {
      setPaso("error");
    }
  }

  return (
    <div className="cancelar-caja">
      {paso === "inicio" && (
        <button className="secundario" onClick={() => setPaso("confirmar")}><XCircle size={16} /> {t("Cancelar mi suscripción", "Cancel my subscription", "Cancelar minha assinatura")}</button>
      )}
      {(paso === "confirmar" || paso === "cancelando") && (
        <>
          <p><b>{t("¿Seguro que quieres cancelar?", "Are you sure you want to cancel?", "Tem certeza de que quer cancelar?")}</b>{" "}
            {t("No se te cobrará más y sigues teniendo acceso hasta el final del período que ya pagaste (o de tu prueba gratis).",
              "You won't be charged again and you keep access until the end of the period you already paid for (or your free trial).",
              "Você não será mais cobrado(a) e continua com acesso até o fim do período já pago (ou do seu teste grátis).")}</p>
          <div className="botones-min" style={{ justifyContent: "flex-start" }}>
            <button className="peligro" disabled={paso === "cancelando"} onClick={cancelar}>
              {paso === "cancelando" ? t("Cancelando…", "Canceling…", "Cancelando…") : t("Sí, cancelar", "Yes, cancel", "Sim, cancelar")}</button>
            <button className="suave" disabled={paso === "cancelando"} onClick={() => setPaso("inicio")}>{t("No, mantener mi plan", "No, keep my plan", "Não, manter meu plano")}</button>
          </div>
        </>
      )}
      {paso === "error" && (
        <p className="error" role="alert">{t(
          "No pudimos cancelar desde aquí. Hazlo en Hotmart con el botón de abajo, o escríbenos a maritzavasquezv@gmail.com y lo cancelamos por ti.",
          "We couldn't cancel from here. Do it in Hotmart with the button below, or email us at maritzavasquezv@gmail.com and we'll cancel it for you.",
          "Não conseguimos cancelar daqui. Faça na Hotmart com o botão abaixo, ou escreva para maritzavasquezv@gmail.com e cancelamos para você.")}</p>
      )}
    </div>
  );
}
