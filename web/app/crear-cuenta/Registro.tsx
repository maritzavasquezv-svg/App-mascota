"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MailCheck } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { leer, nombreDe } from "@/lib/onboarding";
import { guardarPendiente, type Consentimiento } from "@/lib/registro";

const traducirError = (m: string) => {
  if (/already registered|already exists/i.test(m)) return "Ya existe una cuenta con ese correo. Prueba entrar.";
  if (/password/i.test(m)) return "La contraseña debe tener al menos 8 caracteres.";
  if (/rate limit|too many/i.test(m)) return "Hicimos demasiados intentos seguidos. Espera unos minutos y vuelve a probar.";
  if (/email/i.test(m)) return "Revisa que el correo esté bien escrito.";
  return "No pudimos crear tu cuenta. Intenta de nuevo en un momento.";
};

export default function Registro() {
  const router = useRouter();
  const plan = useSearchParams().get("plan") === "mensual" ? "mensual" : "anual";
  const [r] = useState(() => leer());
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [terminos, setTerminos] = useState(false);
  const [novedades, setNovedades] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revisaCorreo, setRevisaCorreo] = useState(false);
  const nombre = nombreDe(r);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!terminos) { setError("Para crear tu cuenta necesitas aceptar los Términos y la Política de privacidad."); return; }
    if (clave.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    setEnviando(true);
    const consentimientos: Consentimiento[] = [
      { finalidad: "terminos_y_privacidad", aceptado: true },
      { finalidad: "transferencia_internacional_ia", aceptado: true },
      { finalidad: "marketing", aceptado: novedades },
    ];
    guardarPendiente(r, plan);
    const supabase = crearCliente();
    const { data, error } = await supabase.auth.signUp({
      email: correo.trim(),
      password: clave,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirmar`,
        data: {
          plan, consentimientos, locale: navigator.language,
          onboarding: { nombre: r.nombre, origen: r.origen, edad: r.edad, preocupaciones: r.preocupaciones, hora: r.hora, avisos: r.avisos },
        },
      },
    });
    setEnviando(false);
    if (error) { setError(traducirError(error.message)); return; }
    if (data.session) router.push("/inicio");
    else setRevisaCorreo(true);
  }

  if (revisaCorreo) {
    return (
      <div className="cuerpo entra">
        <div className="reco"><div className="foto-redonda"><MailCheck size={44} /></div>
          <h1>Revisa tu correo</h1>
          <p>Te enviamos un enlace a <b>{correo}</b>. Ábrelo para confirmar tu cuenta y ver el plan de {nombre}.</p>
          <p>¿No llega? Revisa la carpeta de spam o promociones.</p>
        </div>
        <div className="espacio" />
        <Link className="secundario" href="/entrar">Ya confirmé, quiero entrar</Link>
      </div>
    );
  }

  return (
    <>
      <div className="barra"><Link className="atras" href="/plan" aria-label="Volver"><ArrowLeft size={18} /></Link></div>
      <form className="cuerpo entra" onSubmit={crear} noValidate>
        <h1>Crea tu cuenta para guardar el plan de <em>{nombre}</em></h1>
        <p className="sub">Plan elegido: <b>{plan === "mensual" ? "Mensual · US$6,99" : "Anual · US$4,17 al mes"}</b>. Hoy no pagas nada.</p>
        <label className="etiqueta" htmlFor="correo">Correo</label>
        <input id="correo" className="campo chico" type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tu@correo.com" />
        <label className="etiqueta" htmlFor="clave">Contraseña</label>
        <input id="clave" className="campo chico" type="password" autoComplete="new-password" minLength={8} required value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Mínimo 8 caracteres" />
        <label className="check">
          <input type="checkbox" checked={terminos} onChange={(e) => setTerminos(e.target.checked)} />
          <span>Acepto los <Link href="/terminos" target="_blank">Términos</Link> y la <Link href="/privacidad" target="_blank">Política de privacidad</Link>, incluido que mis datos se guarden en Brasil y la IA los procese en EE. UU.</span>
        </label>
        <label className="check">
          <input type="checkbox" checked={novedades} onChange={(e) => setNovedades(e.target.checked)} />
          <span>Quiero recibir consejos y novedades por correo (opcional).</span>
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="espacio" />
        <button className="cta azul" type="submit" disabled={enviando}>{enviando ? "Creando tu cuenta…" : "Crear mi cuenta"}</button>
        <Link className="secundario" href="/entrar">Ya tengo cuenta</Link>
      </form>
    </>
  );
}
