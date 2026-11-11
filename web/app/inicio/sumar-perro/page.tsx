"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Check } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { EDADES, ORIGENES, reducirFoto, type Edad, type Origen } from "@/lib/onboarding";
import { useT } from "@/lib/i18n";
import { registrarEvento } from "@/lib/eventos";

export default function SumarPerro() {
  const router = useRouter();
  const { t, idioma } = useT();
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
    if (error) { setError(t("No pudimos guardar a tu perro. Intenta de nuevo.", "We couldn't save your dog. Try again.", "Não conseguimos salvar seu cão. Tente de novo.")); return; }
    registrarEvento("perro_creado");
    try { window.localStorage.setItem("kopeet-perro-activo", data.id); } catch { /* nada */ }
    router.push("/inicio");
  }

  return (
    <>
      <div className="barra"><Link className="atras" href="/inicio" aria-label={t("Volver", "Back", "Voltar")}><ArrowLeft size={18} /></Link></div>
      <div className="cuerpo entra">
        <h1>{t("Suma otro perro", "Add another dog", "Adicione outro cão")}</h1>
        <p className="sub">{t("Un solo plan sirve para todos los perros de tu casa.", "One plan covers every dog in your home.", "Um só plano serve para todos os cães da sua casa.")}</p>
        <label className="subir chica">
          {foto ? <img src={foto} alt={t("Foto del perro", "Dog's photo", "Foto do cão")} /> : (<><Camera size={28} />{t("Foto (opcional)", "Photo (optional)", "Foto (opcional)")}</>)}
          <input type="file" accept="image/*" onChange={elegirFoto} aria-label={t("Elegir foto", "Choose photo", "Escolher foto")} />
        </label>
        <label className="etiqueta" htmlFor="nombre">{t("Nombre", "Name", "Nome")}</label>
        <input id="nombre" className="campo chico" maxLength={24} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={t("Ej.: Luna", "E.g.: Luna", "Ex.: Luna")} />
        <p className="etiqueta">{t("¿Cómo llegó a tu vida?", "How did they come into your life?", "Como chegou à sua vida?")}</p>
        <div className="chips">{ORIGENES.map((o) => <button key={o.id} className="chip" aria-pressed={origen === o.id} onClick={() => setOrigen(o.id)}>{origen === o.id && <Check size={13} />}{o.texto[idioma]}</button>)}</div>
        <p className="etiqueta">{t("Edad", "Age", "Idade")}</p>
        <div className="chips">{EDADES.map((o) => <button key={o.id} className="chip" aria-pressed={edad === o.id} onClick={() => setEdad(o.id)}>{edad === o.id && <Check size={13} />}{o.texto[idioma]}</button>)}</div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="espacio" />
        <button className="cta azul" disabled={!nombre.trim() || !edad || guardando} onClick={guardar}>{guardando ? t("Guardando…", "Saving…", "Salvando…") : t("Sumar a mi familia", "Add to my family", "Adicionar à família")}</button>
      </div>
    </>
  );
}
