"use client";
import { useState } from "react";
import { BadgeCheck, Pencil, RefreshCw, Sparkles } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import type { Perro } from "@/lib/app-datos";
import { useT } from "@/lib/i18n";
import { registrarEvento } from "@/lib/eventos";
import SubirFoto from "@/components/app/SubirFoto";

// Valores fijos que la IA devuelve en español; se traducen al mostrarlos.
const VALORES: Record<string, { en: string; pt: string }> = {
  baja: { en: "low", pt: "baixa" }, media: { en: "medium", pt: "média" }, alta: { en: "high", pt: "alta" },
  "pequeño": { en: "small", pt: "pequeno" }, mediano: { en: "medium", pt: "médio" }, grande: { en: "large", pt: "grande" }, gigante: { en: "giant", pt: "gigante" },
};

/** Raza que indica la dueña (manda sobre la foto) + estimación con IA por foto. */
export default function Escaner({ perro, alActualizar }: { perro: Perro; alActualizar: () => void }) {
  const { t, idioma } = useT();
  const [estado, setEstado] = useState<"listo" | "analizando" | "error">("listo");
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [raza, setRaza] = useState(perro.raza_declarada ?? "");
  const [pedigri, setPedigri] = useState(perro.con_pedigri ?? false);
  const nombre = perro.nombre || t("tu perro", "your dog", "seu cão");
  const est = perro.estimacion;
  const valor = (v: string) => (idioma === "es" ? v : VALORES[v]?.[idioma] ?? v);

  async function analizar() {
    if (!perro.foto_ruta) return;
    setEstado("analizando"); setError(null);
    registrarEvento("escaner");
    const noLee = t("No pudimos leer la foto.", "We couldn't read the photo.", "Não conseguimos ler a foto.");
    try {
      const { data, error: e } = await crearCliente().storage.from("fotos-perros").download(perro.foto_ruta);
      if (e || !data) throw new Error(noLee);
      const imagen = await new Promise<string>((ok, mal) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => mal(new Error(noLee)); r.readAsDataURL(data); });
      const res = await fetch("/api/escaner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imagen, perroId: perro.id, idioma }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? t("No pudimos analizar la foto.", "We couldn't analyze the photo.", "Não conseguimos analisar a foto."));
      setEstado("listo"); alActualizar();
    } catch (err) { setEstado("error"); setError((err as Error).message); }
  }

  async function guardarRaza(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await crearCliente().from("perros").update({ raza_declarada: raza.trim() || null, con_pedigri: raza.trim() ? pedigri : false }).eq("id", perro.id);
    if (error) { setError(t("No pudimos guardar la raza. Intenta de nuevo.", "We couldn't save the breed. Try again.", "Não conseguimos salvar a raça. Tente de novo.")); return; }
    setEditando(false); alActualizar();
  }

  const bloqueRaza = editando ? (
    <form className="form-raza" onSubmit={guardarRaza}>
      <label className="etiqueta" htmlFor="raza">{t(`Raza de ${nombre}`, `${nombre}'s breed`, `Raça de ${nombre}`)}</label>
      <input id="raza" className="campo chico" maxLength={60} value={raza} onChange={(e) => setRaza(e.target.value)} placeholder={t("Ej.: Border collie, mestizo, no sé", "E.g.: Border collie, mixed, not sure", "Ex.: Border collie, vira-lata, não sei")} />
      <label className="check"><input type="checkbox" checked={pedigri} onChange={(e) => setPedigri(e.target.checked)} disabled={!raza.trim()} /><span>{t("Tiene pedigrí", "Has pedigree", "Tem pedigree")}</span></label>
      <div className="botones-min"><button type="submit">{t("Guardar", "Save", "Salvar")}</button><button type="button" className="suave" onClick={() => { setEditando(false); setRaza(perro.raza_declarada ?? ""); setPedigri(perro.con_pedigri ?? false); }}>{t("Cancelar", "Cancel", "Cancelar")}</button></div>
    </form>
  ) : perro.raza_declarada ? (
    <div className="raza-dueña">
      <span><BadgeCheck size={16} /> <b>{perro.raza_declarada}</b>{perro.con_pedigri && <em>{t("con pedigrí", "with pedigree", "com pedigree")}</em>}</span>
      <button className="mini" onClick={() => setEditando(true)}><Pencil size={13} /> {t("Cambiar", "Change", "Alterar")}</button>
    </div>
  ) : (
    <button className="enlace-raza" onClick={() => setEditando(true)}><Pencil size={13} /> {t("¿Sabes su raza? Indícala aquí", "Know the breed? Add it here", "Sabe a raça? Indique aqui")}</button>
  );

  if (!perro.foto_ruta) {
    return (
      <section className="tarjeta">
        <p className="tarjeta-tit"><span><Sparkles size={15} /> {t(`Falta la foto de ${nombre}`, `${nombre}'s photo is missing`, `Falta a foto de ${nombre}`)}</span></p>
        {bloqueRaza}
        <p className="vacio">{t("Sube su foto para verla en su plan y estimar su edad y tamaño.", "Upload a photo to see it in the plan and estimate age and size.", "Envie a foto para vê-la no plano e estimar idade e tamanho.")}</p>
        <SubirFoto perroId={perro.id} nombre={nombre} alSubir={alActualizar} />
      </section>
    );
  }

  return (
    <section className="tarjeta">
      <p className="tarjeta-tit"><span><Sparkles size={15} /> {est ? t("Lo que vemos en su foto", "What we see in the photo", "O que vemos na foto") : t("Escáner de tu perro", "Your dog's scanner", "Scanner do seu cão")}</span>{est && <b>{t("Confianza", "Confidence", "Confiança")} {valor(est.confianza)}</b>}</p>
      {bloqueRaza}
      {est ? (<>
        <p className="mezcla">{perro.raza_declarada ? <><small>{t("Según la foto:", "From the photo:", "Pela foto:")}</small> {est.mezcla}</> : est.mezcla}</p>
        <div className="datos-est"><span><b>{est.edad_aprox}</b>{t("edad aprox.", "approx. age", "idade aprox.")}</span><span><b>{valor(est.tamano_adulto)}</b>{t("tamaño adulto", "adult size", "tamanho adulto")}</span><span><b>{est.peso_adulto_kg}</b>{t("peso adulto", "adult weight", "peso adulto")}</span></div>
        <p className="nota">{est.nota}</p>
      </>) : <p className="vacio">{t("Estimamos su raza o mezcla, su edad y su tamaño de adulto con su foto.", "We estimate breed or mix, age and adult size from the photo.", "Estimamos raça ou mistura, idade e tamanho adulto pela foto.")}</p>}
      <div className="botones-min">
        <button onClick={analizar} disabled={estado === "analizando"}>{estado === "analizando"
          ? t("Analizando la foto…", "Analyzing the photo…", "Analisando a foto…")
          : est ? <><RefreshCw size={14} /> {t("Volver a analizar", "Analyze again", "Analisar de novo")}</> : t("Analizar su foto", "Analyze the photo", "Analisar a foto")}</button>
      </div>
      <SubirFoto perroId={perro.id} nombre={nombre} alSubir={alActualizar} texto={t("Cambiar su foto", "Change photo", "Trocar a foto")} />
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}
