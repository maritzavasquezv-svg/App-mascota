"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { crearClienteCorreos } from "@/lib/supabase/cliente";
import { useT } from "@/lib/i18n";
import SelectorIdioma from "@/components/SelectorIdioma";
import "../flujo.css";

export default function Recuperar() {
  const { t } = useT();
  const [correo, setCorreo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setEnviando(true);
    const { error } = await crearClienteCorreos().auth.resetPasswordForEmail(correo.trim(), { redirectTo: `${window.location.origin}/auth/listo` });
    setEnviando(false);
    if (error && /rate limit|too many/i.test(error.message)) {
      setError(t("Pediste varios correos seguidos. Espera unos minutos y vuelve a intentar.", "You requested several emails in a row. Wait a few minutes and try again.", "Você pediu vários e-mails seguidos. Espere alguns minutos e tente de novo."));
      return;
    }
    // Por seguridad no decimos si el correo existe o no.
    setListo(true);
  }

  return (
    <main className="flujo">
      <div className="marco">
        <div className="barra"><Link className="atras" href="/entrar" aria-label={t("Volver", "Back", "Voltar")}><ArrowLeft size={18} /></Link><span style={{ flex: 1 }} /><SelectorIdioma /></div>
        {listo ? (
          <div className="cuerpo entra">
            <div className="reco"><div className="foto-redonda"><MailCheck size={44} /></div>
              <h1>{t("Revisa tu correo", "Check your email", "Confira seu e-mail")}</h1>
              <p>{t("Si ", "If ", "Se ")}<b>{correo}</b>{t(" tiene una cuenta en Kopeet, te llegará un enlace para crear una contraseña nueva.", " has a Kopeet account, you'll get a link to create a new password.", " tiver uma conta no Kopeet, chegará um link para criar uma nova senha.")}</p>
              <p>{t("Puedes abrirlo en este celular o computador, o en cualquier otro.", "You can open it on this phone or computer, or any other.", "Você pode abri-lo neste celular ou computador, ou em qualquer outro.")}</p>
            </div>
          </div>
        ) : (
          <form className="cuerpo entra" onSubmit={enviar} noValidate>
            <h1>{t("Crea una contraseña nueva", "Create a new password", "Crie uma nova senha")}</h1>
            <p className="sub">{t("Escribe tu correo y te enviamos un enlace.", "Enter your email and we'll send you a link.", "Digite seu e-mail e enviaremos um link.")}</p>
            <label className="etiqueta" htmlFor="correo">{t("Correo", "Email", "E-mail")}</label>
            <input id="correo" className="campo chico" type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
            {error && <p className="error" role="alert">{error}</p>}
            <div className="espacio" />
            <button className="cta azul" type="submit" disabled={enviando || !correo.includes("@")}>{enviando ? t("Enviando…", "Sending…", "Enviando…") : t("Enviarme el enlace", "Send me the link", "Enviar o link")}</button>
          </form>
        )}
      </div>
    </main>
  );
}
