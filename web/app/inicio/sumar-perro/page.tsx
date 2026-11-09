"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Check } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { EDADES, ORIGENES, reducirFoto, type Edad, type Origen } from "@/lib/onboarding";

export default function SumarPerro() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [origen, setOrigen] = useState<Origen | null>(null);
  const [edad, setEdad] = useState<Edad | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function elegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    try { setFoto(await reducirFoto(f)); } catch (err) { setError((err as Error).message); }
  }

  async function guardar() {
    setError(null); setGuardando(true);
    const s = crearCliente();
    const { data: { user } } = await s.auth.getUser();
    if (!user) { router.replace("/entrar"); return; }
    let fotoRuta: string | null = null;
    if (foto) {
      const ruta = `${user.id}/${crypto.randomUUID()}.jpg`;
      const blob = await (await fetch(foto)).blob();
      const up = await s.storage.from("fotos-perros").upload(ruta, blob, { contentType: "image/jpeg" });
      if (!up.error) fotoRuta = ruta;
    }
    const { data, error } = await s.from("perros").insert({ usuario_id: user.id, nombre: nombre.trim(), origen, edad, foto_ruta: fotoRuta }).select("id").single();
    setGuardando(false);
    if (error) { setError("No pudimos guardar a tu perro. Intenta de nuevo."); return; }
    try { window.localStorage.setItem("kopeet-perro-activo", data.id); } catch { /* nada */ }
    router.push("/inicio");
  }

  return (
    <>
      <div className="barra"><Link className="atras" href="/inicio" aria-label="Volver"><ArrowLeft size={18} /></Link></div>
      <div className="cuerpo entra">
        <h1>Suma otro perro</h1>
        <p className="sub">Un solo plan sirve para todos los perros de tu casa.</p>
        <label className="subir chica">
          {foto ? <img src={foto} alt="Foto del perro" /> : (<><Camera size={28} />Foto (opcional)</>)}
          <input type="file" accept="image/*" onChange={elegirFoto} aria-label="Elegir foto" />
        </label>
        <label className="etiqueta" htmlFor="nombre">Nombre</label>
        <input id="nombre" className="campo chico" maxLength={24} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Luna" />
        <p className="etiqueta">¿Cómo llegó a tu vida?</p>
        <div className="chips">{ORIGENES.map((o) => <button key={o.id} className="chip" aria-pressed={origen === o.id} onClick={() => setOrigen(o.id)}>{origen === o.id && <Check size={13} />}{o.texto}</button>)}</div>
        <p className="etiqueta">Edad</p>
        <div className="chips">{EDADES.map((o) => <button key={o.id} className="chip" aria-pressed={edad === o.id} onClick={() => setEdad(o.id)}>{edad === o.id && <Check size={13} />}{o.texto}</button>)}</div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="espacio" />
        <button className="cta azul" disabled={!nombre.trim() || !edad || guardando} onClick={guardar}>{guardando ? "Guardando…" : "Sumar a mi familia"}</button>
      </div>
    </>
  );
}
