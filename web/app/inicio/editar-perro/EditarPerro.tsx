"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Dog, Trash2 } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { EDADES, ORIGENES, type Edad, type Origen } from "@/lib/onboarding";
import { useT } from "@/lib/i18n";
import SubirFoto from "@/components/app/SubirFoto";

interface Datos { nombre: string; origen: Origen | null; edad: Edad | null; raza_declarada: string | null; con_pedigri: boolean; foto_ruta: string | null }

export default function EditarPerro() {
  const router = useRouter();
  const { t, idioma } = useT();
  const id = useSearchParams().get("id") ?? "";
  const [d, setD] = useState<Datos | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

  useEffect(() => {
    if (!id) return;
    let vivo = true;
    const s = crearCliente();
    s.from("perros").select("nombre,origen,edad,raza_declarada,con_pedigri,foto_ruta").eq("id", id).maybeSingle().then(async ({ data }) => {
      if (!vivo) return;
      if (!data) { setNoEncontrado(true); return; }
      setD(data as Datos);
      if (data.foto_ruta) {
        const { data: f } = await s.storage.from("fotos-perros").createSignedUrl(data.foto_ruta, 3600);
        if (vivo) setFoto(f?.signedUrl ?? null);
      }
    });
    return () => { vivo = false; };
  }, [id, version]);

  const volver = <Link href="/inicio">{t("Volver a Hoy", "Back to Today", "Voltar para Hoje")}</Link>;
  if (!id) return <p className="error">{t("Falta indicar qué perro editar.", "No dog was selected to edit.", "Falta indicar qual cão editar.")} {volver}</p>;
  if (noEncontrado) return <p className="error" role="alert">{t("No encontramos este perro.", "We couldn't find this dog.", "Não encontramos este cão.")} {volver}</p>;
  if (!d) return <p className="sub">{t("Cargando…", "Loading…", "Carregando…")}</p>;

  const cambiar = (p: Partial<Datos>) => { setD({ ...d, ...p }); setAviso(null); };

  async function guardar() {
    if (!d!.nombre.trim()) { setError(t("Escribe el nombre de tu perro.", "Enter your dog's name.", "Escreva o nome do seu cão.")); return; }
    setError(null); setGuardando(true);
    const raza = d!.raza_declarada?.trim() || null;
    const { error } = await crearCliente().from("perros").update({
      nombre: d!.nombre.trim(), origen: d!.origen, edad: d!.edad, raza_declarada: raza, con_pedigri: raza ? d!.con_pedigri : false,
    }).eq("id", id);
    setGuardando(false);
    if (error) { setError(t("No pudimos guardar los cambios. Intenta de nuevo.", "We couldn't save the changes. Try again.", "Não conseguimos salvar as alterações. Tente de novo.")); return; }
    setAviso(t("Cambios guardados ✓", "Changes saved ✓", "Alterações salvas ✓"));
  }

  async function borrar() {
    setError(null); setGuardando(true);
    const s = crearCliente();
    if (d!.foto_ruta) await s.storage.from("fotos-perros").remove([d!.foto_ruta]);
    const { error } = await s.from("perros").delete().eq("id", id);
    setGuardando(false);
    if (error) { setError(t("No pudimos borrarlo. Intenta de nuevo.", "We couldn't delete it. Try again.", "Não conseguimos apagá-lo. Tente de novo.")); return; }
    try { if (window.localStorage.getItem("kopeet-perro-activo") === id) window.localStorage.removeItem("kopeet-perro-activo"); } catch { /* nada */ }
    router.push("/inicio");
    router.refresh();
  }

  const nombre = d.nombre.trim() || t("tu perro", "your dog", "seu cão");
  return (
    <div className="cuerpo entra">
      <Link className="atras" href="/inicio" aria-label={t("Volver a Hoy", "Back to Today", "Voltar para Hoje")} style={{ marginBottom: 8 }}><ArrowLeft size={18} /></Link>
      <h1>{t(`Editar a ${nombre}`, `Edit ${nombre}`, `Editar ${nombre}`)}</h1>

      <div className="ficha-perro">
        {foto ? <img src={foto} alt={nombre} /> : <span className="sin-foto"><Dog size={30} /></span>}
        <div><b>{nombre}</b><SubirFoto perroId={id} nombre={nombre} alSubir={() => setVersion((v) => v + 1)} texto={foto ? t("Cambiar su foto", "Change photo", "Trocar a foto") : t("Subir su foto", "Upload a photo", "Enviar foto")} /></div>
      </div>

      <label className="etiqueta" htmlFor="nombre">{t("Nombre", "Name", "Nome")}</label>
      <input id="nombre" className="campo chico" maxLength={40} value={d.nombre} onChange={(e) => cambiar({ nombre: e.target.value })} />

      <label className="etiqueta" htmlFor="raza">{t("Raza", "Breed", "Raça")}</label>
      <input id="raza" className="campo chico" maxLength={60} value={d.raza_declarada ?? ""} onChange={(e) => cambiar({ raza_declarada: e.target.value })} placeholder={t("Ej.: Border collie, mestizo, no sé", "E.g.: Border collie, mixed, not sure", "Ex.: Border collie, vira-lata, não sei")} />
      <label className="check"><input type="checkbox" checked={d.con_pedigri} disabled={!d.raza_declarada?.trim()} onChange={(e) => cambiar({ con_pedigri: e.target.checked })} /><span>{t("Tiene pedigrí", "Has pedigree", "Tem pedigree")}</span></label>

      <p className="etiqueta">{t("¿Cómo llegó a tu vida?", "How did they come into your life?", "Como chegou à sua vida?")}</p>
      <div className="chips">{ORIGENES.map((o) => <button key={o.id} className="chip" aria-pressed={d.origen === o.id} onClick={() => cambiar({ origen: o.id })}>{d.origen === o.id && <Check size={13} />}{o.texto[idioma]}</button>)}</div>

      <p className="etiqueta">{t("Edad", "Age", "Idade")}</p>
      <div className="chips">{EDADES.map((o) => <button key={o.id} className="chip" aria-pressed={d.edad === o.id} onClick={() => cambiar({ edad: o.id })}>{d.edad === o.id && <Check size={13} />}{o.texto[idioma]}</button>)}</div>

      {error && <p className="error" role="alert">{error}</p>}
      {aviso && <p className="aviso-ok" role="status">{aviso}</p>}
      <button className="cta azul" style={{ marginTop: 18 }} onClick={guardar} disabled={guardando}>{guardando ? t("Guardando…", "Saving…", "Salvando…") : t("Guardar cambios", "Save changes", "Salvar alterações")}</button>

      <div className="zona-peligro">
        <b>{t(`Borrar a ${nombre}`, `Delete ${nombre}`, `Apagar ${nombre}`)}</b>
        <p>{t("Se borran su foto, su rutina, sus premios y su calendario del veterinario. No se puede deshacer.", "This deletes their photo, routine, rewards and vet calendar. It can't be undone.", "Serão apagados a foto, a rotina, os prêmios e o calendário do veterinário. Não é possível desfazer.")}</p>
        {!confirmarBorrar
          ? <button className="btn-peligro" onClick={() => setConfirmarBorrar(true)}><Trash2 size={16} /> {t(`Borrar a ${nombre}`, `Delete ${nombre}`, `Apagar ${nombre}`)}</button>
          : (<>
            <button className="btn-peligro lleno" onClick={borrar} disabled={guardando}>{guardando ? t("Borrando…", "Deleting…", "Apagando…") : t(`Sí, borrar a ${nombre} para siempre`, `Yes, delete ${nombre} forever`, `Sim, apagar ${nombre} para sempre`)}</button>
            <button className="secundario" onClick={() => setConfirmarBorrar(false)}>{t("Cancelar", "Cancel", "Cancelar")}</button>
          </>)}
      </div>
    </div>
  );
}
