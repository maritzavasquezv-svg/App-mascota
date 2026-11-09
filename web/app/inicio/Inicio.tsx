"use client";
import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Check, Home, MapPin, Plus, Stethoscope, Trash2 } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { usePerros } from "@/components/app/usePerros";
import SelectorPerros from "@/components/app/SelectorPerros";
import Escaner from "@/components/app/Escaner";
import { minutosEjercicio } from "@/lib/onboarding";
import {
  TIPOS_EVENTO, diasEnCasa, enDias, fechaCorta, hoyISO, mapa, minutosDelDia, racha,
  type EventoSalud, type Registro,
} from "@/lib/app-datos";

const fmtHoy = new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long" });

function Medidor({ hechos, meta }: { hechos: number; meta: number }) {
  const N = 22, llenos = Math.min(N, Math.round((hechos / meta) * N));
  return (
    <svg viewBox="0 0 240 118" aria-hidden="true">
      {Array.from({ length: N }, (_, i) => {
        const a = 180 - (i + 0.5) * 180 / N, r = Math.PI * a / 180, cx = 120 + 86 * Math.cos(r), cy = 104 - 86 * Math.sin(r);
        return <rect key={i} x={cx - 4.5} y={cy - 13} width={9} height={26} rx={4.5} fill={i < llenos ? "#2f6bff" : "#e1e7f1"} transform={`rotate(${90 - a} ${cx} ${cy})`} />;
      })}
    </svg>
  );
}

