"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, PawPrint } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { usePerros } from "@/components/app/usePerros";
import SelectorPerros from "@/components/app/SelectorPerros";
import { hoyISO, racha, type Registro } from "@/lib/app-datos";
import { useT, type Txt } from "@/lib/i18n";
import { registrarEvento } from "@/lib/eventos";

const PASOS: { t: Txt; d: Txt }[] = [
  { t: { es: "Llévalo a su lugar apenas despierte", en: "Take them to their spot as soon as they wake up", pt: "Leve ao lugar certo assim que acordar" },
    d: { es: "Es cuando más ganas tiene.", en: "That's when they need it most.", pt: "É quando mais tem vontade." } },
  { t: { es: "Después de cada comida y de jugar", en: "After every meal and play session", pt: "Depois de cada refeição e brincadeira" },
    d: { es: "Unos 10 a 15 minutos después.", en: "About 10 to 15 minutes after.", pt: "Uns 10 a 15 minutos depois." } },
  { t: { es: "Premio en cuanto lo haga bien", en: "Reward right when they get it right", pt: "Prêmio assim que fizer certo" },
    d: { es: "Una caricia o un snack, en ese mismo momento.", en: "A pat or a treat, at that very moment.", pt: "Um carinho ou um petisco, no mesmo momento." } },
  { t: { es: "Antes de dormir", en: "Before bedtime", pt: "Antes de dormir" },
    d: { es: "Una última salida a su lugar.", en: "One last trip to their spot.", pt: "Uma última ida ao lugar certo." } },
  { t: { es: "Si se equivoca, no lo retes", en: "If they make a mistake, don't scold", pt: "Se errar, não brigue" },
    d: { es: "Limpia sin olor (con vinagre y agua) y vuelve a empezar.", en: "Clean so no smell remains (vinegar and water) and start again.", pt: "Limpe sem deixar cheiro (vinagre e água) e recomece." } },
];
const DIAS: Txt[] = [
  { es: "L", en: "M", pt: "S" }, { es: "M", en: "T", pt: "T" }, { es: "M", en: "W", pt: "Q" }, { es: "J", en: "T", pt: "Q" },
  { es: "V", en: "F", pt: "S" }, { es: "S", en: "S", pt: "S" }, { es: "D", en: "S", pt: "D" },
];

export default function Bano() {
  const { perros, fotos, activo, elegir, error } = usePerros();
  const { t, idioma } = useT();
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
  if (!perros || !activo) return <p className="sub">{t("Cargando…", "Loading…", "Carregando…")}</p>;

  const nombre = activo.nombre || t("tu perro", "your dog", "seu cão");
  const n = racha(registros, "bano");
  const hoyHecho = registros.some((r) => r.fecha === hoyISO());
  // Semana actual (lunes a domingo)
  const hoy = new Date(); const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const semana = DIAS.map((d, i) => { const f = new Date(lunes); f.setDate(lunes.getDate() + i); const iso = hoyISO(f); return { d: d[idioma], iso, ok: registros.some((r) => r.fecha === iso), hoy: iso === hoyISO() }; });

  async function loHizo() {
    const { error } = await crearCliente().from("registros").insert({ perro_id: activo!.id, tipo: "bano", fecha: hoyISO() });
    if (!error) { registrarEvento("rutina", { tipo: "bano" }); await cargar(activo!.id); if (n + (hoyHecho ? 0 : 1) >= 7) setFestejo(true); }
  }

  return (
    <div className="cuerpo entra">
      <Link className="atras" href="/inicio" aria-label={t("Volver a Hoy", "Back to Today", "Voltar para Hoje")} style={{ marginBottom: 8 }}><ArrowLeft size={18} /></Link>
      <p className="fecha-hoy">{t(`Plan de ${nombre}`, `${nombre}'s plan`, `Plano de ${nombre}`)}</p>
      <h1>{t("Orina y heces en su lugar", "Urine and feces in the right spot", "Xixi e cocô no lugar certo")}</h1>
      <SelectorPerros perros={perros} fotos={fotos} activoId={activo.id} elegir={elegir} />
      <div className="racha-card"><div><b>{t(`${n} día${n === 1 ? "" : "s"} seguido${n === 1 ? "" : "s"}`, `${n} day${n === 1 ? "" : "s"} in a row`, `${n} dia${n === 1 ? "" : "s"} seguido${n === 1 ? "" : "s"}`)}</b><span>{t("Hizo sus necesidades en su lugar", "Went in the right spot", "Fez as necessidades no lugar certo")}</span></div>
        <img src="/marca/premio-escarapela.png" alt="" width={50} height={50} className={n >= 7 ? "" : "apagada"} /></div>
      <div className="semana">{semana.map((s) => <span key={s.iso} className={`${s.ok ? "ok" : ""} ${s.hoy ? "hoy" : ""}`}>{s.ok ? <Check size={13} /> : s.d}</span>)}</div>
      <p className="nota" style={{ textAlign: "center" }}>{n >= 7
        ? t("¡Ganó la escarapela de la Galleta campeona! 🏅", "Earned the Champion cookie rosette! 🏅", "Ganhou a roseta do Biscoito campeão! 🏅")
        : <>{t("Faltan ", "", "Faltam ")}<b>{t(`${7 - n} días`, `${7 - n} days`, `${7 - n} dias`)}</b>{t(" para ganar la escarapela 🏅", " to go to earn the rosette 🏅", " para ganhar a roseta 🏅")}</>}</p>
      <div className="pasos-bano">{PASOS.map((p, i) => <div key={i}><span>{i + 1}</span><div><b>{p.t[idioma]}</b><em>{p.d[idioma]}</em></div></div>)}</div>
      <button className="cta azul" style={{ marginTop: 14 }} onClick={loHizo} disabled={hoyHecho}><PawPrint size={18} /> {hoyHecho
        ? t("Hoy ya lo registraste ✓", "Already logged today ✓", "Hoje já foi registrado ✓")
        : t("Hizo orina o heces en su lugar", "Urinated or defecated in the right spot", "Fez xixi ou cocô no lugar certo")}</button>
      {festejo && (
        <div className="festejo" role="dialog" aria-label={t("Premio", "Reward", "Prêmio")}>
          <img src="/marca/premio-escarapela.png" alt={t("Escarapela", "Rosette", "Roseta")} width={110} height={110} />
          <b>{t("¡Premio de perrito!", "Puppy reward!", "Prêmio de cãozinho!")}</b>
          <span>{t(`${nombre} hizo sus necesidades en su lugar 7 días seguidos.`, `${nombre} went in the right spot 7 days in a row.`, `${nombre} fez as necessidades no lugar certo 7 dias seguidos.`)}</span>
          <button className="cta" onClick={() => setFestejo(false)}>{t("¡Genial!", "Awesome!", "Que legal!")}</button>
        </div>
      )}
    </div>
  );
}
