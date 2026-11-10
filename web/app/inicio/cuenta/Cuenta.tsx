"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Trash2 } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { usePlan } from "@/components/app/AvisoPlan";

export default function Cuenta() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [plan, setPlan] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [texto, setTexto] = useState("");
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const estadoPlan = usePlan();

  useEffect(() => {
    const supabase = crearCliente();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/entrar"); return; }
      setCorreo(user.email ?? "");
      const { data } = await supabase.from("perfiles").select("plan_elegido").eq("id", user.id).maybeSingle();
      setPlan(data?.plan_elegido ?? null);
    })();
  }, [router]);

  async function salir() {
    await crearCliente().auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function borrarCuenta() {
    setError(null);
    setBorrando(true);
    const supabase = crearCliente();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/entrar"); return; }
    // 1) Fotos de sus perros
    const { data: archivos } = await supabase.storage.from("fotos-perros").list(user.id);
    if (archivos?.length) await supabase.storage.from("fotos-perros").remove(archivos.map((a) => `${user.id}/${a.name}`));
    // 2) Cuenta (borra en cascada perfil, perros y consentimientos)
    const { error } = await supabase.rpc("borrar_mi_cuenta");
    if (error) { setBorrando(false); setError("No pudimos borrar tu cuenta. Escríbenos a maritzavasquezv@gmail.com y lo hacemos por ti."); return; }
    await supabase.auth.signOut();
    try { window.localStorage.clear(); window.sessionStorage.clear(); } catch { /* nada */ }
    router.push("/?cuenta=borrada");
    router.refresh();
  }

  return (
    <>
      <div className="barra"><Link className="atras" href="/inicio" aria-label="Volver"><ArrowLeft size={18} /></Link></div>
      <div className="cuerpo entra">
        <h1>Mi cuenta</h1>
        <div className="resumen">
          <div><span>Correo</span><b>{correo || "…"}</b></div>
          <div><span>Plan elegido</span><b>{plan === "mensual" ? "Mensual · US$6,99" : plan === "anual" ? "Anual · US$4,17/mes" : "Sin elegir"}</b></div>
          <div><span>Suscripción</span><b>{!estadoPlan ? "…" : estadoPlan.admin ? "Administradora" : estadoPlan.activo ? "Activa ✓" : estadoPlan.estado ? estadoPlan.estado : "Sin activar"}</b></div>
        </div>
        <p className="nota">Para cancelar una suscripción ya pagada, mira <Link href="/reembolsos">Reembolsos y cancelación</Link>.</p>

        {estadoPlan?.admin && <Link className="cta azul" href="/admin" style={{ marginTop: 18 }}>Panel de administración</Link>}
        <button className="cta" style={{ marginTop: 22 }} onClick={salir}><LogOut size={18} /> Cerrar sesión</button>

        <div className="zona-peligro">
          <b>Borrar mi cuenta</b>
          <p>Se borran para siempre tu cuenta, tus perros, sus fotos y tus respuestas. No se puede deshacer.</p>
          {!confirmar
            ? <button className="btn-peligro" onClick={() => setConfirmar(true)}><Trash2 size={16} /> Quiero borrar mi cuenta</button>
            : (<>
              <label className="etiqueta" htmlFor="conf">Escribe BORRAR para confirmar</label>
              <input id="conf" className="campo chico" value={texto} onChange={(e) => setTexto(e.target.value)} autoComplete="off" />
              {error && <p className="error" role="alert">{error}</p>}
              <button className="btn-peligro lleno" disabled={texto.trim().toUpperCase() !== "BORRAR" || borrando} onClick={borrarCuenta}>
                {borrando ? "Borrando…" : "Borrar mi cuenta para siempre"}
              </button>
              <button className="secundario" onClick={() => { setConfirmar(false); setTexto(""); }}>Cancelar</button>
            </>)}
        </div>
      </div>
    </>
  );
}
