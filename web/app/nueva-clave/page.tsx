"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearCliente } from "@/lib/supabase/cliente";
import "../flujo.css";

export default function NuevaClave() {
  const router = useRouter();
  const [clave, setClave] = useState("");
  const [ver, setVer] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (clave.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    setGuardando(true);
    const s = crearCliente();
    const { error } = await s.auth.updateUser({ password: clave });
    setGuardando(false);
    if (error) {
      setError(/session|not authenticated|missing/i.test(error.message)
        ? "El enlace venció. Pide uno nuevo desde «¿Olvidaste tu contraseña?»."
        : /same|different/i.test(error.message) ? "Elige una contraseña distinta a la anterior." : "No pudimos guardarla. Intenta de nuevo.");
      return;
    }
    router.push("/inicio");
    router.refresh();
  }

  return (
    <main className="flujo">
      <div className="marco">
        <form className="cuerpo entra" onSubmit={guardar} noValidate>
          <h1>Tu contraseña nueva</h1>
          <p className="sub">Mínimo 8 caracteres. Anótala en un lugar seguro.</p>
          <label className="etiqueta" htmlFor="clave">Contraseña nueva</label>
          <input id="clave" className="campo chico" type={ver ? "text" : "password"} autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} />
          <label className="check"><input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} /><span>Mostrar contraseña</span></label>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="espacio" />
          <button className="cta azul" type="submit" disabled={guardando || clave.length < 8}>{guardando ? "Guardando…" : "Guardar y entrar"}</button>
        </form>
      </div>
    </main>
  );
}
