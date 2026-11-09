"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BellRing, Camera, Check, Dog, Moon, Sun } from "lucide-react";
import {
  EDADES, HORAS, ORIGENES, PREOCUPACIONES, contarRespuestas, guardar, leer, nombreDe, reducirFoto,
  type Respuestas,
} from "@/lib/onboarding";

const TOTAL = 8;

export default function Onboarding() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [r, setR] = useState<Respuestas>(() => leer());
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [cargando, setCargando] = useState(0); // paso 8: cuántos ítems del plan ya están listos
  const nombreRef = useRef<HTMLInputElement>(null);

  useEffect(() => { guardar(r); }, [r]);
  useEffect(() => { if (paso === 1) nombreRef.current?.focus(); }, [paso]);

  // Paso 8: el plan "se arma" frente a la persona y luego pasa al paywall
  useEffect(() => {
    if (paso !== TOTAL) return;
    const ts = [1, 2, 3, 4].map((n) => setTimeout(() => setCargando(n), n * 700));
    const fin = setTimeout(() => router.push("/plan"), 4 * 700 + 900);
    return () => { ts.forEach(clearTimeout); clearTimeout(fin); };
  }, [paso, router]);

  const cambiar = (parcial: Partial<Respuestas>) => setR((x) => ({ ...x, ...parcial }));
  const siguiente = () => setPaso((p) => Math.min(TOTAL, p + 1));
  const atras = () => (paso === 1 ? router.push("/") : setPaso((p) => p - 1));
  const nombre = nombreDe(r);

  async function elegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErrorFoto(null);
    if (!f.type.startsWith("image/")) { setErrorFoto("Ese archivo no es una foto. Elige una imagen JPG o PNG."); return; }
    try { cambiar({ foto: await reducirFoto(f) }); } catch (err) { setErrorFoto((err as Error).message); }
  }

  async function pedirAvisos() {
    if (!("Notification" in window)) { cambiar({ avisos: "rechazados" }); return; }
    const res = await Notification.requestPermission();
    cambiar({ avisos: res === "granted" ? "activados" : "rechazados" });
  }

  return (
    <main className="flujo">
      <div className="marco">
        <div className="barra">
          <button className="atras" onClick={atras} aria-label="Volver" disabled={paso === TOTAL}><ArrowLeft size={18} /></button>
          <div className="progreso" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={paso} aria-label="Avance"><i style={{ width: `${(paso / TOTAL) * 100}%` }} /></div>
          <span className="paso">{paso} de {TOTAL}</span>
          {paso === 1 && <button className="saltar" onClick={() => { cambiar({ nombre: "" }); siguiente(); }}>Saltar</button>}
        </div>

        <div className="cuerpo entra" key={paso}>
          {paso === 1 && (<>
            <h1>¿Cómo se llama tu perro?</h1>
            <p className="sub">Así armamos el plan con su nombre.</p>
            <input ref={nombreRef} className="campo" value={r.nombre} maxLength={24} placeholder="Ej.: Bruno" aria-label="Nombre de tu perro"
              onChange={(e) => cambiar({ nombre: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter" && r.nombre.trim()) siguiente(); }} />
            <p className="nota">¿Tienes más de un perro? Después sumas a los demás.</p>
            <button className="cta" onClick={siguiente} disabled={!r.nombre.trim()}>Seguir</button>
          </>)}

          {paso === 2 && (<>
            <h1>¿Cómo llegó <em>{nombre}</em> a tu vida?</h1>
            <p className="sub">Todos los perros merecen un buen plan.</p>
            <div className="opciones" role="radiogroup" aria-label="Cómo llegó">
              {ORIGENES.map((o) => (
                <button key={o.id} className="opt" role="radio" aria-checked={r.origen === o.id} onClick={() => cambiar({ origen: o.id })}>
                  <b>{o.texto}</b><span className="marca">{r.origen === o.id && <Check size={14} />}</span>
                </button>
              ))}
            </div>
            <div className="espacio" />
            <button className="cta" onClick={siguiente} disabled={!r.origen}>Seguir</button>
          </>)}

          {paso === 3 && (<>
            <h1>¿Qué edad tiene {nombre === "tu perro" ? "" : nombre}?</h1>
            <p className="sub">Con eso calculamos sus vacunas, su ración y cuánto ejercicio necesita.</p>
            <div className="opciones" role="radiogroup" aria-label="Edad">
              {EDADES.map((o) => (
                <button key={o.id} className="opt" role="radio" aria-checked={r.edad === o.id} onClick={() => cambiar({ edad: o.id })}>
                  <div><b>{o.texto}</b><span className="d">{o.detalle}</span></div><span className="marca">{r.edad === o.id && <Check size={14} />}</span>
                </button>
              ))}
            </div>
            <div className="espacio" />
            <button className="cta" onClick={siguiente} disabled={!r.edad}>Seguir</button>
          </>)}

          {paso === 4 && (<>
            <h1>¿Qué te preocupa hoy de {nombre}?</h1>
            <p className="sub">Elige todas las que quieras. Las ponemos primero en su plan.</p>
            <div className="chips">
              {PREOCUPACIONES.map((p) => {
                const on = r.preocupaciones.includes(p);
                return (
                  <button key={p} className="chip" aria-pressed={on}
                    onClick={() => cambiar({ preocupaciones: on ? r.preocupaciones.filter((x) => x !== p) : [...r.preocupaciones, p] })}>
                    {on && <Check size={14} />}{p}
                  </button>
                );
              })}
            </div>
            <p className="nota">{r.preocupaciones.length ? `${r.preocupaciones.length} elegida${r.preocupaciones.length > 1 ? "s" : ""}` : "Si nada te preocupa, sigue igual."}</p>
            <div className="espacio" />
            <button className="cta" onClick={siguiente}>Seguir</button>
          </>)}

          {paso === 5 && (<>
            <div className="reco">
              {r.foto ? <img className="foto-redonda" src={r.foto} alt={nombre} /> : <div className="foto-redonda"><Dog size={44} /></div>}
              <h1>No lo estás haciendo mal</h1>
              <p>Nadie te explicó qué es <b>normal</b> en las primeras semanas con un perro nuevo.</p>
              <p>Por eso Google te confunde: <b>cada página habla de otro perro</b>. Kopeet habla de <b>{nombre}</b>.</p>
            </div>
            <div className="espacio" />
            <button className="cta" onClick={siguiente}>Seguir</button>
          </>)}

          {paso === 6 && (<>
            <h1>Sácale una foto a {nombre}</h1>
            <p className="sub">Estimamos su mezcla, su edad y su tamaño de adulto.</p>
            <label className="subir">
              {r.foto ? <img src={r.foto} alt={`Foto de ${nombre}`} /> : (<><Camera size={34} />Tomar o subir una foto<small>De frente y con buena luz</small></>)}
              <input type="file" accept="image/*" capture="environment" onChange={elegirFoto} aria-label="Elegir foto" />
            </label>
            {errorFoto && <p className="error" role="alert">{errorFoto}</p>}
            {r.foto && (
              <div className="resultado">
                <b>¡Listo! Ya tenemos la foto de {nombre}</b>
                <p>Toca la foto si quieres cambiarla.</p>
                <p className="aviso-prueba">Versión de prueba: la estimación con IA (mezcla, edad y tamaño) se conecta en la etapa de servicios reales.</p>
              </div>
            )}
            <div className="espacio" />
            <button className="cta" onClick={siguiente} disabled={!r.foto}>Armar el plan de {nombre}</button>
            <button className="secundario" onClick={siguiente}>Sin foto por ahora</button>
          </>)}

          {paso === 7 && (<>
            <h1>¿A qué hora sacas a pasear a {nombre}?</h1>
            <p className="sub">Te avisamos a esa hora con lo que le toca hoy.</p>
            <div className="opciones" role="radiogroup" aria-label="Hora del paseo">
              {HORAS.map((o) => (
                <button key={o.id} className="opt" role="radio" aria-checked={r.hora === o.id} onClick={() => cambiar({ hora: o.id })}>
                  {o.id === "manana" ? <Sun size={18} /> : o.id === "noche" ? <Moon size={18} /> : null}
                  <div><b>{o.texto}</b><span className="d">{o.detalle}</span></div><span className="marca">{r.hora === o.id && <Check size={14} />}</span>
                </button>
              ))}
            </div>
            {r.avisos === "activados"
              ? <div className="permiso ok"><BellRing size={18} />Avisos activados. Te escribimos a tu hora.</div>
              : <div className="permiso"><Bell size={18} />{r.avisos === "rechazados" ? "Sin avisos por ahora. Puedes activarlos después en tu perfil." : "Activa los avisos para no olvidar sus vacunas."}</div>}
            <div className="espacio" />
            {r.avisos === "sin-respuesta"
              ? <button className="cta" disabled={!r.hora} onClick={async () => { await pedirAvisos(); siguiente(); }}>Activar avisos y seguir</button>
              : <button className="cta" disabled={!r.hora} onClick={siguiente}>Seguir</button>}
            {r.avisos === "sin-respuesta" && <button className="secundario" disabled={!r.hora} onClick={siguiente}>Ahora no</button>}
          </>)}

          {paso === 8 && (
            <div className="armando" aria-live="polite">
              <div className="anillo">
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#e1e7f1" strokeWidth="9" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#2f6bff" strokeWidth="9" strokeLinecap="round"
                    strokeDasharray={339} strokeDashoffset={339 - (339 * cargando) / 4} style={{ transition: "stroke-dashoffset .6s ease" }} />
                </svg>
                <div className="centro">{r.foto ? <img src={r.foto} alt="" /> : <Dog size={48} />}</div>
                <span className="pct">{Math.round((cargando / 4) * 100)}%</span>
              </div>
              <h1>Armando el <em>Plan de Bienvenida</em> de {nombre}</h1>
              <p className="sub">Hecho con tus <b>{contarRespuestas(r)} respuestas</b></p>
              <div className="lista">
                {["Su edad y etapa de vida", "Calendario de vacunas", "Ración de cada día", "Adaptación: 3 días · 1 semana · 1 mes"].map((t, i) => (
                  <div key={t}><span className={`ic${cargando > i ? "" : " carga"}`}>{cargando > i && <Check size={14} />}</span>{t}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
