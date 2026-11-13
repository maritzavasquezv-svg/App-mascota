"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Languages, LogOut, Trash2 } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { usePlan } from "@/components/app/AvisoPlan";
import { useT } from "@/lib/i18n";
import SelectorIdioma from "@/components/SelectorIdioma";
import { nombrePlan, PLANES, precio, esPlan } from "@/lib/planes";
import { PasarAFamiliar, useLimitePerros } from "@/components/app/LimitePerros";
import Recordatorios from "@/components/app/Recordatorios";
import CancelarSuscripcion from "@/components/app/CancelarSuscripcion";

export default function Cuenta() {
  const router = useRouter();
  const { t, idioma } = useT();
  const [correo, setCorreo] = useState("");
  const [plan, setPlan] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [texto, setTexto] = useState("");
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const estadoPlan = usePlan();
  const lim = useLimitePerros();
  const palabra = t("BORRAR", "DELETE", "APAGAR");
  const [yaCancele, setYaCancele] = useState(false);
  // Suscripción pagada y activa en Hotmart (no cuenta el acceso de cortesía ni la administradora): se pide confirmar que la canceló.
  const pagaSuscripcion = Boolean(estadoPlan?.activo && !estadoPlan.admin && estadoPlan.plan !== "cortesia");

  useEffect(() => {
    const supabase = crearCliente();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/entrar"); return; }
      setCorreo(user.email ?? "");
      const { data } = await supabase.from("perfiles").select("plan_elegido").eq("id", user.id).maybeSingle();
      setPlan(data?.plan_elegido ?? null);
    })();
  }, [router]);

  async function salir() {
    await crearCliente().auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function borrarCuenta() {
    setError(null);
    setBorrando(true);
    const supabase = crearCliente();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/entrar"); return; }
    // 1) Fotos de sus perros
    const { data: archivos } = await supabase.storage.from("fotos-perros").list(user.id);
    if (archivos?.length) await supabase.storage.from("fotos-perros").remove(archivos.map((a) => `${user.id}/${a.name}`));
    // 2) Cuenta (borra en cascada perfil, perros y consentimientos)
    const { error } = await supabase.rpc("borrar_mi_cuenta");
    if (error) {
      setBorrando(false);
      setError(t("No pudimos borrar tu cuenta. Escríbenos a maritzavasquezv@gmail.com y lo hacemos por ti.", "We couldn't delete your account. Email us at maritzavasquezv@gmail.com and we'll do it for you.", "Não conseguimos apagar sua conta. Escreva para maritzavasquezv@gmail.com e fazemos por você."));
      return;
    }
    await supabase.auth.signOut();
    try { window.localStorage.clear(); window.sessionStorage.clear(); } catch { /* nada */ }
    router.push("/?cuenta=borrada");
    router.refresh();
  }

  const estado = !estadoPlan ? "…" : estadoPlan.admin ? t("Administradora", "Administrator", "Administradora")
    : estadoPlan.activo ? t("Activa ✓", "Active ✓", "Ativa ✓") : estadoPlan.estado ? estadoPlan.estado : t("Sin activar", "Not active", "Não ativada");

  return (
    <>
      <div className="barra"><Link className="atras" href="/inicio" aria-label={t("Volver", "Back", "Voltar")}><ArrowLeft size={18} /></Link></div>
      <div className="cuerpo entra">
        <h1>{t("Mi cuenta", "My account", "Minha conta")}</h1>
        <div className="resumen">
          <div><span>{t("Correo", "Email", "E-mail")}</span><b>{correo || "…"}</b></div>
          <div><span>{t("Plan elegido", "Chosen plan", "Plano escolhido")}</span><b>{esPlan(estadoPlan?.plan ?? plan) ? `${nombrePlan(estadoPlan?.plan ?? plan, idioma)} · ${precio(PLANES[(estadoPlan?.plan ?? plan) as keyof typeof PLANES].total, idioma)}` : nombrePlan(estadoPlan?.plan ?? plan, idioma)}</b></div>
          <div><span>{t("Suscripción", "Subscription", "Assinatura")}</span><b>{estado}</b></div>
          {lim && <div><span>{t("Perros en tu plan", "Dogs on your plan", "Cães no seu plano")}</span><b>{lim.actuales} / {lim.limite >= 99 ? "∞" : lim.limite}</b></div>}
          <div><span><Languages size={14} /> {t("Idioma", "Language", "Idioma")}</span><SelectorIdioma /></div>
        </div>
        {lim && lim.limite < 4 && lim.actuales >= lim.limite && <PasarAFamiliar lim={lim} plan={estadoPlan} />}
        <Recordatorios />
        <CancelarSuscripcion plan={estadoPlan} />
        <a className="cta" href="https://consumer.hotmart.com/" target="_blank" rel="noopener noreferrer" style={{ marginTop: 14 }}>{t("Ver o gestionar mi suscripción en Hotmart", "View or manage my subscription in Hotmart", "Ver ou gerenciar minha assinatura na Hotmart")}</a>
        <p className="nota">{t("Entra con el mismo correo con el que pagaste → Mis compras → Kopeet → Mostrar detalles → Configurar forma de pago → Cancelar suscripción. Más detalles en ", "Sign in with the email you paid with → My purchases → Kopeet → Show details → Set up payment → Cancel subscription. More details in ", "Entre com o e-mail usado no pagamento → Minhas compras → Kopeet → Mostrar detalhes → Configurar forma de pagamento → Cancelar assinatura. Mais detalhes em ")}<Link href={idioma === "es" ? "/reembolsos" : `/${idioma}/reembolsos`}>{t("Reembolsos y cancelación", "Refunds and cancellation", "Reembolsos e cancelamento")}</Link>.</p>

        {estadoPlan?.admin && <Link className="cta azul" href="/admin" style={{ marginTop: 18 }}>{t("Panel de administración", "Admin panel", "Painel de administração")}</Link>}
        <button className="cta" style={{ marginTop: 22 }} onClick={salir}><LogOut size={18} /> {t("Cerrar sesión", "Sign out", "Sair")}</button>

        <div className="zona-peligro">
          <b>{t("Borrar mi cuenta", "Delete my account", "Apagar minha conta")}</b>
          <p>{t("Se borran para siempre tu cuenta, tus perros, sus fotos y tus respuestas. No se puede deshacer.", "Your account, dogs, photos and answers are deleted forever. It can't be undone.", "Sua conta, seus cães, as fotos e suas respostas serão apagados para sempre. Não é possível desfazer.")}</p>
          <div className="aviso-cobro" role="note">
            <AlertTriangle size={18} />
            <p><b>{t("Antes de borrar tu cuenta, cancela tu suscripción en Hotmart.", "Before deleting your account, cancel your subscription in Hotmart.", "Antes de apagar sua conta, cancele sua assinatura na Hotmart.")}</b>{" "}
              {t("Borrar la cuenta en Kopeet no detiene los cobros: los hace Hotmart y seguirían llegando a tu tarjeta.", "Deleting your Kopeet account does not stop the charges: Hotmart bills you and they would keep reaching your card.", "Apagar a conta no Kopeet não interrompe as cobranças: quem cobra é a Hotmart e elas continuariam chegando no seu cartão.")}{" "}
              <a href="https://consumer.hotmart.com/" target="_blank" rel="noopener noreferrer">{t("Cancelar en Hotmart", "Cancel in Hotmart", "Cancelar na Hotmart")}</a></p>
          </div>
          {!confirmar
            ? <button className="btn-peligro" onClick={() => setConfirmar(true)}><Trash2 size={16} /> {t("Quiero borrar mi cuenta", "I want to delete my account", "Quero apagar minha conta")}</button>
            : (<>
              <label className="etiqueta" htmlFor="conf">{t(`Escribe ${palabra} para confirmar`, `Type ${palabra} to confirm`, `Digite ${palabra} para confirmar`)}</label>
              <input id="conf" className="campo chico" value={texto} onChange={(e) => setTexto(e.target.value)} autoComplete="off" />
              {pagaSuscripcion && (
                <label className="check"><input type="checkbox" checked={yaCancele} onChange={(e) => setYaCancele(e.target.checked)} />
                  <span>{t("Ya cancelé mi suscripción en Hotmart (si no, se me seguirá cobrando).", "I already canceled my subscription in Hotmart (otherwise I'll keep being charged).", "Já cancelei minha assinatura na Hotmart (senão continuarei sendo cobrada).")}</span></label>
              )}
              {error && <p className="error" role="alert">{error}</p>}
              <button className="btn-peligro lleno" disabled={texto.trim().toUpperCase() !== palabra || borrando || (pagaSuscripcion && !yaCancele)} onClick={borrarCuenta}>
                {borrando ? t("Borrando…", "Deleting…", "Apagando…") : t("Borrar mi cuenta para siempre", "Delete my account forever", "Apagar minha conta para sempre")}
              </button>
              <button className="secundario" onClick={() => { setConfirmar(false); setTexto(""); }}>{t("Cancelar", "Cancel", "Cancelar")}</button>
            </>)}
        </div>
      </div>
    </>
  );
}
