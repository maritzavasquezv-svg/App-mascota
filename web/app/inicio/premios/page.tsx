"use client";
import { useEffect, useState } from "react";
import { Award, Bone, Cookie, Crown, Heart, Lock, ShieldCheck, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { crearCliente } from "@/lib/supabase/cliente";
import { usePerros } from "@/components/app/usePerros";
import SelectorPerros from "@/components/app/SelectorPerros";
import { minutosEjercicio } from "@/lib/onboarding";
import { premios, type EventoSalud, type Registro } from "@/lib/app-datos";
import { useT } from "@/lib/i18n";
import { EventoAlAbrir } from "@/components/Analitica";

const ICONOS: Record<string, React.ReactNode> = {
  "primer-paseo": <Award size={26} />, "pelota-oro": <Trophy size={26} />, "hueso-dorado": <Bone size={26} />,
  "galleta-campeona": <Cookie size={26} />, "escudo-sano": <ShieldCheck size={26} />, "corona-peludo": <Crown size={26} />,
  "corazon-manada": <Heart size={26} />, "estrella-kopeet": <Star size={26} />,
};

export default function Premios() {
  const { perros, fotos, activo, elegir, error } = usePerros();
  const { t, idioma } = useT();
  const [datos, setDatos] = useState<{ r: Registro[]; e: EventoSalud[] } | null>(null);
  // Medallas por recomendar Kopeet (de la cuenta, no de cada perro): dejarla y que se publique.
  const [reco, setReco] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    void crearCliente().from("testimonios").select("estado").maybeSingle().then(({ data }) => setReco((data?.estado as string | undefined) ?? null));
  }, []);

  useEffect(() => {
    if (!activo) return;
    const s = crearCliente();
    void Promise.all([
      s.from("registros").select("id,perro_id,tipo,minutos,fecha").eq("perro_id", activo.id),
      s.from("eventos_salud").select("id,perro_id,tipo,titulo,fecha,hecho").eq("perro_id", activo.id),
    ]).then(([r, e]) => setDatos({ r: (r.data ?? []) as Registro[], e: (e.data ?? []) as EventoSalud[] }));
  }, [activo]);

  if (error) return <p className="error" role="alert">{error}</p>;
  if (!perros || !activo) return <p className="sub">{t("Cargando…", "Loading…", "Carregando…")}</p>;
  const logrado = (ok: boolean) => (ok ? t("¡Logrado!", "Achieved!", "Conquistado!") : t("Aún no", "Not yet", "Ainda não"));
  const lista = datos ? [...premios(datos.r, datos.e, minutosEjercicio(activo.edad), idioma),
    { id: "corazon-manada", nombre: t("Corazón de la manada", "Heart of the pack", "Coração da matilha"), detalle: t("Deja tu recomendación de Kopeet", "Leave your Kopeet recommendation", "Deixe sua recomendação do Kopeet"), ganado: Boolean(reco), avance: logrado(Boolean(reco)) },
    { id: "estrella-kopeet", nombre: t("Estrella de Kopeet", "Kopeet star", "Estrela do Kopeet"), detalle: t("Tu recomendación sale publicada", "Your recommendation gets published", "Sua recomendação é publicada"), ganado: reco === "aprobado", avance: logrado(reco === "aprobado") },
  ] : [];
  const ganados = lista.filter((p) => p.ganado).length;

  return (
    <div className="cuerpo entra">
      <EventoAlAbrir nombre="premios_vistos" />
      <p className="fecha-hoy">{t("Pared de premios", "Rewards wall", "Mural de prêmios")}</p>
      <h1>{t(`Los premios de ${activo.nombre || "tu perro"}`, `${activo.nombre || "Your dog"}'s rewards`, `Os prêmios de ${activo.nombre || "seu cão"}`)}</h1>
      <SelectorPerros perros={perros} fotos={fotos} activoId={activo.id} elegir={elegir} />
      <p className="nota">{datos ? t(`${ganados} de ${lista.length} premios ganados`, `${ganados} of ${lista.length} rewards earned`, `${ganados} de ${lista.length} prêmios ganhos`) : t("Cargando…", "Loading…", "Carregando…")}</p>
      <div className="pared">
        {lista.map((p) => (
          <div key={p.id} className={`medalla ${p.ganado ? "ganada" : ""}`}>
            <span className="disco">{p.ganado ? ICONOS[p.id] : <Lock size={22} />}</span>
            <b>{p.nombre}</b><span className="det">{p.detalle}</span><em>{p.avance}</em>
          </div>
        ))}
      </div>
      {reco === null && <p className="nota" style={{ marginTop: 12 }}>{t("¿Quieres las medallas del corazón y la estrella? ", "Want the heart and star medals? ", "Quer as medalhas do coração e da estrela? ")}<Link href="/inicio/cuenta">{t("Deja tu recomendación con una foto de tu perro", "Leave your recommendation with a photo of your dog", "Deixe sua recomendação com uma foto do seu cão")}</Link>.</p>}
    </div>
  );
}
