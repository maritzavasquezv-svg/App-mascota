"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { crearCliente } from "@/lib/supabase/cliente";

const AVISOS: Record<string, string> = {
  enlace: "Tu correo ya quedó confirmado ✅. Ahora entra con tu correo y tu contraseña.",
  "clave-cambiada": "Listo, tu contraseña nueva quedó guardada ✅. Entra con ella.",
  "enlace-vencido": "Ese enlace ya se usó o venció. Pide uno nuevo en «¿Olvidaste tu contraseña?».",
};

export default function Entrar() {
  const router = useRouter();
  const params = useSearchParams();
  const aviso = AVISOS[params.get("error") ?? params.get("aviso") ?? ""] ?? null;
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
        ? "Todavía no confirmas tu correo. Abre el enlace que te enviamos."
        : "El correo o la contraseña no coinciden. Revisa mayúsculas y espacios, o crea una contraseña nueva abajo.");
      return;
    }
    router.push("/inicio");
    router.refresh();
  }

  return (
    <>
      <div className="cabeza"><img src="/marca/isotipo-kopeet-180.png" alt="" /><b>Kopeet</b></div>
      <form className="cuerpo entra" onSubmit={entrar} noValidate>
        <h1>Hola de nuevo</h1>
        <p className="sub">Entra para ver el plan de tu perro.</p>
        {aviso && <p className="aviso-ok" role="status">{aviso}</p>}
        <label className="etiqueta" htmlFor="correo">Correo</label>
        <input id="correo" className="campo chico" type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
        <label className="etiqueta" htmlFor="clave">Contraseña</label>
        <input id="clave" className="campo chico" type={verClave ? "text" : "password"} autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
        <label className="check"><input type="checkbox" checked={verClave} onChange={(e) => setVerClave(e.target.checked)} /><span>Mostrar contraseña</span></label>
        {error && <p className="error" role="alert">{error}</p>}
        <Link className="secundario" href="/recuperar" style={{ textAlign: "left", padding: "10px 0" }}>¿Olvidaste tu contraseña?</Link>
        <div className="espacio" />
        <button className="cta azul" type="submit" disabled={enviando || !correo || !clave}>{enviando ? "Entrando…" : "Entrar"}</button>
        <Link className="secundario" href="/empezar">¿Aún no tienes cuenta? Crea el plan de tu perro</Link>
      </form>
    </>
  );
}
