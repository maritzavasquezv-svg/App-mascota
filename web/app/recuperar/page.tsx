"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import "../flujo.css";

export default function Recuperar() {
  const [correo, setCorreo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setEnviando(true);
    const { error } = await crearCliente().auth.resetPasswordForEmail(correo.trim(), { redirectTo: `${window.location.origin}/auth/confirmar` });
    setEnviando(false);
    if (error && /rate limit|too many/i.test(error.message)) { setError("Pediste varios correos seguidos. Espera unos minutos y vuelve a intentar."); return; }
    // Por seguridad no decimos si el correo existe o no.
    setListo(true);
  }

  return (
    <main className="flujo">
      <div className="marco">
        <div className="barra"><Link className="atras" href="/entrar" aria-label="Volver"><ArrowLeft size={18} /></Link></div>
        {listo ? (
          <div className="cuerpo entra">
            <div className="reco"><div className="foto-redonda"><MailCheck size={44} /></div>
              <h1>Revisa tu correo</h1>
              <p>Si <b>{correo}</b> tiene una cuenta en Kopeet, te llegará un enlace para crear una contraseña nueva.</p>
              <p>Puedes abrirlo en este celular o computador, o en cualquier otro.</p>
            </div>
          </div>
        ) : (
          <form className="cuerpo entra" onSubmit={enviar} noValidate>
            <h1>Crea una contraseña nueva</h1>
            <p className="sub">Escribe tu correo y te enviamos un enlace.</p>
            <label className="etiqueta" htmlFor="correo">Correo</label>
            <input id="correo" className="campo chico" type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
            {error && <p className="error" role="alert">{error}</p>}
            <div className="espacio" />
            <button className="cta azul" type="submit" disabled={enviando || !correo.includes("@")}>{enviando ? "Enviando…" : "Enviarme el enlace"}</button>
          </form>
        )}
      </div>
    </main>
  );
}
