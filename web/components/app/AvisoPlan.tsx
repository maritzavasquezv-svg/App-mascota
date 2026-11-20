"use client";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n";
import { PLANES_ID, resumenPlan, type PlanId } from "@/lib/planes";
import { registrarEvento } from "@/lib/eventos";

export interface Plan { activo: boolean; admin: boolean; estado: string | null; plan: string | null; origen?: string | null; cancelada?: boolean; pagoFallido?: boolean; vence?: string | null; elegido?: PlanId | null; pagar: Record<PlanId, string | null> }

/** Lee el estado del plan una vez (para mostrar avisos y botones de pago). */
export function usePlan() {
  const [plan, setPlan] = useState<Plan | null>(null);
  useEffect(() => {
    let vivo = true;
    fetch("/api/plan").then((r) => (r.ok ? r.json() : null)).then((d) => { if (vivo && d) setPlan(d as Plan); }).catch(() => {});
    return () => { vivo = false; };
  }, []);
  return plan;
}

/** Tarjeta para activar el plan (solo se muestra si no está activo). */
export default function AvisoPlan({ plan }: { plan: Plan | null }) {
  const { t, idioma } = useT();
  // Auditoría H5: la renovación no se pudo cobrar. Sigue con acceso unos días y se le pide actualizar la tarjeta (no comprar otro plan).
  if (plan?.activo && plan.pagoFallido) {
    const hasta = plan.vence ? new Date(plan.vence).toLocaleDateString({ es: "es-CL", en: "en-US", pt: "pt-BR" }[idioma], { day: "numeric", month: "long" }) : null;
    return (
      <section className="tarjeta aviso-plan" role="alert">
        <p className="tarjeta-tit"><span><Sparkles size={15} /> {t("Tu pago no pasó", "Your payment didn't go through", "Seu pagamento não passou")}</span></p>
        <p className="vacio">{t("Hotmart no pudo cobrar la renovación de tu plan. ", "Hotmart couldn't charge your plan renewal. ", "A Hotmart não conseguiu cobrar a renovação do seu plano. ")}<b>{t("Actualiza tu tarjeta en Hotmart", "Update your card in Hotmart", "Atualize seu cartão na Hotmart")}</b>{hasta ? t(` antes del ${hasta} para no perder el acceso.`, ` before ${hasta} to keep your access.`, ` antes de ${hasta} para não perder o acesso.`) : t(" para no perder el acceso.", " to keep your access.", " para não perder o acesso.")}</p>
        <div className="botones-min" style={{ justifyContent: "flex-start" }}>
          <a className="mini-cta" href="https://consumer.hotmart.com/" target="_blank" rel="noopener noreferrer">{t("Actualizar mi tarjeta", "Update my card", "Atualizar meu cartão")}</a>
        </div>
        <p className="nota">{t("Entra con el correo con que pagaste → Compras → tu suscripción → cambiar forma de pago. No compres otro plan: se duplicaría.", "Sign in with the email you paid with → Purchases → your subscription → change payment method. Don't buy another plan: it would be duplicated.", "Entre com o e-mail com que pagou → Compras → sua assinatura → alterar forma de pagamento. Não compre outro plano: ficaria duplicado.")}</p>
      </section>
    );
  }
  if (!plan || plan.activo) return null;
  // El plan que eligió al registrarse va primero (botón principal).
  const enlaces = PLANES_ID.filter((p) => plan.pagar[p]).sort((a, b) => Number(b === plan.elegido) - Number(a === plan.elegido));
  const textoEstado = plan.estado === "cancelada" ? t("Tu plan está cancelado.", "Your plan is canceled.", "Seu plano está cancelado.")
    : plan.estado === "reembolsada" ? t("Tu plan fue reembolsado.", "Your plan was refunded.", "Seu plano foi reembolsado.")
      : plan.estado === "vencida" ? t("Tu plan venció.", "Your plan expired.", "Seu plano venceu.") : null;
  return (
    <section className="tarjeta aviso-plan">
      <p className="tarjeta-tit"><span><Sparkles size={15} /> {textoEstado ?? t("Activa tu plan", "Activate your plan", "Ative seu plano")}</span></p>
      <p className="vacio">{t("Con el plan, el ", "With the plan, the ", "Com o plano, o ")}<b>{t("Consejero responde con IA", "Advisor answers with AI", "Conselheiro responde com IA")}</b>{t(" cualquier duda y el ", " any question and the ", " qualquer dúvida e o ")}<b>{t("escáner", "scanner", "scanner")}</b>{t(
        " estima su raza, edad y tamaño. 7 días gratis y garantía Hotmart de 15 días.",
        " estimates breed, age and size. 7 days free and a 15-day Hotmart guarantee.",
        " estima raça, idade e tamanho. 7 dias grátis e garantia Hotmart de 15 dias.")}</p>
      <div className="botones-min" style={{ justifyContent: "flex-start" }}>
        {enlaces.map((p, n) => <a key={p} className={`mini-cta${n % 2 ? " suave" : ""}`} href={plan.pagar[p]!} target="_blank" rel="noopener noreferrer" onClick={() => registrarEvento("ir_a_pagar", { plan: p, desde: "app" })}>{resumenPlan(p, idioma)}</a>)}
        {!enlaces.length && <span className="nota">{t("Los pagos se activan muy pronto.", "Payments open very soon.", "Os pagamentos serão ativados em breve.")}</span>}
      </div>
      <p className="nota">{t("Hotmart pide tu tarjeta, pero no cobra durante los 7 días gratis. Tu correo ya va escrito y el plan se activa solo en esta cuenta.", "Hotmart asks for your card, but charges nothing during the 7 free days. Your email is already filled in and the plan activates on this account automatically.", "A Hotmart pede seu cartão, mas não cobra nada nos 7 dias grátis. Seu e-mail já vai preenchido e o plano é ativado sozinho nesta conta.")}</p>
    </section>
  );
}
