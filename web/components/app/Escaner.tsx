"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import type { Perro } from "@/lib/app-datos";
import SubirFoto from "@/components/app/SubirFoto";

interface Estimacion { mezcla: string; confianza: string; etapa: string; edad_aprox: string; tamano_adulto: string; peso_adulto_kg: string; nota: string }

/** Muestra la estimación del perro por foto, o el botón para calcularla con IA. */
export default function Escaner({ perro, alActualizar }: { perro: Perro & { estimacion?: Estimacion | null }; alActualizar: () => void }) {
  const [estado, setEstado] = useState<"listo" | "analizando" | "error">("listo");
  const [error, setError] = useState<string | null>(null);
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

  if (est) {
    return (
      <section className="tarjeta">
        <p className="tarjeta-tit"><span><Sparkles size={15} /> Lo que vemos en su foto</span><b>Confianza {est.confianza}</b></p>
        <p className="mezcla">{est.mezcla}</p>
        <div className="datos-est"><span><b>{est.edad_aprox}</b>edad aprox.</span><span><b>{est.tamano_adulto}</b>tamaño adulto</span><span><b>{est.peso_adulto_kg}</b>peso adulto</span></div>
        <p className="nota">{est.nota}</p>
        <SubirFoto perroId={perro.id} nombre={perro.nombre || "tu perro"} alSubir={alActualizar} texto="Cambiar su foto" />
      </section>
    );
  }
  if (!perro.foto_ruta) {
    return (
      <section className="tarjeta">
        <p className="tarjeta-tit"><span><Sparkles size={15} /> Falta la foto de {perro.nombre || "tu perro"}</span></p>
        <p className="vacio">Súbela para verla en su plan y estimar su mezcla, edad y tamaño.</p>
        <SubirFoto perroId={perro.id} nombre={perro.nombre || "tu perro"} alSubir={alActualizar} />
      </section>
    );
  }
  return (
    <section className="tarjeta">
      <p className="tarjeta-tit"><span><Sparkles size={15} /> Escáner de tu perro</span></p>
      <p className="vacio">Estimamos su mezcla, su edad y su tamaño de adulto con su foto.</p>
      <div className="botones-min"><button onClick={analizar} disabled={estado === "analizando"}>{estado === "analizando" ? "Analizando la foto…" : "Analizar su foto"}</button></div>
      <SubirFoto perroId={perro.id} nombre={perro.nombre || "tu perro"} alSubir={alActualizar} texto="Cambiar su foto" />
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}
