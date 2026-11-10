"use client";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

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
  if (!plan || plan.activo) return null;
  const textoEstado = plan.estado === "cancelada" ? "Tu plan está cancelado." : plan.estado === "reembolsada" ? "Tu plan fue reembolsado." : plan.estado === "vencida" ? "Tu plan venció." : null;
  return (
    <section className="tarjeta aviso-plan">
      <p className="tarjeta-tit"><span><Sparkles size={15} /> {textoEstado ?? "Activa tu plan"}</span></p>
      <p className="vacio">Con el plan, el <b>Consejero responde con IA</b> cualquier duda y el <b>escáner</b> estima su raza, edad y tamaño. 7 días gratis y garantía Hotmart de 7 días.</p>
      <div className="botones-min" style={{ justifyContent: "flex-start" }}>
        {plan.pagar.anual ? <a className="mini-cta" href={plan.pagar.anual} target="_blank" rel="noopener noreferrer">Anual · US$4,17/mes</a> : null}
        {plan.pagar.mensual ? <a className="mini-cta suave" href={plan.pagar.mensual} target="_blank" rel="noopener noreferrer">Mensual · US$6,99</a> : null}
        {!plan.pagar.anual && !plan.pagar.mensual && <span className="nota">Los pagos se activan muy pronto.</span>}
      </div>
      <p className="nota">Paga con el mismo correo de tu cuenta Kopeet para que se active sola.</p>
    </section>
  );
}
