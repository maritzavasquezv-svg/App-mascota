"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crearCliente } from "@/lib/supabase/cliente";
import { useT } from "@/lib/i18n";
import "../../flujo.css";

type Fallo = "vencido" | "sesion";

// Aquí llegan los enlaces de los correos (confirmar cuenta o crear contraseña nueva).
// El enlace trae la sesión en la dirección (#access_token=...); la guardamos y seguimos.
export default function AuthListo() {
  const router = useRouter();
  const { t } = useT();
  const [error, setError] = useState<Fallo | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.hash.slice(1));
    const access = p.get("access_token");
    const refresh = p.get("refresh_token");
    const tipo = p.get("type");
    window.history.replaceState(null, "", window.location.pathname); // borra los datos de la dirección
    if (!access || !refresh) {
      const desc = p.get("error_description") ?? "";
      queueMicrotask(() => setError(/expired|invalid/i.test(desc) ? "vencido" : "sesion"));
      return;
    }
    crearCliente().auth.setSession({ access_token: access, refresh_token: refresh }).then(({ error }) => {
      if (error) { setError("sesion"); return; }
      router.replace(tipo === "recovery" ? "/nueva-clave" : "/inicio");
      router.refresh();
    });
  }, [router]);

  return (
    <main className="flujo">
      <div className="marco">
        <div className="cuerpo entra">
          {!error && <><h1>{t("Abriendo tu cuenta…", "Opening your account…", "Abrindo sua conta…")}</h1><p className="sub">{t("Un segundo.", "One second.", "Um segundo.")}</p></>}
          {error && (<>
            <h1>{t("Algo no funcionó", "Something went wrong", "Algo não funcionou")}</h1>
            <p className="error" role="alert">{error === "vencido"
              ? t("Este enlace ya se usó o venció. Pide uno nuevo.", "This link was already used or expired. Request a new one.", "Este link já foi usado ou expirou. Peça um novo.")
              : t("No pudimos abrir tu sesión con este enlace. Pide uno nuevo.", "We couldn't sign you in with this link. Request a new one.", "Não conseguimos abrir sua sessão com este link. Peça um novo.")}</p>
            <div className="espacio" />
            <Link className="cta azul" href="/entrar">{t("Ir a Entrar", "Go to Sign in", "Ir para Entrar")}</Link>
            <Link className="secundario" href="/recuperar">{t("Pedir un enlace nuevo", "Request a new link", "Pedir um novo link")}</Link>
          </>)}
        </div>
      </div>
    </main>
  );
}
