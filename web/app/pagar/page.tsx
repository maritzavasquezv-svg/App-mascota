"use client";
// Último paso del registro (auditoría H2): al confirmar el correo, la persona llega aquí con el plan que ya eligió
// y un solo botón que abre Hotmart con su correo escrito. Sin volver a elegir ni escribir nada.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, ShieldCheck } from "lucide-react";
import { useT } from "@/lib/i18n";
import { registrarEvento } from "@/lib/eventos";
import { PLANES, PLANES_ID, nombrePlan, precio, resumenPlan, type PlanId } from "@/lib/planes";
import "../flujo.css";

interface Datos { activo: boolean; elegido: PlanId | null; pagar: Record<PlanId, string | null> }

export default function Pagar() {
  const router = useRouter();
  const { t, idioma } = useT();
  const [d, setD] = useState<Datos | null>(null);
  const [plan, setPlan] = useState<PlanId>("anual");
  const [otros, setOtros] = useState(false);
  const [cobro, setCobro] = useState("");
  const contado = useRef(false);

  useEffect(() => {
    let vivo = true;
    fetch("/api/plan").then((r) => {
      if (r.status === 401) { router.replace("/entrar"); return null; }
      return r.ok ? r.json() : null;
    }).then((x: Datos | null) => {
      if (!vivo || !x) return;
      if (x.activo) { router.replace("/inicio"); return; }
      setD(x);
      setCobro(new Date(Date.now() + 7 * 864e5).toLocaleDateString({ es: "es-CL", en: "en-US", pt: "pt-BR" }[idioma], { day: "numeric", month: "long" }));
      if (x.elegido) setPlan(x.elegido);
      if (!contado.current) { contado.current = true; registrarEvento("correo_confirmado", { plan: x.elegido ?? "" }); }
    }).catch(() => {});
    return () => { vivo = false; };
  }, [router, idioma]);

  const enlace = d?.pagar[plan] ?? null;
  const p = PLANES[plan];

  return (
    <main className="flujo">
      <div className="marco">
        <div className="cuerpo entra">
          {!d ? <><h1>{t("Abriendo tu cuenta…", "Opening your account…", "Abrindo sua conta…")}</h1><p className="sub">{t("Un segundo.", "One second.", "Um segundo.")}</p></> : <>
            <p className="sub" style={{ marginBottom: 4 }}>{t("¡Correo confirmado! Último paso", "Email confirmed! Last step", "E-mail confirmado! Último passo")}</p>
            <h1>{t("Activa tus 7 días gratis", "Start your 7 free days", "Ative seus 7 dias grátis")}</h1>
            <p className="sub">{t("Plan elegido: ", "Chosen plan: ", "Plano escolhido: ")}<b>{resumenPlan(plan, idioma)}</b></p>
            <div className="aviso-cobro" style={{ background: "var(--soft, #eef4ff)", borderRadius: 14, padding: "12px 14px", margin: "14px 0", fontSize: 15, lineHeight: 1.45 }}>
              <p style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: 0 }}><CreditCard size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{t("Hotmart te pedirá tu tarjeta, ", "Hotmart will ask for your card, ", "A Hotmart vai pedir seu cartão, ")}<b>{t("pero no cobra nada durante 7 días.", "but charges nothing for 7 days.", "mas não cobra nada por 7 dias.")}</b>{t(
                  ` El primer cobro (${precio(p.total, idioma)}) sería el ${cobro}. Si cancelas antes, no pagas nada.`,
                  ` The first charge (${precio(p.total, idioma)}) would be on ${cobro}. Cancel before then and you pay nothing.`,
                  ` A primeira cobrança (${precio(p.total, idioma)}) seria em ${cobro}. Se cancelar antes, não paga nada.`)}</span></p>
              <p style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "8px 0 0" }}><ShieldCheck size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{t("Tu correo ya va escrito: el plan se activa solo en esta cuenta.", "Your email is already filled in: the plan activates on this account automatically.", "Seu e-mail já vai preenchido: o plano é ativado sozinho nesta conta.")}</span></p>
            </div>
            {enlace
              ? <a className="cta azul" href={enlace} onClick={() => registrarEvento("ir_a_pagar", { plan, desde: "registro" })}>{t("Ir a activar mis 7 días gratis", "Start my 7 free days", "Ativar meus 7 dias grátis")}</a>
              : <p className="nota">{t("Los pagos se activan muy pronto.", "Payments open very soon.", "Os pagamentos serão ativados em breve.")}</p>}
            <button type="button" className="secundario" onClick={() => setOtros((v) => !v)}>{t("Elegir otro plan", "Choose another plan", "Escolher outro plano")}</button>
            {otros && <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
              {PLANES_ID.filter((x) => d.pagar[x]).map((x) => (
                <label key={x} className="check" style={{ alignItems: "center" }}>
                  <input type="radio" name="plan" checked={plan === x} onChange={() => setPlan(x)} />
                  <span><b>{nombrePlan(x, idioma)}</b> · {precio(PLANES[x].porMes, idioma)}{t("/mes", "/mo", "/mês")}{PLANES[x].anual ? ` (${precio(PLANES[x].total, idioma)}${t(" al año", " a year", " ao ano")})` : ""}</span>
                </label>))}
            </div>}
            <Link className="secundario" href="/inicio">{t("Ahora no, ver la app primero", "Not now, show me the app first", "Agora não, ver o app primeiro")}</Link>
          </>}
        </div>
      </div>
    </main>
  );
}
