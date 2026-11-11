import "server-only";
// Cuentas del panel de administración a partir de los números crudos de admin_panel() (base de datos).
// Regla: si un dato no existe, se devuelve null y la pantalla dice "Sin datos". Nunca se inventa.

type N = number;
interface Crudo {
  mes: string;
  generado: string;
  ventas: {
    actual: { compras: N; bruto: N; hotmart: N; afiliados: N; sinMontos: N; nuevas: N; renovaciones: N; monedas: string[] };
    anterior: { compras: N; bruto: N; hotmart: N; afiliados: N };
    bajas: { voluntarias: N; involuntarias: N; reembolsos: N; montoReembolsado: N };
    porMes: { mes: string; bruto: N; neto: N }[];
    activas: { pagadas: N; familiares: N; manuales: N; mrr: N; mrrSinMonto: N };
  };
  ia: { mes: N; hoy: N; usosMes: N; usosSinCosto: N; porFuncion: { funcion: string; usos: N; costo: N | null }[]; porUsuario: { email: string; usos: N; costo: N | null }[]; porDia: { dia: string; costo: N }[] };
  usuarios: { total: N; confirmados: N; nuevosMes: N; nuevosAnterior: N; activos7: N; activos30: N; activacion: { base: N; activados: N }; retencion: { dia: N; base: N; volvieron: N }[] };
  uso: { eventos: Record<string, N>; personasPorAccion: Record<string, N>; embudo: { paso: N; sesiones: N }[]; visitas: N; vieronPlanes: N; eligieronPlan: N; cuentas: N; desde: string | null; rutinaPorTipo: Record<string, N> };
  canales: { canal: string; usuarios: N; usuariosMes: N; clientes: N; netoTotal: N; gastoTotal: N; gastoMes: N; mesesConVentas: N }[];
  costos: { impuestoPct: N; infra: N; email: N; configurado: boolean; publicidadMes: N };
  gastos: { id: string; mes: string; canal: string; monto: N }[];
  salud: { hottokGuardado: boolean; ultimoAviso: { fecha: string; ok: boolean; evento: string; detalle: string } | null; ultimoAvisoOk: string | null; fallos7: N; avisos7: N; erroresAbiertos: N; errores24: N; errores: { id: N; origen: string; mensaje: string; fecha: string; resuelto: boolean }[] };
  personas: Persona[];
}
export interface Persona {
  email: string; nombre: string | null; tieneCuenta: boolean; creado: string | null; confirmado: boolean; ultimoIngreso: string | null;
  origen: string | null; estado: string; plan: string | null; tipoAcceso: string | null; vence: string | null; manual: string | null;
  ultimoEnvio: string | null; perros: N; pagado: N; costoIa: N;
}

export interface Aviso { nivel: "rojo" | "amarillo" | "info"; titulo: string; porque: string; queHacer: string }

const num = (x: unknown) => (typeof x === "number" ? x : Number(x ?? 0)) || 0;
const r2 = (x: number) => Math.round(x * 100) / 100;
const pct = (a: number, b: number) => (b > 0 ? a / b : null);

