"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, PawPrint } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { usePerros } from "@/components/app/usePerros";
import SelectorPerros from "@/components/app/SelectorPerros";
import { hoyISO, racha, type Registro } from "@/lib/app-datos";

const PASOS = [
  { t: "Llévalo a su lugar apenas despierte", d: "Es cuando más ganas tiene." },
  { t: "Después de cada comida y de jugar", d: "Unos 10 a 15 minutos después." },
  { t: "Premio en cuanto lo haga bien", d: "Una caricia o un snack, en ese mismo momento." },
  { t: "Antes de dormir", d: "Una última salida a su lugar." },
  { t: "Si se equivoca, no lo retes", d: "Limpia sin olor (con vinagre y agua) y vuelve a empezar." },
];
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

export default function Bano() {
  const { perros, fotos, activo, elegir, error } = usePerros();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [festejo, setFestejo] = useState(false);

  const traer = useCallback(async (id: string) => {
    const desde = new Date(); desde.setDate(desde.getDate() - 30);
    const { data } = await crearCliente().from("registros").select("id,perro_id,tipo,minutos,fecha").eq("perro_id", id).eq("tipo", "bano").gte("fecha", hoyISO(desde));
    return (data ?? []) as Registro[];
  }, []);
  const cargar = useCallback(async (id: string) => { setRegistros(await traer(id)); }, [traer]);
  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    traer(activo.id).then((d) => { if (vivo) setRegistros(d); });
    return () => { vivo = false; };
  }, [activo, traer]);

  if (error) return <p className="error" role="alert">{error}</p>;
  if (!perros || !activo) return <p className="sub">Cargando…</p>;

  const nombre = activo.nombre || "tu perro";
  const n = racha(registros, "bano");
  const hoyHecho = registros.some((r) => r.fecha === hoyISO());
  // Semana actual (lunes a domingo)
  const hoy = new Date(); const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const semana = DIAS.map((d, i) => { const f = new Date(lunes); f.setDate(lunes.getDate() + i); const iso = hoyISO(f); return { d, iso, ok: registros.some((r) => r.fecha === iso), hoy: iso === hoyISO() }; });

  async function loHizo() {
    const { error } = await crearCliente().from("registros").insert({ perro_id: activo!.id, tipo: "bano", fecha: hoyISO() });
    if (!error) { await cargar(activo!.id); if (n + (hoyHecho ? 0 : 1) >= 7) setFestejo(true); }
  }

  return (
    <div className="cuerpo entra">
      <Link className="atras" href="/inicio" aria-label="Volver a Hoy" style={{ marginBottom: 8 }}><ArrowLeft size={18} /></Link>
      <p className="fecha-hoy">Plan de {nombre}</p>
      <h1>Orina y heces en su lugar</h1>
      <SelectorPerros perros={perros} fotos={fotos} activoId={activo.id} elegir={elegir} />
      <div className="racha-card"><div><b>{n} día{n === 1 ? "" : "s"} seguido{n === 1 ? "" : "s"}</b><span>Hizo sus necesidades en su lugar</span></div>
        <img src="/marca/premio-escarapela.png" alt="" width={50} height={50} className={n >= 7 ? "" : "apagada"} /></div>
      <div className="semana">{semana.map((s) => <span key={s.iso} className={`${s.ok ? "ok" : ""} ${s.hoy ? "hoy" : ""}`}>{s.ok ? <Check size={13} /> : s.d}</span>)}</div>
      <p className="nota" style={{ textAlign: "center" }}>{n >= 7 ? "¡Ganó la escarapela de la Galleta campeona! 🏅" : <>Faltan <b>{7 - n} días</b> para ganar la escarapela 🏅</>}</p>
      <div className="pasos-bano">{PASOS.map((p, i) => <div key={p.t}><span>{i + 1}</span><div><b>{p.t}</b><em>{p.d}</em></div></div>)}</div>
      <button className="cta azul" style={{ marginTop: 14 }} onClick={loHizo} disabled={hoyHecho}><PawPrint size={18} /> {hoyHecho ? "Hoy ya lo registraste ✓" : "Hizo orina o heces en su lugar"}</button>
      {festejo && (
        <div className="festejo" role="dialog" aria-label="Premio">
          <img src="/marca/premio-escarapela.png" alt="Escarapela" width={110} height={110} />
          <b>¡Premio de perrito!</b><span>{nombre} hizo sus necesidades en su lugar 7 días seguidos.</span>
          <button className="cta" onClick={() => setFestejo(false)}>¡Genial!</button>
        </div>
      )}
    </div>
  );
}
