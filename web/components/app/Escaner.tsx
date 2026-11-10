"use client";
import { useState } from "react";
import { BadgeCheck, Pencil, RefreshCw, Sparkles } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import type { Perro } from "@/lib/app-datos";
import SubirFoto from "@/components/app/SubirFoto";

/** Raza que indica la dueña (manda sobre la foto) + estimación con IA por foto. */
export default function Escaner({ perro, alActualizar }: { perro: Perro; alActualizar: () => void }) {
  const [estado, setEstado] = useState<"listo" | "analizando" | "error">("listo");
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [raza, setRaza] = useState(perro.raza_declarada ?? "");
  const [pedigri, setPedigri] = useState(perro.con_pedigri ?? false);
  const nombre = perro.nombre || "tu perro";
  const est = perro.estimacion;

  async function analizar() {
    if (!perro.foto_ruta) return;
    setEstado("analizando"); setError(null);
    try {
      const { data, error: e } = await crearCliente().storage.from("fotos-perros").download(perro.foto_ruta);
      if (e || !data) throw new Error("No pudimos leer la foto.");
      const imagen = await new Promise<string>((ok, mal) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => mal(new Error("No pudimos leer la foto.")); r.readAsDataURL(data); });
      const res = await fetch("/api/escaner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imagen, perroId: perro.id }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "No pudimos analizar la foto.");
      setEstado("listo"); alActualizar();
    } catch (err) { setEstado("error"); setError((err as Error).message); }
  }

  async function guardarRaza(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await crearCliente().from("perros").update({ raza_declarada: raza.trim() || null, con_pedigri: raza.trim() ? pedigri : false }).eq("id", perro.id);
    if (error) { setError("No pudimos guardar la raza. Intenta de nuevo."); return; }
    setEditando(false); alActualizar();
  }

  const bloqueRaza = editando ? (
    <form className="form-raza" onSubmit={guardarRaza}>
      <label className="etiqueta" htmlFor="raza">Raza de {nombre}</label>
      <input id="raza" className="campo chico" maxLength={60} value={raza} onChange={(e) => setRaza(e.target.value)} placeholder="Ej.: Border collie, mestizo, no sé" />
      <label className="check"><input type="checkbox" checked={pedigri} onChange={(e) => setPedigri(e.target.checked)} disabled={!raza.trim()} /><span>Tiene pedigrí</span></label>
      <div className="botones-min"><button type="submit">Guardar</button><button type="button" className="suave" onClick={() => { setEditando(false); setRaza(perro.raza_declarada ?? ""); setPedigri(perro.con_pedigri ?? false); }}>Cancelar</button></div>
    </form>
  ) : perro.raza_declarada ? (
    <div className="raza-dueña">
      <span><BadgeCheck size={16} /> <b>{perro.raza_declarada}</b>{perro.con_pedigri && <em>con pedigrí</em>}</span>
      <button className="mini" onClick={() => setEditando(true)}><Pencil size={13} /> Cambiar</button>
    </div>
  ) : (
    <button className="enlace-raza" onClick={() => setEditando(true)}><Pencil size={13} /> ¿Sabes su raza? Indícala aquí</button>
  );

  if (!perro.foto_ruta) {
    return (
      <section className="tarjeta">
        <p className="tarjeta-tit"><span><Sparkles size={15} /> Falta la foto de {nombre}</span></p>
        {bloqueRaza}
        <p className="vacio">Sube su foto para verla en su plan y estimar su edad y tamaño.</p>
        <SubirFoto perroId={perro.id} nombre={nombre} alSubir={alActualizar} />
      </section>
    );
  }

  return (
    <section className="tarjeta">
      <p className="tarjeta-tit"><span><Sparkles size={15} /> {est ? "Lo que vemos en su foto" : "Escáner de tu perro"}</span>{est && <b>Confianza {est.confianza}</b>}</p>
      {bloqueRaza}
      {est ? (<>
        <p className="mezcla">{perro.raza_declarada ? <><small>Según la foto:</small> {est.mezcla}</> : est.mezcla}</p>
        <div className="datos-est"><span><b>{est.edad_aprox}</b>edad aprox.</span><span><b>{est.tamano_adulto}</b>tamaño adulto</span><span><b>{est.peso_adulto_kg}</b>peso adulto</span></div>
        <p className="nota">{est.nota}</p>
      </>) : <p className="vacio">Estimamos su raza o mezcla, su edad y su tamaño de adulto con su foto.</p>}
      <div className="botones-min">
        <button onClick={analizar} disabled={estado === "analizando"}>{estado === "analizando" ? "Analizando la foto…" : est ? <><RefreshCw size={14} /> Volver a analizar</> : "Analizar su foto"}</button>
      </div>
      <SubirFoto perroId={perro.id} nombre={nombre} alSubir={alActualizar} texto="Cambiar su foto" />
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}
