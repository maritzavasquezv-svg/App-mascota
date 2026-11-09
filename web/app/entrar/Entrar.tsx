"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crearCliente } from "@/lib/supabase/cliente";

export default function Entrar() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
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
        : "El correo o la contraseña no coinciden. Revisa e intenta de nuevo.");
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
        <label className="etiqueta" htmlFor="correo">Correo</label>
        <input id="correo" className="campo chico" type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
        <label className="etiqueta" htmlFor="clave">Contraseña</label>
        <input id="clave" className="campo chico" type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
        {error && <p className="error" role="alert">{error}</p>}
        <div className="espacio" />
        <button className="cta azul" type="submit" disabled={enviando || !correo || !clave}>{enviando ? "Entrando…" : "Entrar"}</button>
        <Link className="secundario" href="/empezar">¿Aún no tienes cuenta? Crea el plan de tu perro</Link>
      </form>
    </>
  );
}
