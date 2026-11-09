"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Check, CreditCard, Lock, ShieldCheck, X } from "lucide-react";
import { contarRespuestas, etiquetaEdad, etiquetaOrigen, fechasPrueba, leer, minutosEjercicio, nombreDe, type Respuestas } from "@/lib/onboarding";

type Plan = "anual" | "mensual";

export default function Paywall() {
  const router = useRouter();
  const [r] = useState<Respuestas>(() => leer());
  const [pantalla, setPantalla] = useState(1);
  const [plan, setPlan] = useState<Plan>("anual");
  const [fechas] = useState(() => fechasPrueba());

  useEffect(() => { window.scrollTo(0, 0); }, [pantalla]);

  const nombre = nombreDe(r);
  const quien = nombre === "tu perro" ? "de tu perro" : `de ${nombre}`;
  const salir = () => router.push("/");
  const detalle = [etiquetaOrigen(r.origen), etiquetaEdad(r.edad)].filter(Boolean).join(" · ");

  const cabeza = (
    <div className="cabeza">
      {pantalla > 1
        ? <button className="atras" onClick={() => setPantalla((p) => p - 1)} aria-label="Volver"><ArrowLeft size={18} /></button>
        : null}
      <img src="/marca/isotipo-kopeet-180.png" alt="" /><b>Kopeet</b>
      <button className="cerrar" onClick={salir} aria-label="Cerrar"><X size={17} /></button>
    </div>
  );

  return (
    <main className="flujo">
      <div className="marco">
        {cabeza}
        <div className="cuerpo entra" key={pantalla}>
          {pantalla === 1 && (<>
            <h1>El <em>Plan de Bienvenida</em> {quien} está listo</h1>
            {detalle && <p className="sub">{detalle.charAt(0).toUpperCase() + detalle.slice(1)}</p>}
            <div className="resumen">
              <div><span>Ejercicio de hoy</span><b>{minutosEjercicio(r.edad)} min</b></div>
              <div><span>Avisos</span><b>{r.hora ? `Cada día a tu hora` : "Cuando los actives"}</b></div>
              {r.preocupaciones[0] && <div><span>Primero en su plan</span><b>{r.preocupaciones[0]}</b></div>}
              <div className="bloq"><span><Lock size={14} /> Ración diaria</span><b>Según su peso</b></div>
              <div className="bloq"><span><Lock size={14} /> Vacunas</span><b>Calendario completo</b></div>
              <div className="bloq"><span><Lock size={14} /> Adaptación</span><b>Plan de 1 mes</b></div>
            </div>
            <p className="nota">Hecho con tus {contarRespuestas(r)} respuestas.</p>
            <div className="espacio" />
            <button className="cta" onClick={() => setPantalla(2)}>Ver cómo empezar</button>
          </>)}

          {pantalla === 2 && (<>
            <h1>Así funcionan tus <em>7 días gratis</em></h1>
            <div className="linea">
              <div className="hito on"><span className="ic"><Check size={16} /></span><div><b>Hoy · {fechas.hoy}</b><p>Acceso completo al plan {quien}.</p></div></div>
              <div className="hito"><span className="ic"><Bell size={16} /></span><div><b>{fechas.aviso}</b><p>Te avisamos que tu prueba está por terminar.</p></div></div>
              <div className="hito"><span className="ic"><CreditCard size={16} /></span><div><b>{fechas.cobro}</b><p>Se cobra el plan que elijas. Cancela antes y no pagas nada.</p></div></div>
            </div>
            <div className="garantia"><ShieldCheck size={26} /><div><b>Garantía Hotmart de 7 días</b><span>Si no te sirve, te devolvemos el dinero.</span></div></div>
            <div className="espacio" />
            <button className="cta" onClick={() => setPantalla(3)}>Elegir mi plan</button>
          </>)}

          {pantalla === 3 && (<>
            <h1>Empieza el plan {quien} hoy</h1>
            <ul className="beneficios">
              <li><Check size={16} /><span><b>Qué hacer cada día</b>, sin adivinar</span></li>
              <li><Check size={16} /><span><b>Avisos</b> de vacunas y desparasitación</span></li>
              <li><Check size={16} /><span><b>Consejero 24 h</b> con semáforo de salud</span></li>
            </ul>
            <div className="planes" role="radiogroup" aria-label="Plan">
              <button className="plan" role="radio" aria-checked={plan === "anual"} onClick={() => setPlan("anual")}>
                <span className="tag">Mejor valor</span>
                <div className="txt"><b>Anual</b><span>Se cobra US$49,99 al año · ahorras 40%</span></div>
                <div className="pr"><strong>US$4,17</strong>al mes</div><span className="radio" />
              </button>
              <button className="plan" role="radio" aria-checked={plan === "mensual"} onClick={() => setPlan("mensual")}>
                <div className="txt"><b>Mensual</b><span>Se cobra cada mes</span></div>
                <div className="pr"><strong>US$6,99</strong>al mes</div><span className="radio" />
              </button>
            </div>
            <div className="espacio" />
            <Link className="cta azul" href={`/crear-cuenta?plan=${plan}`}>Empezar el plan {quien} gratis</Link>
            <p className="letra"><b>Hoy no pagas nada.</b> El {fechas.cobro} se cobra {plan === "anual" ? "US$49,99 (plan anual)" : "US$6,99 (plan mensual)"}. Se renueva automáticamente; cancela cuando quieras.</p>
            <p className="garantia-mini"><ShieldCheck size={15} /> Garantía Hotmart de 7 días</p>
            <button className="secundario" onClick={salir}>Ahora no</button>
          </>)}
        </div>
      </div>
    </main>
  );
}
