"use client";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n";

interface Plan { activo: boolean; admin: boolean; estado: string | null; plan: string | null; pagar: { anual: string | null; mensual: string | null } }

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
  const { t } = useT();
  if (!plan || plan.activo) return null;
  const textoEstado = plan.estado === "cancelada" ? t("Tu plan está cancelado.", "Your plan is canceled.", "Seu plano está cancelado.")
    : plan.estado === "reembolsada" ? t("Tu plan fue reembolsado.", "Your plan was refunded.", "Seu plano foi reembolsado.")
      : plan.estado === "vencida" ? t("Tu plan venció.", "Your plan expired.", "Seu plano venceu.") : null;
  return (
    <section className="tarjeta aviso-plan">
      <p className="tarjeta-tit"><span><Sparkles size={15} /> {textoEstado ?? t("Activa tu plan", "Activate your plan", "Ative seu plano")}</span></p>
      <p className="vacio">{t("Con el plan, el ", "With the plan, the ", "Com o plano, o ")}<b>{t("Consejero responde con IA", "Advisor answers with AI", "Conselheiro responde com IA")}</b>{t(" cualquier duda y el ", " any question and the ", " qualquer dúvida e o ")}<b>{t("escáner", "scanner", "scanner")}</b>{t(
        " estima su raza, edad y tamaño. 7 días gratis y garantía Hotmart de 7 días.",
        " estimates breed, age and size. 7 days free and a 7-day Hotmart guarantee.",
        " estima raça, idade e tamanho. 7 dias grátis e garantia Hotmart de 7 dias.")}</p>
      <div className="botones-min" style={{ justifyContent: "flex-start" }}>
        {plan.pagar.anual ? <a className="mini-cta" href={plan.pagar.anual} target="_blank" rel="noopener noreferrer">{t("Anual · US$4,17/mes", "Yearly · US$4.17/mo", "Anual · US$ 4,17/mês")}</a> : null}
        {plan.pagar.mensual ? <a className="mini-cta suave" href={plan.pagar.mensual} target="_blank" rel="noopener noreferrer">{t("Mensual · US$6,99", "Monthly · US$6.99", "Mensal · US$ 6,99")}</a> : null}
        {!plan.pagar.anual && !plan.pagar.mensual && <span className="nota">{t("Los pagos se activan muy pronto.", "Payments open very soon.", "Os pagamentos serão ativados em breve.")}</span>}
      </div>
      <p className="nota">{t("Paga con el mismo correo de tu cuenta Kopeet para que se active sola.", "Pay with the same email as your Kopeet account so it activates automatically.", "Pague com o mesmo e-mail da sua conta Kopeet para ativar automaticamente.")}</p>
    </section>
  );
}
