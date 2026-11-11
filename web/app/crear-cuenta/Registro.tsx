"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MailCheck } from "lucide-react";
import { crearClienteCorreos } from "@/lib/supabase/cliente";
import { leer, nombreDe } from "@/lib/onboarding";
import { guardarPendiente, type Consentimiento } from "@/lib/registro";
import { useT } from "@/lib/i18n";
import SelectorIdioma from "@/components/SelectorIdioma";
import { leerOrigen, registrarEvento } from "@/lib/eventos";
import { esPlan, resumenPlan, type PlanId } from "@/lib/planes";

export default function Registro() {
  const router = useRouter();
  const { t, idioma } = useT();
  const pedido = useSearchParams().get("plan");
  const plan: PlanId = esPlan(pedido) ? pedido : "anual";
  const [r] = useState(() => leer());
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [terminos, setTerminos] = useState(false);
  const [novedades, setNovedades] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revisaCorreo, setRevisaCorreo] = useState(false);
  const nombre = nombreDe(r, idioma);
  const claveCorta = t("La contraseña debe tener al menos 8 caracteres.", "Your password must have at least 8 characters.", "A senha deve ter pelo menos 8 caracteres.");
  const legal = (ruta: string) => (idioma === "es" ? ruta : `/${idioma}${ruta}`);

  const traducirError = (m: string) => {
    if (/already registered|already exists/i.test(m)) return t("Ya existe una cuenta con ese correo. Prueba entrar.", "An account with that email already exists. Try signing in.", "Já existe uma conta com esse e-mail. Tente entrar.");
    if (/password/i.test(m)) return claveCorta;
    if (/rate limit|too many/i.test(m)) return t("Hicimos demasiados intentos seguidos. Espera unos minutos y vuelve a probar.", "Too many attempts in a row. Wait a few minutes and try again.", "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.");
    if (/email/i.test(m)) return t("Revisa que el correo esté bien escrito.", "Check that the email is spelled correctly.", "Confira se o e-mail está escrito corretamente.");
    return t("No pudimos crear tu cuenta. Intenta de nuevo en un momento.", "We couldn't create your account. Try again in a moment.", "Não conseguimos criar sua conta. Tente de novo em um momento.");
  };

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!terminos) { setError(t("Para crear tu cuenta necesitas aceptar los Términos y la Política de privacidad.", "To create your account you need to accept the Terms and the Privacy Policy.", "Para criar sua conta você precisa aceitar os Termos e a Política de Privacidade.")); return; }
    if (clave.length < 8) { setError(claveCorta); return; }
    setEnviando(true);
    const consentimientos: Consentimiento[] = [
      { finalidad: "terminos_y_privacidad", aceptado: true },
      { finalidad: "transferencia_internacional_ia", aceptado: true },
      { finalidad: "marketing", aceptado: novedades },
    ];
    guardarPendiente(r, plan);
    const supabase = crearClienteCorreos();
    const { data, error } = await supabase.auth.signUp({
      email: correo.trim(),
      password: clave,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/listo`,
        data: {
          plan, consentimientos, locale: navigator.language, idioma, origen: leerOrigen(),
          onboarding: { nombre: r.nombre, origen: r.origen, edad: r.edad, preocupaciones: r.preocupaciones, hora: r.hora, avisos: r.avisos },
        },
      },
    });
    setEnviando(false);
    if (error) { setError(traducirError(error.message)); return; }
    registrarEvento("cuenta_creada", { plan });
    if (data.session) { router.push("/entrar?error=enlace"); return; }
    else setRevisaCorreo(true);
  }

  if (revisaCorreo) {
    return (
      <div className="cuerpo entra">
        <div className="reco"><div className="foto-redonda"><MailCheck size={44} /></div>
          <h1>{t("Revisa tu correo", "Check your email", "Confira seu e-mail")}</h1>
          <p>{t("Te enviamos un enlace a ", "We sent a link to ", "Enviamos um link para ")}<b>{correo}</b>{t(
            `. Ábrelo para confirmar tu cuenta y ver el plan de ${nombre}.`,
            `. Open it to confirm your account and see ${nombre}'s plan.`,
            `. Abra-o para confirmar sua conta e ver o plano de ${nombre}.`)}</p>
          <p>{t("¿No llega? Revisa la carpeta de spam o promociones.", "Not there? Check your spam or promotions folder.", "Não chegou? Confira a pasta de spam ou promoções.")}</p>
        </div>
        <div className="espacio" />
        <Link className="secundario" href="/entrar">{t("Ya confirmé, quiero entrar", "I've confirmed, let me sign in", "Já confirmei, quero entrar")}</Link>
      </div>
    );
  }

  return (
    <>
      <div className="barra"><Link className="atras" href="/plan" aria-label={t("Volver", "Back", "Voltar")}><ArrowLeft size={18} /></Link><span style={{ flex: 1 }} /><SelectorIdioma /></div>
      <form className="cuerpo entra" onSubmit={crear} noValidate>
        <h1>{t("Crea tu cuenta para guardar el plan de ", "Create your account to save ", "Crie sua conta para salvar o plano de ")}<em>{nombre}</em>{t("", "'s plan", "")}</h1>
        <p className="sub">{t("Plan elegido: ", "Chosen plan: ", "Plano escolhido: ")}<b>{resumenPlan(plan, idioma)}</b>. {t("Hoy no pagas nada.", "You pay nothing today.", "Hoje você não paga nada.")}</p>
        <label className="etiqueta" htmlFor="correo">{t("Correo", "Email", "E-mail")}</label>
        <input id="correo" className="campo chico" type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder={t("tu@correo.com", "you@email.com", "voce@email.com")} />
        <label className="etiqueta" htmlFor="clave">{t("Contraseña", "Password", "Senha")}</label>
        <input id="clave" className="campo chico" type="password" autoComplete="new-password" minLength={8} required value={clave} onChange={(e) => setClave(e.target.value)} placeholder={t("Mínimo 8 caracteres", "At least 8 characters", "Mínimo 8 caracteres")} />
        <label className="check">
          <input type="checkbox" checked={terminos} onChange={(e) => setTerminos(e.target.checked)} />
          <span>{t("Acepto los ", "I accept the ", "Aceito os ")}<Link href={legal("/terminos")} target="_blank">{t("Términos", "Terms", "Termos")}</Link>{t(" y la ", " and the ", " e a ")}<Link href={legal("/privacidad")} target="_blank">{t("Política de privacidad", "Privacy Policy", "Política de Privacidade")}</Link>{t(
            ", incluido que mis datos se guarden en Brasil y la IA los procese en EE. UU.",
            ", including that my data is stored in Brazil and processed by AI in the USA.",
            ", incluindo que meus dados sejam guardados no Brasil e processados pela IA nos EUA.")}</span>
        </label>
        <label className="check">
          <input type="checkbox" checked={novedades} onChange={(e) => setNovedades(e.target.checked)} />
          <span>{t("Quiero recibir consejos y novedades por correo (opcional).", "I want to receive tips and news by email (optional).", "Quero receber dicas e novidades por e-mail (opcional).")}</span>
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="espacio" />
        <button className="cta azul" type="submit" disabled={enviando}>{enviando ? t("Creando tu cuenta…", "Creating your account…", "Criando sua conta…") : t("Crear mi cuenta", "Create my account", "Criar minha conta")}</button>
        <Link className="secundario" href="/entrar">{t("Ya tengo cuenta", "I already have an account", "Já tenho conta")}</Link>
      </form>
    </>
  );
}
