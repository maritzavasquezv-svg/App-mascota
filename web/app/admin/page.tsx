"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "../flujo.css";

interface Resumen {
  totales: { cuentas: number; confirmadas: number; perros: number; usosIaHoy: number };
  planes: { activa: number; cancelada: number; reembolsada: number; vencida: number };
  usuarios: { email: string; creado: string; confirmado: boolean; ultimoIngreso: string | null; estado: string; plan: string | null }[];
}
const fecha = (s: string | null) => (s ? new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(s)) : "—");

export default function Admin() {
  const [datos, setDatos] = useState<Resumen | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/resumen").then(async (r) => {
      const d = await r.json();
      if (!r.ok) setError(r.status === 403 ? "Esta página es solo para la administración de Kopeet." : d.error ?? "No pudimos cargar el panel.");
      else setDatos(d as Resumen);
    }).catch(() => setError("No pudimos cargar el panel."));
  }, []);

  return (
    <main className="flujo">
      <div className="marco admin">
        <div className="cabeza"><Link className="atras" href="/inicio" aria-label="Volver"><ArrowLeft size={18} /></Link><img src="/marca/isotipo-kopeet-180.png" alt="" /><b>Panel de Kopeet</b></div>
        {error && <p className="error" role="alert">{error}</p>}
        {!datos && !error && <p className="sub">Cargando…</p>}
        {datos && (<div className="cuerpo entra">
          <div className="kpis">
            <div><b>{datos.totales.cuentas}</b><span>cuentas</span></div>
            <div><b>{datos.planes.activa}</b><span>planes activos</span></div>
            <div><b>{datos.totales.perros}</b><span>perros</span></div>
            <div><b>{datos.totales.usosIaHoy}</b><span>usos de IA hoy</span></div>
          </div>
          <p className="nota">Confirmadas: {datos.totales.confirmadas} · Canceladas: {datos.planes.cancelada} · Reembolsadas: {datos.planes.reembolsada} · Vencidas: {datos.planes.vencida}</p>
          <section className="tarjeta">
            <p className="tarjeta-tit"><span>Usuarios ({datos.usuarios.length})</span></p>
            <div className="tabla-usuarios">
              {datos.usuarios.map((u) => (
                <div key={u.email}>
                  <b>{u.email}</b>
                  <span>Alta {fecha(u.creado)} · Último ingreso {fecha(u.ultimoIngreso)}{u.confirmado ? "" : " · sin confirmar"}</span>
                  <em className={`estado ${u.estado.replace(" ", "-")}`}>{u.estado}{u.plan ? ` · ${u.plan}` : ""}</em>
                </div>
              ))}
            </div>
          </section>
        </div>)}
      </div>
    </main>
  );
}
