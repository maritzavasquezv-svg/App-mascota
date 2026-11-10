"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { crearCliente } from "@/lib/supabase/cliente";
import { useT, type Txt } from "@/lib/i18n";
import SelectorIdioma from "@/components/SelectorIdioma";

const AVISOS: Record<string, Txt> = {
  enlace: {
    es: "Tu correo ya quedó confirmado ✅. Ahora entra con tu correo y tu contraseña.",
    en: "Your email is confirmed ✅. Now sign in with your email and password.",
    pt: "Seu e-mail foi confirmado ✅. Agora entre com seu e-mail e senha.",
  },
  "clave-cambiada": {
    es: "Listo, tu contraseña nueva quedó guardada ✅. Entra con ella.",
    en: "Done, your new password is saved ✅. Sign in with it.",
    pt: "Pronto, sua nova senha foi salva ✅. Entre com ela.",
  },
  "enlace-vencido": {
    es: "Ese enlace ya se usó o venció. Pide uno nuevo en «¿Olvidaste tu contraseña?».",
    en: "That link was already used or expired. Request a new one under “Forgot your password?”.",
    pt: "Esse link já foi usado ou expirou. Peça um novo em “Esqueceu sua senha?”.",
  },
};

export default function Entrar() {
  const router = useRouter();
  const { t, idioma } = useT();
  const params = useSearchParams();
  const aviso = AVISOS[params.get("error") ?? params.get("aviso") ?? ""]?.[idioma] ?? null;
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const { error } = await crearCliente().auth.signInWithPassword({ email: correo.trim(), password: clave });
    setEnviando(false);
    if (error) {
      setError(/confirm/i.test(error.message)
        ? t("Todavía no confirmas tu correo. Abre el enlace que te enviamos.", "You haven't confirmed your email yet. Open the link we sent you.", "Você ainda não confirmou seu e-mail. Abra o link que enviamos.")
        : t("El correo o la contraseña no coinciden. Revisa mayúsculas y espacios, o crea una contraseña nueva abajo.",
          "The email or password doesn't match. Check capitals and spaces, or create a new password below.",
          "O e-mail ou a senha não conferem. Confira maiúsculas e espaços, ou crie uma nova senha abaixo."));
      return;
    }
    router.push("/inicio");
    router.refresh();
  }

  return (
    <>
      <div className="cabeza"><img src="/marca/isotipo-kopeet-180.png" alt="" /><b>Kopeet</b><span style={{ flex: 1 }} /><SelectorIdioma /></div>
      <form className="cuerpo entra" onSubmit={entrar} noValidate>
        <h1>{t("Hola de nuevo", "Welcome back", "Olá de novo")}</h1>
        <p className="sub">{t("Entra para ver el plan de tu perro.", "Sign in to see your dog's plan.", "Entre para ver o plano do seu cão.")}</p>
        {aviso && <p className="aviso-ok" role="status">{aviso}</p>}
        <label className="etiqueta" htmlFor="correo">{t("Correo", "Email", "E-mail")}</label>
        <input id="correo" className="campo chico" type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
        <label className="etiqueta" htmlFor="clave">{t("Contraseña", "Password", "Senha")}</label>
        <input id="clave" className="campo chico" type={verClave ? "text" : "password"} autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
        <label className="check"><input type="checkbox" checked={verClave} onChange={(e) => setVerClave(e.target.checked)} /><span>{t("Mostrar contraseña", "Show password", "Mostrar senha")}</span></label>
        {error && <p className="error" role="alert">{error}</p>}
        <Link className="secundario" href="/recuperar" style={{ textAlign: "left", padding: "10px 0" }}>{t("¿Olvidaste tu contraseña?", "Forgot your password?", "Esqueceu sua senha?")}</Link>
        <div className="espacio" />
        <button className="cta azul" type="submit" disabled={enviando || !correo || !clave}>{enviando ? t("Entrando…", "Signing in…", "Entrando…") : t("Entrar", "Sign in", "Entrar")}</button>
        <Link className="secundario" href="/empezar">{t("¿Aún no tienes cuenta? Crea el plan de tu perro", "No account yet? Create your dog's plan", "Ainda não tem conta? Crie o plano do seu cão")}</Link>
      </form>
    </>
  );
}
