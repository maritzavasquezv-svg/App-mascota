"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crearCliente } from "@/lib/supabase/cliente";
import "../../flujo.css";

// Aquí llegan los enlaces de los correos (confirmar cuenta o crear contraseña nueva).
// El enlace trae la sesión en la dirección (#access_token=...); la guardamos y seguimos.
export default function AuthListo() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.hash.slice(1));
    const access = p.get("access_token");
    const refresh = p.get("refresh_token");
    const tipo = p.get("type");
    window.history.replaceState(null, "", window.location.pathname); // borra los datos de la dirección
    if (!access || !refresh) {
      const desc = p.get("error_description") ?? "";
      queueMicrotask(() => setError(/expired|invalid/i.test(desc)
        ? "Este enlace ya se usó o venció. Pide uno nuevo."
        : "No pudimos abrir tu sesión con este enlace."));
      return;
    }
    crearCliente().auth.setSession({ access_token: access, refresh_token: refresh }).then(({ error }) => {
      if (error) { setError("No pudimos abrir tu sesión con este enlace. Pide uno nuevo."); return; }
      router.replace(tipo === "recovery" ? "/nueva-clave" : "/inicio");
      router.refresh();
    });
  }, [router]);

  return (
    <main className="flujo">
      <div className="marco">
        <div className="cuerpo entra">
          {!error && <><h1>Abriendo tu cuenta…</h1><p className="sub">Un segundo.</p></>}
          {error && (<>
            <h1>Algo no funcionó</h1>
            <p className="error" role="alert">{error}</p>
            <div className="espacio" />
            <Link className="cta azul" href="/entrar">Ir a Entrar</Link>
            <Link className="secundario" href="/recuperar">Pedir un enlace nuevo</Link>
          </>)}
        </div>
      </div>
    </main>
  );
}
