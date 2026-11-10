"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Dog, Trash2 } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { EDADES, ORIGENES, type Edad, type Origen } from "@/lib/onboarding";
import SubirFoto from "@/components/app/SubirFoto";

interface Datos { nombre: string; origen: Origen | null; edad: Edad | null; raza_declarada: string | null; con_pedigri: boolean; foto_ruta: string | null }

export default function EditarPerro() {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "";
  const [d, setD] = useState<Datos | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

  useEffect(() => {
    if (!id) return;
    let vivo = true;
    const s = crearCliente();
    s.from("perros").select("nombre,origen,edad,raza_declarada,con_pedigri,foto_ruta").eq("id", id).maybeSingle().then(async ({ data }) => {
      if (!vivo) return;
      if (!data) { setError("No encontramos este perro."); return; }
      setD(data as Datos);
      if (data.foto_ruta) {
        const { data: f } = await s.storage.from("fotos-perros").createSignedUrl(data.foto_ruta, 3600);
        if (vivo) setFoto(f?.signedUrl ?? null);
      }
    });
    return () => { vivo = false; };
  }, [id, version]);

  if (!id) return <p className="error">Falta indicar qué perro editar. <Link href="/inicio">Volver a Hoy</Link></p>;
  if (error && !d) return <p className="error" role="alert">{error} <Link href="/inicio">Volver a Hoy</Link></p>;
  if (!d) return <p className="sub">Cargando…</p>;

  const cambiar = (p: Partial<Datos>) => { setD({ ...d, ...p }); setAviso(null); };

  async function guardar() {
    if (!d!.nombre.trim()) { setError("Escribe el nombre de tu perro."); return; }
    setError(null); setGuardando(true);
    const raza = d!.raza_declarada?.trim() || null;
    const { error } = await crearCliente().from("perros").update({
      nombre: d!.nombre.trim(), origen: d!.origen, edad: d!.edad, raza_declarada: raza, con_pedigri: raza ? d!.con_pedigri : false,
    }).eq("id", id);
    setGuardando(false);
    if (error) { setError("No pudimos guardar los cambios. Intenta de nuevo."); return; }
    setAviso("Cambios guardados ✓");
  }

  async function borrar() {
    setError(null); setGuardando(true);
    const s = crearCliente();
    if (d!.foto_ruta) await s.storage.from("fotos-perros").remove([d!.foto_ruta]);
    const { error } = await s.from("perros").delete().eq("id", id);
    setGuardando(false);
    if (error) { setError("No pudimos borrarlo. Intenta de nuevo."); return; }
    try { if (window.localStorage.getItem("kopeet-perro-activo") === id) window.localStorage.removeItem("kopeet-perro-activo"); } catch { /* nada */ }
    router.push("/inicio");
    router.refresh();
  }

  const nombre = d.nombre.trim() || "tu perro";
  return (
    <div className="cuerpo entra">
      <Link className="atras" href="/inicio" aria-label="Volver a Hoy" style={{ marginBottom: 8 }}><ArrowLeft size={18} /></Link>
      <h1>Editar a {nombre}</h1>

      <div className="ficha-perro">
        {foto ? <img src={foto} alt={nombre} /> : <span className="sin-foto"><Dog size={30} /></span>}
        <div><b>{nombre}</b><SubirFoto perroId={id} nombre={nombre} alSubir={() => setVersion((v) => v + 1)} texto={foto ? "Cambiar su foto" : "Subir su foto"} /></div>
      </div>

      <label className="etiqueta" htmlFor="nombre">Nombre</label>
      <input id="nombre" className="campo chico" maxLength={40} value={d.nombre} onChange={(e) => cambiar({ nombre: e.target.value })} />

      <label className="etiqueta" htmlFor="raza">Raza</label>
      <input id="raza" className="campo chico" maxLength={60} value={d.raza_declarada ?? ""} onChange={(e) => cambiar({ raza_declarada: e.target.value })} placeholder="Ej.: Border collie, mestizo, no sé" />
      <label className="check"><input type="checkbox" checked={d.con_pedigri} disabled={!d.raza_declarada?.trim()} onChange={(e) => cambiar({ con_pedigri: e.target.checked })} /><span>Tiene pedigrí</span></label>

      <p className="etiqueta">¿Cómo llegó a tu vida?</p>
      <div className="chips">{ORIGENES.map((o) => <button key={o.id} className="chip" aria-pressed={d.origen === o.id} onClick={() => cambiar({ origen: o.id })}>{d.origen === o.id && <Check size={13} />}{o.texto}</button>)}</div>

      <p className="etiqueta">Edad</p>
      <div className="chips">{EDADES.map((o) => <button key={o.id} className="chip" aria-pressed={d.edad === o.id} onClick={() => cambiar({ edad: o.id })}>{d.edad === o.id && <Check size={13} />}{o.texto}</button>)}</div>

      {error && <p className="error" role="alert">{error}</p>}
      {aviso && <p className="aviso-ok" role="status">{aviso}</p>}
      <button className="cta azul" style={{ marginTop: 18 }} onClick={guardar} disabled={guardando}>{guardando ? "Guardando…" : "Guardar cambios"}</button>

      <div className="zona-peligro">
        <b>Borrar a {nombre}</b>
        <p>Se borran su foto, su rutina, sus premios y su calendario del veterinario. No se puede deshacer.</p>
        {!confirmarBorrar
          ? <button className="btn-peligro" onClick={() => setConfirmarBorrar(true)}><Trash2 size={16} /> Borrar a {nombre}</button>
          : (<>
            <button className="btn-peligro lleno" onClick={borrar} disabled={guardando}>{guardando ? "Borrando…" : `Sí, borrar a ${nombre} para siempre`}</button>
            <button className="secundario" onClick={() => setConfirmarBorrar(false)}>Cancelar</button>
          </>)}
      </div>
    </div>
  );
}