export default function Inicio() {
  const { perros, fotos, activo, elegir, error, recargar } = usePerros();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [eventos, setEventos] = useState<EventoSalud[]>([]);
  const [nuevo, setNuevo] = useState<{ tipo: EventoSalud["tipo"]; fecha: string; titulo: string } | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const traer = useCallback(async (perroId: string) => {
    const s = crearCliente();
    const desde = new Date(); desde.setDate(desde.getDate() - 40);
    const [r, e] = await Promise.all([
      s.from("registros").select("id,perro_id,tipo,minutos,fecha").eq("perro_id", perroId).gte("fecha", hoyISO(desde)),
      s.from("eventos_salud").select("id,perro_id,tipo,titulo,fecha,hecho").eq("perro_id", perroId).order("fecha"),
    ]);
    return { r: (r.data ?? []) as Registro[], e: (e.data ?? []) as EventoSalud[] };
  }, []);
  const cargar = useCallback(async (perroId: string) => {
    const d = await traer(perroId); setRegistros(d.r); setEventos(d.e);
  }, [traer]);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    traer(activo.id).then((d) => { if (vivo) { setRegistros(d.r); setEventos(d.e); } });
    return () => { vivo = false; };
  }, [activo, traer]);

  if (error) return <p className="error" role="alert">{error}</p>;
  if (!perros) return <p className="sub">Cargando tu plan…</p>;
  if (!activo) return <div className="cuerpo"><h1>Aún no tienes perros</h1><a className="cta" href="/inicio/sumar-perro">Sumar mi perro</a></div>;

  const nombre = activo.nombre || "tu perro";
  const meta = minutosEjercicio(activo.edad);
  const hechos = minutosDelDia(registros);
  const dias = diasEnCasa(activo);
  const proximos = eventos.filter((e) => !e.hecho);

  async function sumarMinutos(min: number) {
    const { error } = await crearCliente().from("registros").insert({ perro_id: activo!.id, tipo: "ejercicio", minutos: min, fecha: hoyISO() });
    if (error) setAviso("No pudimos guardar. Intenta de nuevo."); else void cargar(activo!.id);
  }
  async function deshacerUltimo() {
    const ult = registros.filter((r) => r.tipo === "ejercicio" && r.fecha === hoyISO()).at(-1);
    if (!ult) return;
    await crearCliente().from("registros").delete().eq("id", ult.id);
    void cargar(activo!.id);
  }
  async function guardarEvento() {
    if (!nuevo) return;
    const titulo = nuevo.titulo.trim() || TIPOS_EVENTO.find((t) => t.id === nuevo.tipo)!.texto;
    const { error } = await crearCliente().from("eventos_salud").insert({ perro_id: activo!.id, tipo: nuevo.tipo, titulo, fecha: nuevo.fecha });
    if (error) { setAviso("Revisa la fecha y vuelve a intentar."); return; }
    setNuevo(null); void cargar(activo!.id);
  }
  async function marcarHecho(ev: EventoSalud) {
    await crearCliente().from("eventos_salud").update({ hecho: true }).eq("id", ev.id);
    void cargar(activo!.id);
  }

  return (
    <div className="cuerpo entra">
      <p className="fecha-hoy">{fmtHoy.format(new Date())}</p>
      <div className="fila-tit"><h1>{perros.length > 1 ? `Tus ${perros.length} perros` : `El plan de ${nombre}`}</h1>
        <span className="chip-racha" title="Días seguidos de ejercicio">🔥 {racha(registros, "ejercicio")} días</span></div>
      <SelectorPerros perros={perros} fotos={fotos} activoId={activo.id} elegir={elegir} />
      <Escaner perro={activo} alActualizar={recargar} />

      <section className="tarjeta">
        <div className="tarjeta-tit"><span><Home size={15} /> Adaptación a su nuevo hogar</span><b>Día {dias}</b></div>
        <div className="pista"><i style={{ width: `${Math.min(100, (dias / 30) * 100)}%` }} /></div>
        <div className="hitos"><span className={dias >= 3 ? "ok" : dias < 3 ? "ahora" : ""}>{dias >= 3 && <Check size={11} />} 3 días</span>
          <span className={dias >= 7 ? "ok" : dias >= 3 ? "ahora" : ""}>{dias >= 7 && <Check size={11} />} 1 semana</span>
          <span className={dias >= 30 ? "ok" : dias >= 7 ? "ahora" : ""}>{dias >= 30 && <Check size={11} />} 1 mes</span></div>
      </section>

      <section className="tarjeta medidor-app">
        <p className="tarjeta-tit"><span>Ejercicio de hoy · {nombre}</span></p>
        <Medidor hechos={hechos} meta={meta} />
        <div className="medidor-num"><b>{hechos}<small> / {meta} min</small></b>
          <em>{hechos >= meta ? "¡Meta cumplida! 🎉" : `Faltan ${meta - hechos} min`}</em></div>
        <div className="botones-min">
          <button onClick={() => sumarMinutos(10)}><Plus size={15} /> 10 min</button>
          <button onClick={() => sumarMinutos(20)}><Plus size={15} /> 20 min</button>
          {hechos > 0 && <button className="suave" onClick={deshacerUltimo}>Deshacer</button>}
        </div>
      </section>

      <section className="tarjeta">
        <div className="tarjeta-tit"><span><Stethoscope size={15} /> Veterinario</span>
          {!nuevo && <button className="mini" onClick={() => setNuevo({ tipo: "vacuna", fecha: hoyISO(), titulo: "" })}><CalendarPlus size={15} /> Agregar</button>}</div>
        {proximos.length === 0 && !nuevo && <p className="vacio">Agrega sus próximas vacunas, desparasitaciones o controles y te los recordamos.</p>}
        {proximos.map((e) => (
          <div className="evento" key={e.id}>
            <div><b>{e.titulo}</b><span>{fechaCorta(e.fecha)} · {enDias(e.fecha)}</span></div>
            <button className="mini" onClick={() => marcarHecho(e)} aria-label={`Marcar ${e.titulo} como hecho`}><Check size={15} /> Hecho</button>
          </div>
        ))}
        {nuevo && (
          <div className="form-evento">
            <div className="chips">{TIPOS_EVENTO.map((t) => <button key={t.id} className="chip" aria-pressed={nuevo.tipo === t.id} onClick={() => setNuevo({ ...nuevo, tipo: t.id })}>{t.texto}</button>)}</div>
            <label className="etiqueta" htmlFor="ev-tit">Detalle (opcional)</label>
            <input id="ev-tit" className="campo chico" maxLength={80} placeholder="Ej.: Refuerzo anual" value={nuevo.titulo} onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })} />
            <label className="etiqueta" htmlFor="ev-fecha">Fecha</label>
            <input id="ev-fecha" className="campo chico" type="date" value={nuevo.fecha} onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })} />
            <div className="botones-min"><button onClick={guardarEvento}><Check size={15} /> Guardar</button><button className="suave" onClick={() => setNuevo(null)}><Trash2 size={15} /> Cancelar</button></div>
          </div>
        )}
        <p className="nota">Las fechas las define tu veterinario. Kopeet te las recuerda.</p>
      </section>

      <section className="tarjeta">
        <p className="tarjeta-tit"><span><MapPin size={15} /> Lugares para pasear cerca de ti</span></p>
        <div className="lugares">
          <a href={mapa("parques para perros cerca de mí")} target="_blank" rel="noopener noreferrer">🌳 Parques para perros</a>
          <a href={mapa("café pet friendly cerca de mí")} target="_blank" rel="noopener noreferrer">☕ Cafés que aceptan perros</a>
          <a href={mapa("veterinaria 24 horas cerca de mí")} target="_blank" rel="noopener noreferrer">🏥 Veterinarias 24 horas</a>
        </div>
        <p className="nota">Se abre en Google Maps con tu ubicación.</p>
      </section>
      {aviso && <p className="error" role="alert">{aviso}</p>}
    </div>
  );
}
