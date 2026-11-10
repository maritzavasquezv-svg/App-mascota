"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearCliente } from "@/lib/supabase/cliente";
import { useT } from "@/lib/i18n";
import "../flujo.css";

export default function NuevaClave() {
  const router = useRouter();
  const { t } = useT();
  const [clave, setClave] = useState("");
  const [ver, setVer] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (clave.length < 8) { setError(t("La contraseña debe tener al menos 8 caracteres.", "Your password must have at least 8 characters.", "A senha deve ter pelo menos 8 caracteres.")); return; }
    setGuardando(true);
    const s = crearCliente();
    const { error } = await s.auth.updateUser({ password: clave });
    setGuardando(false);
    if (error) {
      setError(/session|not authenticated|missing/i.test(error.message)
        ? t("El enlace venció. Pide uno nuevo desde «¿Olvidaste tu contraseña?».", "The link expired. Request a new one from “Forgot your password?”.", "O link expirou. Peça um novo em “Esqueceu sua senha?”.")
        : /same|different/i.test(error.message)
          ? t("Elige una contraseña distinta a la anterior.", "Choose a password different from the previous one.", "Escolha uma senha diferente da anterior.")
          : t("No pudimos guardarla. Intenta de nuevo.", "We couldn't save it. Try again.", "Não conseguimos salvá-la. Tente de novo."));
      return;
    }
    router.push("/inicio");
    router.refresh();
  }

  return (
    <main className="flujo">
      <div className="marco">
        <form className="cuerpo entra" onSubmit={guardar} noValidate>
          <h1>{t("Tu contraseña nueva", "Your new password", "Sua nova senha")}</h1>
          <p className="sub">{t("Mínimo 8 caracteres. Anótala en un lugar seguro.", "At least 8 characters. Write it down somewhere safe.", "Mínimo 8 caracteres. Anote em um lugar seguro.")}</p>
          <label className="etiqueta" htmlFor="clave">{t("Contraseña nueva", "New password", "Nova senha")}</label>
          <input id="clave" className="campo chico" type={ver ? "text" : "password"} autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} />
          <label className="check"><input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} /><span>{t("Mostrar contraseña", "Show password", "Mostrar senha")}</span></label>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="espacio" />
          <button className="cta azul" type="submit" disabled={guardando || clave.length < 8}>{guardando ? t("Guardando…", "Saving…", "Salvando…") : t("Guardar y entrar", "Save and sign in", "Salvar e entrar")}</button>
        </form>
      </div>
    </main>
  );
}
