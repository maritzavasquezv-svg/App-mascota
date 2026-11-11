"use client";
import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Check, Home, Pencil, Stethoscope, Trash2 } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { usePerros } from "@/components/app/usePerros";
import SelectorPerros from "@/components/app/SelectorPerros";
import Escaner from "@/components/app/Escaner";
import RutinaHoy from "@/components/app/RutinaHoy";
import AvisoPlan, { usePlan } from "@/components/app/AvisoPlan";
import Recordatorios from "@/components/app/Recordatorios";
import { minutosEjercicio } from "@/lib/onboarding";
import { locale, useT } from "@/lib/i18n";
import { registrarEvento } from "@/lib/eventos";
import {
  TIPOS_EVENTO, diasEnCasa, enDias, fechaCorta, hoyISO, minutosDelDia, racha,
  type EventoSalud, type Registro,
} from "@/lib/app-datos";



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
  const { t, idioma } = useT();
  const plan = usePlan();
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
  if (!perros) return <p className="sub">{t("Cargando tu plan…", "Loading your plan…", "Carregando seu plano…")}</p>;
  if (!activo) return <div className="cuerpo"><h1>{t("Aún no tienes perros", "You don't have any dogs yet", "Você ainda não tem cães")}</h1><a className="cta" href="/inicio/sumar-perro">{t("Sumar mi perro", "Add my dog", "Adicionar meu cão")}</a></div>;

  const nombre = activo.nombre || t("tu perro", "your dog", "seu cão");
  const meta = minutosEjercicio(activo.edad);
  const hechos = minutosDelDia(registros);
  const dias = diasEnCasa(activo);
  const proximos = eventos.filter((e) => !e.hecho);

  async function agregar(tipo: Registro["tipo"], minutos?: number) {
    const { error } = await crearCliente().from("registros").insert({ perro_id: activo!.id, tipo, minutos: minutos ?? null, fecha: hoyISO() });
    if (error) setAviso(t("No pudimos guardar. Intenta de nuevo.", "We couldn't save. Try again.", "Não conseguimos salvar. Tente de novo."));
    else { registrarEvento("rutina", { tipo }); void cargar(activo!.id); }
  }
  async function deshacer(tipo: Registro["tipo"]) {
    const ult = registros.filter((r) => r.tipo === tipo && r.fecha === hoyISO()).at(-1);
    if (!ult) return;
    await crearCliente().from("registros").delete().eq("id", ult.id);
    void cargar(activo!.id);
  }
  async function guardarEvento() {
    if (!nuevo) return;
    const titulo = nuevo.titulo.trim() || TIPOS_EVENTO.find((x) => x.id === nuevo.tipo)!.texto[idioma];
    const { error } = await crearCliente().from("eventos_salud").insert({ perro_id: activo!.id, tipo: nuevo.tipo, titulo, fecha: nuevo.fecha });
    if (error) { setAviso(t("Revisa la fecha y vuelve a intentar.", "Check the date and try again.", "Confira a data e tente de novo.")); return; }
    setNuevo(null); void cargar(activo!.id);
  }
  async function marcarHecho(ev: EventoSalud) {
    await crearCliente().from("eventos_salud").update({ hecho: true }).eq("id", ev.id);
    void cargar(activo!.id);
  }

  return (
    <div className="cuerpo entra">
      <p className="fecha-hoy">{new Intl.DateTimeFormat(locale(idioma), { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</p>
      <div className="fila-tit"><h1>{perros.length > 1 ? t(`Tus ${perros.length} perros`, `Your ${perros.length} dogs`, `Seus ${perros.length} cães`) : t(`El plan de ${nombre}`, `${nombre}'s plan`, `O plano de ${nombre}`)}</h1>
        <span className="chip-racha" title={t("Días seguidos de ejercicio", "Days of exercise in a row", "Dias seguidos de exercício")}>🔥 {racha(registros, "ejercicio")} {t("días", "days", "dias")}</span></div>
      <SelectorPerros perros={perros} fotos={fotos} activoId={activo.id} elegir={elegir} />
      <a className="enlace-raza" href={`/inicio/editar-perro?id=${activo.id}`} style={{ marginTop: 4 }}><Pencil size={13} /> {t(`Editar o borrar a ${nombre}`, `Edit or delete ${nombre}`, `Editar ou apagar ${nombre}`)}</a>
      <AvisoPlan plan={plan} />
      <Recordatorios compacta />
      <Escaner perro={activo} alActualizar={recargar} />

      <section className="tarjeta">
        <div className="tarjeta-tit"><span><Home size={15} /> {t("Adaptación a su nuevo hogar", "Settling into the new home", "Adaptação ao novo lar")}</span><b>{t("Día", "Day", "Dia")} {dias}</b></div>
        <div className="pista"><i style={{ width: `${Math.min(100, (dias / 30) * 100)}%` }} /></div>
        <div className="hitos"><span className={dias >= 3 ? "ok" : dias < 3 ? "ahora" : ""}>{dias >= 3 && <Check size={11} />} {t("3 días", "3 days", "3 dias")}</span>
          <span className={dias >= 7 ? "ok" : dias >= 3 ? "ahora" : ""}>{dias >= 7 && <Check size={11} />} {t("1 semana", "1 week", "1 semana")}</span>
          <span className={dias >= 30 ? "ok" : dias >= 7 ? "ahora" : ""}>{dias >= 30 && <Check size={11} />} {t("1 mes", "1 month", "1 mês")}</span></div>
      </section>

      <section className="tarjeta medidor-app">
        <p className="tarjeta-tit"><span>{t("Actividad de hoy", "Today's activity", "Atividade de hoje")} · {nombre}</span></p>
        <Medidor hechos={hechos} meta={meta} />
        <div className="medidor-num"><b>{hechos}<small> / {meta} min</small></b>
          <em>{hechos >= meta ? t("¡Meta cumplida! 🎉", "Goal reached! 🎉", "Meta cumprida! 🎉") : t(`Faltan ${meta - hechos} min`, `${meta - hechos} min to go`, `Faltam ${meta - hechos} min`)}</em></div>
        <p className="nota" style={{ textAlign: "center" }}>{t("Suma paseo y juego. Anótalos en su rutina.", "Walks and play add up. Log them in the routine.", "Soma passeio e brincadeira. Anote na rotina.")}</p>
      </section>

      <RutinaHoy registros={registros} edad={activo.edad} nombre={nombre} agregar={agregar} deshacer={deshacer} />

      <section className="tarjeta">
        <div className="tarjeta-tit"><span><Stethoscope size={15} /> {t("Veterinario", "Vet", "Veterinário")}</span>
          {!nuevo && <button className="mini" onClick={() => setNuevo({ tipo: "vacuna", fecha: hoyISO(), titulo: "" })}><CalendarPlus size={15} /> {t("Agregar", "Add", "Adicionar")}</button>}</div>
        {proximos.length === 0 && !nuevo && <p className="vacio">{t("Agrega sus próximas vacunas, desparasitaciones o controles y te los recordamos.", "Add upcoming vaccines, deworming or checkups and we'll remind you.", "Adicione as próximas vacinas, vermifugações ou check-ups e nós lembramos você.")}</p>}
        {proximos.map((e) => (
          <div className="evento" key={e.id}>
            <div><b>{e.titulo}</b><span>{fechaCorta(e.fecha, idioma)} · {enDias(e.fecha, idioma)}</span></div>
            <button className="mini" onClick={() => marcarHecho(e)} aria-label={t(`Marcar ${e.titulo} como hecho`, `Mark ${e.titulo} as done`, `Marcar ${e.titulo} como feito`)}><Check size={15} /> {t("Hecho", "Done", "Feito")}</button>
          </div>
        ))}
        {nuevo && (
          <div className="form-evento">
            <div className="chips">{TIPOS_EVENTO.map((x) => <button key={x.id} className="chip" aria-pressed={nuevo.tipo === x.id} onClick={() => setNuevo({ ...nuevo, tipo: x.id })}>{x.texto[idioma]}</button>)}</div>
            <label className="etiqueta" htmlFor="ev-tit">{t("Detalle (opcional)", "Details (optional)", "Detalhe (opcional)")}</label>
            <input id="ev-tit" className="campo chico" maxLength={80} placeholder={t("Ej.: Refuerzo anual", "E.g.: Annual booster", "Ex.: Reforço anual")} value={nuevo.titulo} onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })} />
            <label className="etiqueta" htmlFor="ev-fecha">{t("Fecha", "Date", "Data")}</label>
            <input id="ev-fecha" className="campo chico" type="date" value={nuevo.fecha} onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })} />
            <div className="botones-min"><button onClick={guardarEvento}><Check size={15} /> {t("Guardar", "Save", "Salvar")}</button><button className="suave" onClick={() => setNuevo(null)}><Trash2 size={15} /> {t("Cancelar", "Cancel", "Cancelar")}</button></div>
          </div>
        )}
        <p className="nota">{t("Las fechas las define tu veterinario. Kopeet te las recuerda.", "Your vet sets the dates. Kopeet reminds you.", "As datas são definidas pelo seu veterinário. O Kopeet lembra você.")}</p>
      </section>

      <a className="enlace-raza" href="/inicio/destinos" style={{ marginTop: 14 }}>📍 {t("Parques, cafés y veterinarias cerca: ver Destinos", "Parks, cafés and vets nearby: see Places", "Parques, cafés e veterinárias perto: ver Destinos")}</a>
      {aviso && <p className="error" role="alert">{aviso}</p>}
    </div>
  );
}
