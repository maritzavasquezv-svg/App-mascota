"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Info, RefreshCw } from "lucide-react";
import type { Panel, Persona } from "@/lib/panel";

// ---------- Formatos ----------
const fmtNum = new Intl.NumberFormat("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd = (x: number | null | undefined) => (x === null || x === undefined ? "Sin datos" : `${x < 0 ? "−" : ""}US$ ${fmtNum.format(Math.abs(x))}`);
const pct = (x: number | null | undefined) => (x === null || x === undefined ? "Sin datos" : `${Math.round(x * 100)}%`);
const fecha = (s: string | null) => (s ? new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", year: "2-digit" }).format(new Date(s)) : "—");
const fechaHora = (s: string | null) => (s ? new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(s)) : "—");
const nombreMes = (ym: string) => new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric" }).format(new Date(`${ym.slice(0, 7)}-15T12:00:00`));
const mesCorto = (ym: string) => new Intl.DateTimeFormat("es-CL", { month: "short" }).format(new Date(`${ym}-15T12:00:00`)).replace(".", "");
const ymDe = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const moverMes = (ym: string, n: number) => { const [a, m] = ym.split("-").map(Number); return ymDe(new Date(a, m - 1 + n, 1)); };

const SECCIONES = [
  ["resumen", "Resumen"], ["ventas", "Ventas"], ["ganancia", "Ganancia real"], ["usuarios", "Usuarios"], ["uso", "Uso"],
  ["canales", "Canales"], ["ia", "IA"], ["personas", "Personas"], ["salud", "Salud"], ["ajustes", "Ajustes"],
] as const;
type Seccion = (typeof SECCIONES)[number][0];

const NOMBRES_EVENTO: Record<string, string> = {
  rutina: "Anotó algo en la rutina", consejero: "Preguntó al Consejero", escaner: "Usó el escáner", app_abierta: "Abrió la app",
  perro_creado: "Sumó un perro", premios_vistos: "Vio sus premios", destino_abierto: "Abrió un destino", emergencia_abierta: "Abrió Emergencia",
};
const PASOS_ONB = ["Nombre", "Cómo llegó", "Edad", "Preocupaciones", "Mensaje", "Foto", "Hora de paseo", "Armando el plan"];
const ESTADOS: Record<string, string> = { activa: "Activo", cancelada: "Cancelado", reembolsada: "Reembolsado", vencida: "Vencido", "sin plan": "Sin plan" };

// ---------- Piezas visuales ----------
function SinDatos({ texto = "Sin datos" }: { texto?: string }) { return <span className="pa-sindatos">{texto}</span>; }

function Kpi({ titulo, valor, nota, tono }: { titulo: string; valor: React.ReactNode; nota?: React.ReactNode; tono?: "bien" | "mal" }) {
  return <div className={`pa-kpi${tono ? ` ${tono}` : ""}`}><span>{titulo}</span><b>{valor}</b>{nota && <small>{nota}</small>}</div>;
}

function Cambio({ ahora, antes }: { ahora: number; antes: number }) {
  if (!antes) return null;
  const d = (ahora - antes) / Math.abs(antes);
  return <small className={d >= 0 ? "pa-sube" : "pa-baja"}>{d >= 0 ? "▲" : "▼"} {Math.abs(Math.round(d * 100))}% vs mes anterior</small>;
}

/** Barras verticales sobrias: sin grilla, etiqueta directa en la barra destacada. */
function Barras({ datos, destacar, formato }: { datos: { etiqueta: string; valor: number }[]; destacar?: string; formato: (x: number) => string }) {
  const max = Math.max(...datos.map((d) => d.valor), 0);
  if (max === 0) return <p className="pa-vacio">Todavía no hay movimientos para dibujar.</p>;
  const W = 100 / datos.length;
  return (
    <svg className="pa-barras" viewBox="0 0 100 46" preserveAspectRatio="none" role="img" aria-label="Gráfico por mes">
      {datos.map((d, i) => {
        const h = (d.valor / max) * 34;
        const on = d.etiqueta === destacar;
        return (
          <g key={d.etiqueta}>
            <rect x={i * W + W * 0.18} y={38 - h} width={W * 0.64} height={Math.max(h, d.valor > 0 ? 0.6 : 0)} rx={0.8} fill={on ? "#2f6bff" : "#bcd0f7"} />
            {on && d.valor > 0 && <text x={i * W + W / 2} y={36 - h} textAnchor="middle" className="pa-bv">{formato(d.valor)}</text>}
            <text x={i * W + W / 2} y={44.5} textAnchor="middle" className="pa-be">{d.etiqueta}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Barras horizontales para embudos y porcentajes. */
function Fila({ texto, valor, max, detalle }: { texto: string; valor: number; max: number; detalle: string }) {
  return (
    <div className="pa-fila">
      <span className="pa-fila-t">{texto}</span>
      <span className="pa-fila-b"><i style={{ width: `${max > 0 ? Math.max(2, (valor / max) * 100) : 0}%` }} /></span>
      <span className="pa-fila-v">{detalle}</span>
    </div>
  );
}

function Tarjeta({ titulo, children, ayuda }: { titulo: string; children: React.ReactNode; ayuda?: string }) {
  return <section className="pa-tarjeta"><h2>{titulo}</h2>{ayuda && <p className="pa-ayuda">{ayuda}</p>}{children}</section>;
}

// ---------- Panel ----------
export default function PanelAdmin({ correo }: { correo: string }) {
  const [mes, setMes] = useState(() => ymDe(new Date()));
  const [seccion, setSeccion] = useState<Seccion>("resumen");
  const [datos, setDatos] = useState<Panel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [version, setVersion] = useState(0);
  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let vivo = true;
    fetch(`/api/admin/panel?mes=${mes}`).then(async (r) => {
      const d = await r.json();
      if (!vivo) return;
      if (!r.ok) setError(r.status === 403 ? "Esta página es solo para la administración de Kopeet." : d.error ?? "No pudimos cargar el panel.");
      else { setDatos(d as Panel); setError(null); }
    }).catch(() => { if (vivo) setError("No pudimos cargar el panel. Revisa tu conexión."); })
      .finally(() => { if (vivo) setCargando(false); });
    return () => { vivo = false; };
  }, [mes, version]);

  const esMesActual = mes === ymDe(new Date());

  return (
    <div className="pa">
      <header className="pa-cabeza">
        <Link className="pa-volver" href="/inicio" aria-label="Volver a la app"><ArrowLeft size={18} /></Link>
        <img src="/marca/isotipo-kopeet-180.png" alt="" />
        <div><b>Panel de Kopeet</b><small>{correo}</small></div>
        <button className="pa-icono" onClick={() => { setCargando(true); recargar(); }} aria-label="Actualizar" title="Actualizar"><RefreshCw size={17} className={cargando ? "gira" : ""} /></button>
      </header>

      <div className="pa-mes">
        <button onClick={() => { setCargando(true); setMes((m) => moverMes(m, -1)); }} aria-label="Mes anterior"><ChevronLeft size={18} /></button>
        <b>{nombreMes(mes)}</b>
        <button onClick={() => { setCargando(true); setMes((m) => moverMes(m, 1)); }} disabled={esMesActual} aria-label="Mes siguiente"><ChevronRight size={18} /></button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {!datos && !error && <p className="pa-cargando">Cargando…</p>}

      {datos && (<>
        <Avisos d={datos} irA={setSeccion} />
        <nav className="pa-tabs" aria-label="Secciones del panel">
          {SECCIONES.map(([id, texto]) => (
            <button key={id} aria-pressed={seccion === id} onClick={() => setSeccion(id)}>{texto}</button>
          ))}
        </nav>
        <div className={`pa-cuerpo${cargando ? " pa-atenuado" : ""}`}>
          {seccion === "resumen" && <Resumen d={datos} mes={mes} irA={setSeccion} />}
          {seccion === "ventas" && <Ventas d={datos} mes={mes} />}
          {seccion === "ganancia" && <Ganancia d={datos} irA={setSeccion} />}
          {seccion === "usuarios" && <Usuarios d={datos} />}
          {seccion === "uso" && <Uso d={datos} />}
          {seccion === "canales" && <Canales d={datos} irA={setSeccion} />}
          {seccion === "ia" && <IA d={datos} />}
          {seccion === "personas" && <Personas d={datos} alCambiar={recargar} />}
          {seccion === "salud" && <Salud d={datos} alCambiar={recargar} irA={setSeccion} />}
          {seccion === "ajustes" && <Ajustes d={datos} mes={mes} alCambiar={recargar} />}
        </div>
        <p className="pa-pie">Datos reales de la base · actualizados {fechaHora(datos.generado)} · montos en US$</p>
      </>)}
    </div>
  );
}

// ---------- Avisos ----------
function Avisos({ d, irA }: { d: Panel; irA: (s: Seccion) => void }) {
  const graves = d.avisos.filter((a) => a.nivel !== "info");
  const info = d.avisos.filter((a) => a.nivel === "info");
  return (
    <div className="pa-avisos">
      {d.enOrden && <div className="pa-aviso ok"><CheckCircle2 size={20} /><div><b>✅ Todo en orden este mes</b><span>No hay nada urgente que revisar.</span></div></div>}
      {[...graves, ...info].map((a, i) => (
        <div key={i} className={`pa-aviso ${a.nivel}`}>
          {a.nivel === "info" ? <Info size={20} /> : <AlertTriangle size={20} />}
          <div>
            <b>{a.titulo}</b>
            <span><em>Por qué importa:</em> {a.porque}</span>
            <span><em>Qué hacer:</em> {a.queHacer}</span>
            {a.titulo.includes("Hotmart") && <button className="pa-link" onClick={() => irA("ajustes")}>Ir a Ajustes →</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Resumen ----------
function Resumen({ d, mes, irA }: { d: Panel; mes: string; irA: (s: Seccion) => void }) {
  const r = d.resumen;
  return (<>
    <section className="pa-hero">
      {r.hayVentas ? (<>
        <p>En {nombreMes(mes)} facturaste</p>
        <strong>{usd(r.ingresos)}</strong>
        <p>y te quedaron <b className={r.ganancia >= 0 ? "pa-verde" : "pa-rojo"}>{usd(r.ganancia)} limpios</b>{r.margen !== null && <> ({pct(r.margen)} de margen)</>}</p>
        <Cambio ahora={r.ingresos} antes={r.ingresosAnt} />
      </>) : (<>
        <p>En {nombreMes(mes)}</p>
        <strong>Sin ventas todavía</strong>
        <p>Los costos del mes suman <b>{usd(d.ganancia.costoTotal)}</b>. Cuando Hotmart avise la primera venta, aquí verás cuánto te queda limpio.</p>
      </>)}
      <button className="pa-link claro" onClick={() => irA("ganancia")}>Ver el detalle de la ganancia →</button>
    </section>
    <div className="pa-kpis">
      <Kpi titulo="Ingreso mensual recurrente (MRR)" valor={d.ventas.activas.pagadas ? usd(r.mrr) : <SinDatos />} nota="Lo que entra cada mes por suscripciones activas" />
      <Kpi titulo="Clientes pagando" valor={r.clientesPagando} nota={r.accesosManuales ? `+ ${r.accesosManuales} con acceso dado a mano` : undefined} />
      <Kpi titulo="Usuarios en total" valor={d.usuarios.total} nota={`${d.usuarios.nuevosMes} nuevos este mes`} />
      <Kpi titulo="Activos esta semana" valor={d.usuarios.activos7} nota="Usaron la app en los últimos 7 días" />
      <Kpi titulo="Activación" valor={pct(d.usuarios.activacionTasa)} nota="Usaron la app de verdad en su primera semana" />
      <Kpi titulo="Costo de IA hoy" valor={d.ia.usosMes && d.ia.usosSinCosto === d.ia.usosMes ? <SinDatos /> : usd(d.ia.hoy)} nota={`${usd(d.ia.mes)} en el mes`} />
    </div>
  </>);
}

// ---------- Ventas ----------
function Ventas({ d, mes }: { d: Panel; mes: string }) {
  const v = d.ventas;
  const serie = v.porMes.map((x) => ({ etiqueta: mesCorto(x.mes), valor: x.bruto }));
  const totalBajas = v.bajas.voluntarias + v.bajas.involuntarias;
  return (<>
    <div className="pa-kpis">
      <Kpi titulo="Ingresos del mes" valor={usd(v.bruto)} nota={<Cambio ahora={v.bruto} antes={v.anterior.bruto} />} />
      <Kpi titulo="Compras" valor={v.compras} nota={`${v.nuevas} nuevas · ${v.renovaciones} renovaciones`} />
      <Kpi titulo="MRR" valor={v.activas.pagadas ? usd(v.activas.mrr) : <SinDatos />} nota={v.activas.mrrSinMonto ? `${v.activas.mrrSinMonto} suscripciones sin monto registrado` : "Anual se cuenta como 1/12 por mes"} />
      <Kpi titulo="Reembolsos" valor={v.bajas.reembolsos} nota={v.bajas.reembolsos ? `${usd(v.bajas.montoReembolsado)} devueltos` : "Ninguno este mes"} tono={v.bajas.reembolsos ? "mal" : undefined} />
    </div>
    <Tarjeta titulo="Ingresos de los últimos 12 meses">
      <Barras datos={serie} destacar={mesCorto(mes)} formato={(x) => `$${Math.round(x)}`} />
    </Tarjeta>
    <Tarjeta titulo="Cancelaciones del mes" ayuda="Voluntaria: la persona decidió irse. Involuntaria: falló su pago (tarjeta rechazada o vencida); esa plata se puede recuperar.">
      {totalBajas === 0 && !v.compras && !v.activas.pagadas ? <p className="pa-vacio">Sin datos: aún no hay suscripciones.</p> : (<>
        <Fila texto="Voluntarias" valor={v.bajas.voluntarias} max={Math.max(totalBajas, 1)} detalle={String(v.bajas.voluntarias)} />
        <Fila texto="Involuntarias (pago fallido)" valor={v.bajas.involuntarias} max={Math.max(totalBajas, 1)} detalle={String(v.bajas.involuntarias)} />
        <p className="pa-nota">Tasa de cancelación del mes: <b>{pct(v.churn)}</b> (involuntaria: {pct(v.churnInvol)}).</p>
      </>)}
    </Tarjeta>
    {v.monedas.length > 1 && <p className="pa-nota">Atención: hay ventas en más de una moneda ({v.monedas.join(", ")}). Los totales las suman tal como llegan.</p>}
  </>);
}

// ---------- Ganancia real ----------
function Ganancia({ d, irA }: { d: Panel; irA: (s: Seccion) => void }) {
  const g = d.ganancia;
  return (<>
    <Tarjeta titulo="Lo que queda después de todos los costos" ayuda="Ingresos del mes menos cada costo real. Lo que falta configurar dice «Sin datos».">
      <div className="pa-cascada">
        <div className="pa-linea total"><span>Ingresos</span><b>{usd(g.ingresos)}</b></div>
        {g.lineas.map((l) => (
          <div className="pa-linea" key={l.clave}>
            <span>− {l.texto}</span>
            <b>{l.sinDatos ? <SinDatos /> : usd(l.monto)}</b>
            {g.ingresos > 0 && !l.sinDatos && <i style={{ width: `${Math.min(100, (l.monto / g.ingresos) * 100)}%` }} />}
          </div>
        ))}
        <div className={`pa-linea final ${g.ganancia >= 0 ? "bien" : "mal"}`}><span>= Te queda limpio</span><b>{usd(g.ganancia)}</b></div>
        <p className="pa-nota">Margen: <b>{pct(g.margen)}</b>{g.ingresos === 0 && " (sin ventas este mes)"}</p>
      </div>
      {!g.configurado && <button className="pa-link" onClick={() => irA("ajustes")}>Configura impuestos, servidores y correos en Ajustes →</button>}
    </Tarjeta>
  </>);
}

// ---------- Usuarios ----------
function Usuarios({ d }: { d: Panel }) {
  const u = d.usuarios;
  const textos: Record<number, string> = { 1: "Siguieron usándola después del 1er día", 7: "…después de 1 semana", 30: "…después de 1 mes" };
  return (<>
    <div className="pa-kpis">
      <Kpi titulo="Usuarios en total" valor={u.total} nota={`${u.confirmados} confirmaron su correo`} />
      <Kpi titulo="Nuevos este mes" valor={u.nuevosMes} nota={<Cambio ahora={u.nuevosMes} antes={u.nuevosAnterior} />} />
      <Kpi titulo="Activos 7 días" valor={u.activos7} />
      <Kpi titulo="Activos 30 días" valor={u.activos30} />
    </div>
    <Tarjeta titulo="Activación" ayuda="Personas que sumaron su perro y además anotaron la rutina o usaron el Consejero o el escáner en su primera semana.">
      {u.activacion.base ? <Fila texto="Se activaron" valor={u.activacion.activados} max={u.activacion.base} detalle={`${u.activacion.activados} de ${u.activacion.base} · ${pct(u.activacionTasa)}`} /> : <p className="pa-vacio">Sin datos.</p>}
    </Tarjeta>
    <Tarjeta titulo="Retención" ayuda="De quienes crearon su cuenta hace al menos ese tiempo, cuántos volvieron a usar la app después.">
      {u.retencion.map((x) => x.base
        ? <Fila key={x.dia} texto={textos[x.dia]} valor={x.volvieron} max={x.base} detalle={`${x.volvieron} de ${x.base} · ${pct(x.tasa)}`} />
        : <div key={x.dia} className="pa-fila"><span className="pa-fila-t">{textos[x.dia]}</span><span className="pa-fila-v"><SinDatos texto="Sin datos aún" /></span></div>)}
    </Tarjeta>
  </>);
}

// ---------- Uso ----------
function Uso({ d }: { d: Panel }) {
  const u = d.uso;
  const maxEmbudo = Math.max(u.visitas, ...u.embudo.map((e) => e.sesiones), 1);
  const acciones = Object.entries(u.eventos).filter(([k]) => NOMBRES_EVENTO[k]).sort((a, b) => b[1] - a[1]);
  const maxAcc = Math.max(...acciones.map(([, n]) => n), 1);
  const sinEventos = !u.desde;
  return (<>
    {sinEventos && <p className="pa-nota destacada">El registro de uso empezó con esta versión del panel. Los números se irán llenando a medida que la gente use Kopeet.</p>}
    <Tarjeta titulo="Embudo: de la visita a la cuenta" ayuda="Personas (navegadores distintos) que llegaron a cada paso este mes. Donde la barra cae fuerte, ahí se va la gente.">
      <Fila texto="Visitaron la página de ventas" valor={u.visitas} max={maxEmbudo} detalle={String(u.visitas)} />
      {u.embudo.map((e) => <Fila key={e.paso} texto={`Paso ${e.paso}: ${PASOS_ONB[e.paso - 1]}`} valor={e.sesiones} max={maxEmbudo} detalle={String(e.sesiones)} />)}
      <Fila texto="Vieron los planes" valor={u.vieronPlanes} max={maxEmbudo} detalle={String(u.vieronPlanes)} />
      <Fila texto="Eligieron un plan" valor={u.eligieronPlan} max={maxEmbudo} detalle={String(u.eligieronPlan)} />
      <Fila texto="Crearon su cuenta" valor={u.cuentas} max={maxEmbudo} detalle={String(u.cuentas)} />
    </Tarjeta>
    <Tarjeta titulo="Lo que más hace la gente en la app" ayuda="Acción principal de Kopeet: anotar la rutina del día.">
      {acciones.length ? acciones.map(([k, n]) => <Fila key={k} texto={NOMBRES_EVENTO[k]} valor={n} max={maxAcc} detalle={`${n} veces · ${u.personasPorAccion[k] ?? 0} personas`} />)
        : <p className="pa-vacio">Sin datos este mes.</p>}
    </Tarjeta>
  </>);
}

// ---------- Canales ----------
function Canales({ d, irA }: { d: Panel; irA: (s: Seccion) => void }) {
  return (<>
    <p className="pa-nota">Para saber de dónde llega cada persona, comparte enlaces con <b>?origen=</b>, por ejemplo <code>…/?origen=instagram</code>. Para el costo por cliente, anota lo que gastas en publicidad en <button className="pa-link en-linea" onClick={() => irA("ajustes")}>Ajustes</button>.</p>
    {d.canales.length === 0 && <p className="pa-vacio">Sin datos.</p>}
    {d.canales.map((k) => {
      const sano = k.ratio !== null ? k.ratio >= 3 : null;
      return (
        <section className="pa-tarjeta pa-canal" key={k.canal}>
          <h2>{k.canal}</h2>
          <div className="pa-mini">
            <div><span>Usuarios</span><b>{k.usuarios}</b><small>{k.usuariosMes} este mes</small></div>
            <div><span>Clientes</span><b>{k.clientes}</b><small>{k.conversion !== null ? `${pct(k.conversion)} pagó` : "—"}</small></div>
            <div><span>Valor por cliente (LTV)</span><b>{k.ltv !== null ? usd(k.ltv) : <SinDatos />}</b><small>Lo que dejó cada uno hasta hoy</small></div>
            <div><span>Costo por cliente (CAC)</span><b>{k.gastoTotal === 0 ? <SinDatos texto="Sin gasto anotado" /> : k.cac !== null ? usd(k.cac) : <SinDatos texto="Sin clientes aún" />}</b><small>Publicidad ÷ clientes</small></div>
            <div className={sano === null ? "" : sano ? "bien" : "mal"}><span>LTV : CAC</span><b>{k.ratio !== null ? `${k.ratio} : 1` : <SinDatos />}</b><small>Sano desde 3 : 1</small></div>
            <div><span>Recupera la inversión en</span><b>{k.recuperacionMeses !== null ? `${k.recuperacionMeses} meses` : <SinDatos />}</b></div>
            <div className={k.ganancia >= 0 ? "bien" : "mal"}><span>Ganancia del canal</span><b>{usd(k.ganancia)}</b><small>Ingresos − publicidad</small></div>
          </div>
        </section>
      );
    })}
  </>);
}

// ---------- IA ----------
function IA({ d }: { d: Panel }) {
  const i = d.ia;
  const sinCostos = i.usosMes > 0 && i.usosSinCosto === i.usosMes;
  const maxF = Math.max(...i.porFuncion.map((f) => f.costo ?? 0), 0.0001);
  const nombres: Record<string, string> = { consejero: "Consejero", escaner: "Escáner por foto" };
  return (<>
    {i.usosSinCosto > 0 && <p className="pa-nota">{i.usosSinCosto} usos de este mes son anteriores al registro de costos y figuran como «Sin datos».</p>}
    <div className="pa-kpis">
      <Kpi titulo="Gasto de hoy" valor={sinCostos ? <SinDatos /> : usd(i.hoy)} />
      <Kpi titulo="Gasto del mes" valor={sinCostos ? <SinDatos /> : usd(i.mes)} nota={`${i.usosMes} usos`} />
      <Kpi titulo="% de lo vendido" valor={pct(i.porcentajeIngresos)} nota="Alerta sobre 20%" tono={i.porcentajeIngresos !== null && i.porcentajeIngresos > 0.2 ? "mal" : undefined} />
      <Kpi titulo="Por cliente que paga" valor={i.porCliente !== null ? usd(i.porCliente) : <SinDatos />} />
    </div>
    <Tarjeta titulo="Por función">
      {i.porFuncion.length ? i.porFuncion.map((f) => <Fila key={f.funcion} texto={nombres[f.funcion] ?? f.funcion} valor={f.costo ?? 0} max={maxF} detalle={`${f.costo === null ? "Sin datos" : usd(f.costo)} · ${f.usos} usos`} />)
        : <p className="pa-vacio">Sin usos este mes.</p>}
    </Tarjeta>
    <Tarjeta titulo="Gasto por día">
      <Barras datos={i.porDia.map((x) => ({ etiqueta: x.dia.slice(8), valor: x.costo }))} destacar={new Date().toISOString().slice(8, 10)} formato={(x) => `$${x.toFixed(2)}`} />
    </Tarjeta>
    <Tarjeta titulo="Quién la usa más (top 10)">
      {i.porUsuario.length ? <table className="pa-tabla"><tbody>{i.porUsuario.map((u) => <tr key={u.email}><td>{u.email}</td><td>{u.usos} usos</td><td>{u.costo === null ? "Sin datos" : usd(u.costo)}</td></tr>)}</tbody></table>
        : <p className="pa-vacio">Sin datos.</p>}
    </Tarjeta>
  </>);
}

// ---------- Personas ----------
async function accion(cuerpo: Record<string, unknown>) {
  const r = await fetch("/api/admin/accion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error ?? "No se pudo guardar.");
  return d as { ok: true; aviso: string | null };
}

function Personas({ d, alCambiar }: { d: Panel; alCambiar: () => void }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState({ nombre: "", email: "", motivo: "cortesia", dias: "", enviar: true });
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? d.personas.filter((p) => p.email.includes(t) || (p.nombre ?? "").toLowerCase().includes(t)) : d.personas;
  }, [q, d.personas]);

  async function agregar(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setOcupado("agregar");
    try {
      const r = await accion({ accion: "darAcceso", email: f.email, nombre: f.nombre || undefined, motivo: f.motivo, dias: f.dias ? Number(f.dias) : null, enviar: f.enviar });
      setMsg({ ok: !r.aviso, texto: r.aviso ? `Acceso dado, pero el correo no salió: ${r.aviso}` : f.enviar ? `Listo: ${f.email} tiene acceso y le enviamos un enlace para entrar.` : `Listo: ${f.email} tiene acceso. Cuando cree su cuenta con ese correo, entrará con el plan activo.` });
      setF({ nombre: "", email: "", motivo: "cortesia", dias: "", enviar: true }); alCambiar();
    } catch (err) { setMsg({ ok: false, texto: (err as Error).message }); } finally { setOcupado(null); }
  }
  async function hacer(p: Persona, tipo: "reenviar" | "quitarAcceso") {
    if (tipo === "quitarAcceso" && !window.confirm(`¿Quitar el acceso de ${p.email}?`)) return;
    setMsg(null); setOcupado(p.email + tipo);
    try {
      const r = await accion({ accion: tipo, email: p.email, nombre: p.nombre ?? undefined });
      setMsg({ ok: !r.aviso, texto: r.aviso ?? (tipo === "reenviar" ? `Enviamos un enlace de acceso a ${p.email}.` : `Quitamos el acceso de ${p.email}.`) });
      alCambiar();
    } catch (err) { setMsg({ ok: false, texto: (err as Error).message }); } finally { setOcupado(null); }
  }

  return (<>
    <Tarjeta titulo="Agregar una persona a mano" ayuda="Para regalar acceso, o si alguien pagó y no le llegó. Recibe un correo con un enlace para entrar sin contraseña (si no tiene cuenta, se crea al abrirlo).">
      <form className="pa-form" onSubmit={agregar}>
        <label>Nombre<input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} maxLength={80} placeholder="Ej.: Carolina Pérez" /></label>
        <label>Correo<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="correo@ejemplo.com" /></label>
        <label>Motivo<select value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })}>
          <option value="cortesia">Acceso de regalo (cortesía)</option><option value="compro_sin_acceso">Pagó y no le llegó el acceso</option></select></label>
        <label>Duración<select value={f.dias} onChange={(e) => setF({ ...f, dias: e.target.value })}>
          <option value="">Sin vencimiento</option><option value="7">7 días</option><option value="30">30 días</option><option value="90">3 meses</option><option value="365">1 año</option></select></label>
        <label className="pa-check"><input type="checkbox" checked={f.enviar} onChange={(e) => setF({ ...f, enviar: e.target.checked })} /> Enviarle ahora el correo de acceso</label>
        <button className="pa-boton" disabled={ocupado === "agregar"}>{ocupado === "agregar" ? "Guardando…" : "Dar acceso"}</button>
      </form>
      {msg && <p className={msg.ok ? "aviso-ok" : "error"} role="status">{msg.texto}</p>}
    </Tarjeta>

    <Tarjeta titulo={`Personas (${d.personas.length})`}>
      <input className="pa-buscar" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por correo o nombre" aria-label="Buscar persona" />
      <div className="pa-personas">
        {lista.map((p) => (
          <div className="pa-persona" key={p.email}>
            <div className="pa-p-cab">
              <b>{p.nombre || p.email}</b>
              <em className={`pa-estado ${p.estado}`}>{ESTADOS[p.estado] ?? p.estado}{p.tipoAcceso === "manual" && p.estado === "activa" ? " · a mano" : ""}{p.plan && p.plan !== "cortesia" ? ` · ${p.plan}` : ""}</em>
            </div>
            {p.nombre && <span>{p.email}</span>}
            <span>{p.tieneCuenta ? `Cuenta desde ${fecha(p.creado)} · último ingreso ${fecha(p.ultimoIngreso)}${p.confirmado ? "" : " · correo sin confirmar"}` : "Aún no crea su cuenta"}</span>
            <span>{p.perros} {p.perros === 1 ? "perro" : "perros"} · llegó por {p.origen ?? "—"} · pagó {usd(p.pagado)} · IA {usd(p.costoIa)}{p.vence ? ` · vence ${fecha(p.vence)}` : ""}{p.ultimoEnvio ? ` · último enlace ${fechaHora(p.ultimoEnvio)}` : ""}</span>
            <div className="pa-p-acc">
              <button onClick={() => hacer(p, "reenviar")} disabled={!!ocupado}>{ocupado === p.email + "reenviar" ? "Enviando…" : "Enviar enlace de acceso"}</button>
              {p.tipoAcceso === "manual" && p.estado === "activa" && <button className="suave" onClick={() => hacer(p, "quitarAcceso")} disabled={!!ocupado}>Quitar acceso</button>}
            </div>
          </div>
        ))}
        {!lista.length && <p className="pa-vacio">No hay personas con ese dato.</p>}
      </div>
      <p className="pa-nota">Los correos los envía Supabase, que en su plan gratis permite pocos por hora. Si no sale, espera unos minutos.</p>
    </Tarjeta>
  </>);
}

// ---------- Salud ----------
function Salud({ d, alCambiar, irA }: { d: Panel; alCambiar: () => void; irA: (s: Seccion) => void }) {
  const s = d.salud;
  async function resolver(id: number) { try { await accion({ accion: "resolverError", id }); alCambiar(); } catch { /* se ve al recargar */ } }
  return (<>
    <Tarjeta titulo="Avisos de Hotmart (webhook)">
      <div className="pa-mini">
        <div className={s.hottokGuardado ? "bien" : "mal"}><span>Conectado</span><b>{s.hottokGuardado ? "Sí" : "No"}</b>{!s.hottokGuardado && <button className="pa-link" onClick={() => irA("ajustes")}>Conectar →</button>}</div>
        <div><span>Último aviso</span><b>{s.ultimoAviso ? fechaHora(s.ultimoAviso.fecha) : <SinDatos />}</b><small>{s.ultimoAviso ? `${s.ultimoAviso.ok ? "✓" : "✗"} ${s.ultimoAviso.detalle}` : ""}</small></div>
        <div><span>Avisos 7 días</span><b>{s.avisos7}</b></div>
        <div className={s.fallos7 ? "mal" : ""}><span>Con error 7 días</span><b>{s.fallos7}</b></div>
      </div>
    </Tarjeta>
    <Tarjeta titulo={`Errores de la app (${s.erroresAbiertos} abiertos)`} ayuda="Fallas del Consejero, del escáner o de los avisos. Márcalos como resueltos cuando ya no pasen.">
      {s.errores.length ? s.errores.map((e) => (
        <div className={`pa-error${e.resuelto ? " resuelto" : ""}`} key={e.id}>
          <div><b>{e.origen}</b><small>{fechaHora(e.fecha)}</small></div>
          <p>{e.mensaje}</p>
          {!e.resuelto && <button className="pa-link" onClick={() => resolver(e.id)}>Marcar resuelto</button>}
        </div>
      )) : <p className="pa-vacio">✅ Sin errores registrados.</p>}
    </Tarjeta>
  </>);
}

// ---------- Ajustes ----------
function Ajustes({ d, mes, alCambiar }: { d: Panel; mes: string; alCambiar: () => void }) {
  const c = d.costos;
  const [costos, setCostos] = useState({ impuesto: String(c.impuestoPct), infra: String(c.infra), email: String(c.email) });
  const [hottok, setHottok] = useState("");
  const [gasto, setGasto] = useState({ mes, canal: "", monto: "" });
  const [msg, setMsg] = useState<{ ok: boolean; texto: string; donde: string } | null>(null);
  const urlWebhook = typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/hotmart` : "/api/webhooks/hotmart";
  const base = typeof window !== "undefined" ? window.location.origin : "";

  async function guardar(donde: string, cuerpo: Record<string, unknown>, ok: string, despues?: () => void) {
    setMsg(null);
    try { await accion(cuerpo); setMsg({ ok: true, texto: ok, donde }); despues?.(); alCambiar(); }
    catch (err) { setMsg({ ok: false, texto: (err as Error).message, donde }); }
  }
  const nota = (donde: string) => msg?.donde === donde && <p className={msg.ok ? "aviso-ok" : "error"} role="status">{msg.texto}</p>;

  return (<>
    <Tarjeta titulo="Costos fijos del negocio" ayuda="Se usan para calcular la ganancia real. Hoy Vercel y Supabase están en plan gratis (US$ 0). Pregunta a tu contador qué % de impuesto aplicar.">
      <form className="pa-form" onSubmit={(e) => { e.preventDefault(); void guardar("costos", { accion: "ajustes", impuesto: Number(costos.impuesto), infra: Number(costos.infra), email: Number(costos.email) }, "Costos guardados."); }}>
        <label>Impuestos (% de lo vendido)<input type="number" min={0} max={100} step="0.01" value={costos.impuesto} onChange={(e) => setCostos({ ...costos, impuesto: e.target.value })} /></label>
        <label>Servidores al mes (US$)<input type="number" min={0} step="0.01" value={costos.infra} onChange={(e) => setCostos({ ...costos, infra: e.target.value })} /></label>
        <label>Correos al mes (US$)<input type="number" min={0} step="0.01" value={costos.email} onChange={(e) => setCostos({ ...costos, email: e.target.value })} /></label>
        <button className="pa-boton">Guardar costos</button>
      </form>
      {nota("costos")}
    </Tarjeta>

    <Tarjeta titulo="Gasto en publicidad por canal" ayuda="Anota lo que gastaste cada mes en cada canal (Instagram, TikTok, Google…). Con esto se calcula el costo por cliente.">
      <form className="pa-form fila" onSubmit={(e) => { e.preventDefault(); void guardar("gasto", { accion: "gasto", mes: gasto.mes, canal: gasto.canal, monto: Number(gasto.monto) }, "Gasto guardado.", () => setGasto({ ...gasto, canal: "", monto: "" })); }}>
        <label>Mes<input type="month" required value={gasto.mes} onChange={(e) => setGasto({ ...gasto, mes: e.target.value })} /></label>
        <label>Canal<input required list="pa-canales" value={gasto.canal} onChange={(e) => setGasto({ ...gasto, canal: e.target.value })} placeholder="instagram" maxLength={30} /></label>
        <datalist id="pa-canales">{["instagram", "facebook", "tiktok", "google", "youtube", "afiliado", ...d.canales.map((k) => k.canal)].filter((x, i, a) => a.indexOf(x) === i).map((x) => <option key={x} value={x} />)}</datalist>
        <label>Monto (US$)<input type="number" required min={0} step="0.01" value={gasto.monto} onChange={(e) => setGasto({ ...gasto, monto: e.target.value })} /></label>
        <button className="pa-boton">Guardar</button>
      </form>
      {nota("gasto")}
      {d.gastos.length > 0 && <table className="pa-tabla"><tbody>{d.gastos.map((g) => (
        <tr key={g.id}><td>{nombreMes(g.mes)}</td><td>{g.canal}</td><td>{usd(g.monto)}</td>
          <td><button className="pa-link" onClick={() => { if (window.confirm("¿Borrar este gasto?")) void guardar("gasto", { accion: "borrarGasto", id: g.id }, "Gasto borrado."); }}>Borrar</button></td></tr>
      ))}</tbody></table>}
    </Tarjeta>

    <Tarjeta titulo="Enlaces para medir cada canal" ayuda="Usa estos enlaces en tus publicaciones y anuncios; así sabrás de dónde llega cada persona.">
      <ul className="pa-enlaces">{["instagram", "tiktok", "facebook", "youtube"].map((x) => <li key={x}><code>{base}/?origen={x}</code></li>)}</ul>
    </Tarjeta>

    <Tarjeta titulo="Conectar Hotmart" ayuda="Cuando crees el producto en Hotmart: copia su «hottok» (Herramientas → Webhooks) y pégalo aquí. Luego, en Hotmart, crea un webhook con la dirección de abajo.">
      <p className="pa-nota">Estado: <b>{d.salud.hottokGuardado ? "✓ hottok guardado" : "Sin conectar"}</b></p>
      <form className="pa-form" onSubmit={(e) => { e.preventDefault(); void guardar("hottok", { accion: "hottok", valor: hottok }, "Hottok guardado. Ya puedes probar el aviso desde Hotmart.", () => setHottok("")); }}>
        <label>Hottok de Hotmart<input type="password" autoComplete="off" value={hottok} onChange={(e) => setHottok(e.target.value)} placeholder={d.salud.hottokGuardado ? "Pegar uno nuevo para reemplazarlo" : "Pega aquí el hottok"} minLength={8} required /></label>
        <button className="pa-boton">Guardar hottok</button>
      </form>
      {nota("hottok")}
      <p className="pa-nota">Dirección del webhook para Hotmart: <code>{urlWebhook}</code></p>
    </Tarjeta>
  </>);
}
