"use client";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { useT } from "@/lib/i18n";
import { PERROS_FAMILIAR, PLANES, precio, resumenPlan } from "@/lib/planes";
import type { Plan } from "@/components/app/AvisoPlan";

export interface Limite { limite: number; actuales: number }

/** Cuántos perros tiene la cuenta y cuántos permite su plan (lo decide la base). */
export function useLimitePerros() {
  const [lim, setLim] = useState<Limite | null>(null);
  useEffect(() => {
    let vivo = true;
    crearCliente().rpc("mi_limite_perros").then(({ data }) => { if (vivo && data) setLim(data as Limite); });
    return () => { vivo = false; };
  }, []);
  return lim;
}

/** Tarjeta para pasar al Plan Familiar cuando ya no caben más perros. */
export function PasarAFamiliar({ lim, plan }: { lim: Limite; plan: Plan | null }) {
  const { t, idioma } = useT();
  if (lim.limite >= PERROS_FAMILIAR) {
    return (
      <section className="tarjeta aviso-plan">
        <p className="tarjeta-tit"><span><Users size={15} /> {t(`Tienes ${lim.actuales} perros`, `You have ${lim.actuales} dogs`, `Você tem ${lim.actuales} cães`)}</span></p>
        <p className="vacio">{t(`El Plan Familiar cubre hasta ${PERROS_FAMILIAR} perros. Si tienes más, escríbenos a maritzavasquezv@gmail.com.`,
          `The Family plan covers up to ${PERROS_FAMILIAR} dogs. If you have more, email us at maritzavasquezv@gmail.com.`,
          `O Plano Familiar cobre até ${PERROS_FAMILIAR} cães. Se tiver mais, escreva para maritzavasquezv@gmail.com.`)}</p>
      </section>
    );
  }
  const enlaces = (["familiar_mensual", "familiar_anual"] as const).filter((p) => plan?.pagar[p]);
  return (
    <section className="tarjeta aviso-plan">
      <p className="tarjeta-tit"><span><Users size={15} /> {t("Tu plan es para 1 perro", "Your plan covers 1 dog", "Seu plano é para 1 cão")}</span></p>
      <p className="vacio">{t("Con el ", "With the ", "Com o ")}<b>{t("Plan Familiar", "Family plan", "Plano Familiar")}</b>{t(
        ` sumas hasta ${PERROS_FAMILIAR} perros, cada uno con su plan, su rutina y sus premios. Desde ${precio(PLANES.familiar_anual.porMes, idioma)} al mes.`,
        ` you can add up to ${PERROS_FAMILIAR} dogs, each with its own plan, routine and rewards. From ${precio(PLANES.familiar_anual.porMes, idioma)} a month.`,
        ` você adiciona até ${PERROS_FAMILIAR} cães, cada um com seu plano, rotina e prêmios. A partir de ${precio(PLANES.familiar_anual.porMes, idioma)} por mês.`)}</p>
      <div className="botones-min" style={{ justifyContent: "flex-start" }}>
        {enlaces.map((p, n) => <a key={p} className={`mini-cta${n ? " suave" : ""}`} href={plan!.pagar[p]!} target="_blank" rel="noopener noreferrer">{resumenPlan(p, idioma)}</a>)}
        {!enlaces.length && <span className="nota">{t("Los pagos se activan muy pronto.", "Payments open very soon.", "Os pagamentos serão ativados em breve.")}</span>}
      </div>
      <p className="nota">{t("Paga con el mismo correo de tu cuenta Kopeet para que se active solo.", "Pay with the same email as your Kopeet account so it activates automatically.", "Pague com o mesmo e-mail da sua conta Kopeet para ativar automaticamente.")}</p>
    </section>
  );
}
