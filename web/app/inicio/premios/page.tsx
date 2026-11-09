"use client";
import { useEffect, useState } from "react";
import { Award, Bone, Cookie, Crown, Lock, ShieldCheck, Trophy } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { usePerros } from "@/components/app/usePerros";
import SelectorPerros from "@/components/app/SelectorPerros";
import { minutosEjercicio } from "@/lib/onboarding";
import { premios, type EventoSalud, type Registro } from "@/lib/app-datos";

const ICONOS: Record<string, React.ReactNode> = {
  "primer-paseo": <Award size={26} />, "pelota-oro": <Trophy size={26} />, "hueso-dorado": <Bone size={26} />,
  "galleta-campeona": <Cookie size={26} />, "escudo-sano": <ShieldCheck size={26} />, "corona-peludo": <Crown size={26} />,
};

export default function Premios() {
  const { perros, fotos, activo, elegir, error } = usePerros();
  const [datos, setDatos] = useState<{ r: Registro[]; e: EventoSalud[] } | null>(null);

  useEffect(() => {
    if (!activo) return;
    const s = crearCliente();
    void Promise.all([
      s.from("registros").select("id,perro_id,tipo,minutos,fecha").eq("perro_id", activo.id),
      s.from("eventos_salud").select("id,perro_id,tipo,titulo,fecha,hecho").eq("perro_id", activo.id),
    ]).then(([r, e]) => setDatos({ r: (r.data ?? []) as Registro[], e: (e.data ?? []) as EventoSalud[] }));
  }, [activo]);

  if (error) return <p className="error" role="alert">{error}</p>;
  if (!perros || !activo) return <p className="sub">Cargando…</p>;
  const lista = datos ? premios(datos.r, datos.e, minutosEjercicio(activo.edad)) : [];
  const ganados = lista.filter((p) => p.ganado).length;

  return (
    <div className="cuerpo entra">
      <p className="fecha-hoy">Pared de premios</p>
      <h1>Los premios de {activo.nombre || "tu perro"}</h1>
      <SelectorPerros perros={perros} fotos={fotos} activoId={activo.id} elegir={elegir} />
      <p className="nota">{datos ? `${ganados} de ${lista.length} premios ganados` : "Cargando…"}</p>
      <div className="pared">
        {lista.map((p) => (
          <div key={p.id} className={`medalla ${p.ganado ? "ganada" : ""}`}>
            <span className="disco">{p.ganado ? ICONOS[p.id] : <Lock size={22} />}</span>
            <b>{p.nombre}</b><span className="det">{p.detalle}</span><em>{p.avance}</em>
          </div>
        ))}
      </div>
    </div>
  );
}
