"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Check, CreditCard, Lock, ShieldCheck, X } from "lucide-react";
import { contarRespuestas, etiquetaEdad, etiquetaOrigen, fechasPrueba, leer, minutosEjercicio, nombreDe, preocupacion, type Respuestas } from "@/lib/onboarding";
import { useT } from "@/lib/i18n";
import SelectorIdioma from "@/components/SelectorIdioma";
import { registrarEvento } from "@/lib/eventos";

type Plan = "anual" | "mensual";

export default function Paywall() {
  const router = useRouter();
  const { t, idioma } = useT();
  const [r] = useState<Respuestas>(() => leer());
  const [pantalla, setPantalla] = useState(1);
  const [plan, setPlan] = useState<Plan>("anual");
  const [hoy] = useState(() => new Date());
  const fechas = fechasPrueba(hoy, idioma);

  useEffect(() => { window.scrollTo(0, 0); }, [pantalla]);
  useEffect(() => { registrarEvento("plan_visto"); }, []);

  const sinNombre = !r.nombre.trim();
  const nombre = nombreDe(r, idioma);
  // "de tu perro" / "de Bruno"; "your dog's" / "Bruno's"; "do seu cão" / "de Bruno"
  const quien = t(sinNombre ? "de tu perro" : `de ${nombre}`, sinNombre ? "your dog's" : `${nombre}'s`, sinNombre ? "do seu cão" : `de ${nombre}`);
  const salir = () => router.push("/");
  const detalle = [etiquetaOrigen(r.origen, idioma), etiquetaEdad(r.edad, idioma)].filter(Boolean).join(" · ");
  const anual = t("US$49,99", "US$49.99", "US$ 49,99");
  const mensual = t("US$6,99", "US$6.99", "US$ 6,99");

  const cabeza = (
    <div className="cabeza">
      {pantalla > 1
        ? <button className="atras" onClick={() => setPantalla((p) => p - 1)} aria-label={t("Volver", "Back", "Voltar")}><ArrowLeft size={18} /></button>
        : null}
      <img src="/marca/isotipo-kopeet-180.png" alt="" /><b>Kopeet</b>
      <SelectorIdioma />
      <button className="cerrar" onClick={salir} aria-label={t("Cerrar", "Close", "Fechar")}><X size={17} /></button>
    </div>
  );

  return (
    <main className="flujo">
      <div className="marco">
        {cabeza}
        <div className="cuerpo entra" key={pantalla}>
          {pantalla === 1 && (<>
            <h1>{idioma === "en"
              ? <><em>{sinNombre ? "Your dog's" : `${nombre}'s`} Welcome Plan</em> is ready</>
              : <>{t("El ", "", "O ")}<em>{t("Plan de Bienvenida", "", "Plano de Boas-vindas")}</em> {quien} {t("está listo", "", "está pronto")}</>}</h1>
            {detalle && <p className="sub">{detalle.charAt(0).toUpperCase() + detalle.slice(1)}</p>}
            <div className="resumen">
              <div><span>{t("Ejercicio de hoy", "Today's exercise", "Exercício de hoje")}</span><b>{minutosEjercicio(r.edad)} min</b></div>
              <div><span>{t("Avisos", "Reminders", "Avisos")}</span><b>{r.hora ? t("Cada día a tu hora", "Every day at your time", "Todo dia no seu horário") : t("Cuando los actives", "When you turn them on", "Quando você ativar")}</b></div>
              {r.preocupaciones[0] && <div><span>{t("Primero en su plan", "First in the plan", "Primeiro no plano")}</span><b>{preocupacion(r.preocupaciones[0], idioma)}</b></div>}
              <div className="bloq"><span><Lock size={14} /> {t("Ración diaria", "Daily food", "Ração diária")}</span><b>{t("Según su peso", "Based on weight", "Conforme o peso")}</b></div>
              <div className="bloq"><span><Lock size={14} /> {t("Vacunas", "Vaccines", "Vacinas")}</span><b>{t("Calendario completo", "Full calendar", "Calendário completo")}</b></div>
              <div className="bloq"><span><Lock size={14} /> {t("Adaptación", "Settling in", "Adaptação")}</span><b>{t("Plan de 1 mes", "1-month plan", "Plano de 1 mês")}</b></div>
            </div>
            <p className="nota">{t(`Hecho con tus ${contarRespuestas(r)} respuestas.`, `Made with your ${contarRespuestas(r)} answers.`, `Feito com suas ${contarRespuestas(r)} respostas.`)}</p>
            <div className="espacio" />
            <button className="cta" onClick={() => setPantalla(2)}>{t("Ver cómo empezar", "See how to start", "Ver como começar")}</button>
          </>)}

          {pantalla === 2 && (<>
            <h1>{t("Así funcionan tus ", "How your ", "Assim funcionam seus ")}<em>{t("7 días gratis", "7 free days", "7 dias grátis")}</em>{t("", " work", "")}</h1>
            <div className="linea">
              <div className="hito on"><span className="ic"><Check size={16} /></span><div><b>{t("Hoy", "Today", "Hoje")} · {fechas.hoy}</b><p>{t(`Acceso completo al plan ${quien}.`, `Full access to ${quien} plan.`, `Acesso completo ao plano ${quien}.`)}</p></div></div>
              <div className="hito"><span className="ic"><Bell size={16} /></span><div><b>{fechas.aviso}</b><p>{t("Te avisamos que tu prueba está por terminar.", "We remind you your trial is about to end.", "Avisamos que seu teste está acabando.")}</p></div></div>
              <div className="hito"><span className="ic"><CreditCard size={16} /></span><div><b>{fechas.cobro}</b><p>{t("Se cobra el plan que elijas. Cancela antes y no pagas nada.", "The plan you choose is charged. Cancel before and you pay nothing.", "É cobrado o plano que você escolher. Cancele antes e não paga nada.")}</p></div></div>
            </div>
            <div className="garantia"><ShieldCheck size={26} /><div><b>{t("Garantía Hotmart de 7 días", "7-day Hotmart guarantee", "Garantia Hotmart de 7 dias")}</b><span>{t("Si no te sirve, te devolvemos el dinero.", "If it doesn't help, we refund your money.", "Se não servir, devolvemos seu dinheiro.")}</span></div></div>
            <div className="espacio" />
            <button className="cta" onClick={() => setPantalla(3)}>{t("Elegir mi plan", "Choose my plan", "Escolher meu plano")}</button>
          </>)}

          {pantalla === 3 && (<>
            <h1>{t(`Empieza el plan ${quien} hoy`, `Start ${quien} plan today`, `Comece o plano ${quien} hoje`)}</h1>
            <ul className="beneficios">
              <li><Check size={16} /><span><b>{t("Qué hacer cada día", "What to do each day", "O que fazer cada dia")}</b>{t(", sin adivinar", ", no guessing", ", sem adivinhar")}</span></li>
              <li><Check size={16} /><span><b>{t("Avisos", "Reminders", "Avisos")}</b>{t(" de vacunas y desparasitación", " for vaccines and deworming", " de vacinas e vermifugação")}</span></li>
              <li><Check size={16} /><span><b>{t("Consejero 24 h", "24/7 Advisor", "Conselheiro 24 h")}</b>{t(" con semáforo de salud", " with a health traffic light", " com semáforo de saúde")}</span></li>
            </ul>
            <div className="planes" role="radiogroup" aria-label="Plan">
              <button className="plan" role="radio" aria-checked={plan === "anual"} onClick={() => setPlan("anual")}>
                <span className="tag">{t("Mejor valor", "Best value", "Melhor valor")}</span>
                <div className="txt"><b>{t("Anual", "Yearly", "Anual")}</b><span>{t(`Se cobra ${anual} al año · ahorras 40%`, `Billed ${anual} per year · save 40%`, `Cobrado ${anual} por ano · economize 40%`)}</span></div>
                <div className="pr"><strong>{t("US$4,17", "US$4.17", "US$ 4,17")}</strong>{t("al mes", "per month", "por mês")}</div><span className="radio" />
              </button>
              <button className="plan" role="radio" aria-checked={plan === "mensual"} onClick={() => setPlan("mensual")}>
                <div className="txt"><b>{t("Mensual", "Monthly", "Mensal")}</b><span>{t("Se cobra cada mes", "Billed every month", "Cobrado todo mês")}</span></div>
                <div className="pr"><strong>{mensual}</strong>{t("al mes", "per month", "por mês")}</div><span className="radio" />
              </button>
            </div>
            <div className="espacio" />
            <Link className="cta azul" href={`/crear-cuenta?plan=${plan}`} onClick={() => registrarEvento("plan_elegido", { plan })}>{t(`Empezar el plan ${quien} gratis`, `Start ${quien} plan for free`, `Começar o plano ${quien} grátis`)}</Link>
            <p className="letra">
              <b>{t("Hoy no pagas nada.", "You pay nothing today.", "Hoje você não paga nada.")}</b>{" "}
              {plan === "anual"
                ? t(`El ${fechas.cobro} se cobra ${anual} (plan anual).`, `On ${fechas.cobro} you're charged ${anual} (yearly plan).`, `Em ${fechas.cobro} é cobrado ${anual} (plano anual).`)
                : t(`El ${fechas.cobro} se cobra ${mensual} (plan mensual).`, `On ${fechas.cobro} you're charged ${mensual} (monthly plan).`, `Em ${fechas.cobro} é cobrado ${mensual} (plano mensal).`)}{" "}
              {t("Se renueva automáticamente; cancela cuando quieras.", "Renews automatically; cancel anytime.", "Renova automaticamente; cancele quando quiser.")}
            </p>
            <p className="garantia-mini"><ShieldCheck size={15} /> {t("Garantía Hotmart de 7 días", "7-day Hotmart guarantee", "Garantia Hotmart de 7 dias")}</p>
            <button className="secundario" onClick={salir}>{t("Ahora no", "Not now", "Agora não")}</button>
          </>)}
        </div>
      </div>
    </main>
  );
}