export function armarPanel(c: Crudo) {
  const v = c.ventas.actual, ant = c.ventas.anterior;
  const hayVentas = v.compras > 0;

  // ---------- Ganancia real del mes ----------
  const ingresos = num(v.bruto);
  const impuestos = ingresos * num(c.costos.impuestoPct) / 100;
  const lineas = [
    { clave: "hotmart", texto: "Comisión de Hotmart", monto: num(v.hotmart), sinDatos: hayVentas && v.sinMontos === v.compras },
    { clave: "afiliados", texto: "Comisión de afiliados", monto: num(v.afiliados), sinDatos: hayVentas && v.sinMontos === v.compras },
    { clave: "impuestos", texto: `Impuestos (${num(c.costos.impuestoPct)}%)`, monto: impuestos, sinDatos: !c.costos.configurado },
    { clave: "ia", texto: "Inteligencia artificial", monto: num(c.ia.mes), sinDatos: c.ia.usosMes > 0 && c.ia.usosSinCosto === c.ia.usosMes },
    { clave: "infra", texto: "Servidores (Vercel + Supabase)", monto: num(c.costos.infra), sinDatos: !c.costos.configurado },
    { clave: "email", texto: "Correos", monto: num(c.costos.email), sinDatos: !c.costos.configurado },
    { clave: "publicidad", texto: "Publicidad", monto: num(c.costos.publicidadMes), sinDatos: false },
  ].map((l) => ({ ...l, monto: r2(l.monto) }));
  const costoTotal = lineas.reduce((s, l) => s + l.monto, 0);
  const ganancia = r2(ingresos - costoTotal);
  const margen = pct(ganancia, ingresos);

  const ingresosAnt = num(ant.bruto);
  const gananciaAntAprox = ingresosAnt - num(ant.hotmart) - num(ant.afiliados) - ingresosAnt * num(c.costos.impuestoPct) / 100;

  // ---------- Bajas ----------
  const activasPagadas = num(c.ventas.activas.pagadas);
  const b = c.ventas.bajas;
  const baseChurn = activasPagadas + b.voluntarias + b.involuntarias;
  const churn = pct(b.voluntarias + b.involuntarias, baseChurn);
  const churnInvol = pct(b.involuntarias, baseChurn);

  // ---------- Canales: LTV, CAC, LTV:CAC, recuperación, ganancia ----------
  const mrrPorCliente = activasPagadas > 0 && c.ventas.activas.mrrSinMonto < activasPagadas ? num(c.ventas.activas.mrr) / activasPagadas : null;
  const canales = c.canales.map((k) => {
    const ltv = k.clientes > 0 ? num(k.netoTotal) / k.clientes : null; // lo que dejó cada cliente hasta hoy
    const cac = k.gastoTotal > 0 && k.clientes > 0 ? num(k.gastoTotal) / k.clientes : k.gastoTotal > 0 ? null : 0;
    const ratio = ltv !== null && cac ? ltv / cac : null;
    const recuperacion = cac && mrrPorCliente ? cac / mrrPorCliente : null; // meses
    return {
      ...k, ltv: ltv === null ? null : r2(ltv), cac: cac === null ? null : r2(cac), ratio: ratio === null ? null : Math.round(ratio * 10) / 10,
      recuperacionMeses: recuperacion === null ? null : Math.round(recuperacion * 10) / 10,
      ganancia: r2(num(k.netoTotal) - num(k.gastoTotal)),
      conversion: pct(k.clientes, k.usuarios),
    };
  });

  // ---------- Usuarios ----------
  const activacion = pct(c.usuarios.activacion.activados, c.usuarios.activacion.base);
  const retencion = c.usuarios.retencion.map((x) => ({ ...x, tasa: pct(x.volvieron, x.base) }));

  // ---------- Avisos al dueño (qué pasó → por qué importa → qué hacer) ----------
  const avisos: Aviso[] = [];
  const usd = (x: number) => `US$${x.toFixed(2)}`;
  if (ingresos > 0 && num(c.ia.mes) / ingresos > 0.2) {
    avisos.push({ nivel: "rojo", titulo: `La IA se está llevando el ${Math.round((num(c.ia.mes) / ingresos) * 100)}% de lo que vendes`,
      porque: `Este mes la IA costó ${usd(num(c.ia.mes))} y vendiste ${usd(ingresos)}. Sobre el 20% se come la ganancia.`,
      queHacer: "Revisa en «IA» quién la usa más. Puedes bajar el límite diario de consultas por persona." });
  }
  if (c.salud.hottokGuardado && c.salud.fallos7 > 0 && c.salud.ultimoAviso && !c.salud.ultimoAviso.ok) {
    avisos.push({ nivel: "rojo", titulo: "Hotmart no está pudiendo avisar las ventas",
      porque: `Hubo ${c.salud.fallos7} avisos con error en los últimos 7 días (último: ${c.salud.ultimoAviso.detalle}). Quien pague podría no recibir su acceso.`,
      queHacer: "Revisa que el hottok guardado en «Ajustes» sea el mismo de Hotmart. Mientras tanto, da acceso a mano en «Personas»." });
  }
  if (!c.salud.hottokGuardado) {
    avisos.push({ nivel: "info", titulo: "Hotmart todavía no está conectado",
      porque: "Sin esto, las ventas no llegan al panel ni se activan solas.",
      queHacer: "Cuando crees el producto en Hotmart, pega su hottok en «Ajustes» y configura el aviso (webhook)." });
  }
  if (b.involuntarias >= 2 && (churnInvol ?? 0) > 0.05) {
    avisos.push({ nivel: "amarillo", titulo: `${b.involuntarias} personas se fueron porque falló su pago`,
      porque: "No quisieron irse: su tarjeta fue rechazada o venció. Es plata que se puede recuperar.",
      queHacer: "Escríbeles para que actualicen su medio de pago en Hotmart." });
  }
  for (const k of canales) {
    if (k.gastoTotal > 0 && k.ganancia < 0) {
      avisos.push({ nivel: "amarillo", titulo: `El canal «${k.canal}» está perdiendo plata`,
        porque: `Llevas ${usd(k.gastoTotal)} invertidos y ese canal ha dejado ${usd(k.netoTotal)}.`,
        queHacer: k.clientes === 0 ? "Aún no trae clientes que paguen. Prueba otro anuncio o pausa ese gasto." : "Baja el gasto o mejora el anuncio hasta que cada cliente deje más de lo que cuesta conseguirlo." });
    }
  }
  if (ingresos > 0 && ganancia < 0) {
    avisos.push({ nivel: "rojo", titulo: "Este mes estás perdiendo plata",
      porque: `Vendiste ${usd(ingresos)} pero los costos suman ${usd(costoTotal)}.`,
      queHacer: "Mira en «Ganancia real» cuál costo pesa más y empieza por ese." });
  }
  if (c.salud.errores24 >= 5) {
    avisos.push({ nivel: "amarillo", titulo: `${c.salud.errores24} errores en las últimas 24 horas`,
      porque: "Algunas personas pueden estar viendo fallas en el Consejero o el escáner.",
      queHacer: "Revisa «Salud» para ver qué está fallando." });
  }
  const enOrden = !avisos.some((a) => a.nivel !== "info");

  return {
    mes: c.mes, generado: c.generado,
    resumen: { ingresos: r2(ingresos), ganancia, margen, hayVentas, ingresosAnt: r2(ingresosAnt), gananciaAntAprox: r2(gananciaAntAprox),
      mrr: r2(num(c.ventas.activas.mrr)), clientesPagando: activasPagadas, accesosManuales: c.ventas.activas.manuales },
    ganancia: { ingresos: r2(ingresos), lineas, costoTotal: r2(costoTotal), ganancia, margen, configurado: c.costos.configurado },
    ventas: { ...v, anterior: ant, bajas: b, churn, churnInvol, porMes: c.ventas.porMes, activas: c.ventas.activas },
    usuarios: { ...c.usuarios, activacionTasa: activacion, retencion },
    uso: c.uso,
    canales, mrrPorCliente,
    ia: { ...c.ia, porcentajeIngresos: pct(num(c.ia.mes), ingresos), porCliente: activasPagadas > 0 ? num(c.ia.mes) / activasPagadas : null },
    costos: c.costos, gastos: c.gastos,
    salud: c.salud,
    personas: c.personas,
    avisos, enOrden,
  };
}
export type Panel = ReturnType<typeof armarPanel>;
