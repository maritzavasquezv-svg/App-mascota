"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, Send, Siren } from "lucide-react";
import { usePerros } from "@/components/app/usePerros";
import type { RespuestaConsejero } from "@/lib/app-datos";

interface Mensaje { de: "yo" | "kopeet"; texto?: string; resp?: RespuestaConsejero; ia?: boolean }
const LUCES = { rojo: "#e53935", amarillo: "#f4b400", verde: "#22b35e" } as const;

export default function Consejero() {
  const { activo } = usePerros();
  const [texto, setTexto] = useState("");
  const [chat, setChat] = useState<Mensaje[]>([]);
  const [pensando, setPensando] = useState(false);
  const nombre = activo?.nombre || "tu perro";

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const t = texto.trim();
    if (!t || pensando) return;
    setChat((c) => [...c, { de: "yo", texto: t }]);
    setTexto("");
    setPensando(true);
    try {
      const res = await fetch("/api/consejero", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pregunta: t, perroId: activo?.id }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "error");
      const r = d.respuesta as RespuestaConsejero;
      setChat((c) => [...c, { de: "kopeet", resp: { ...r, luz: r.luz as RespuestaConsejero["luz"] }, ia: d.fuente === "ia" }]);
    } catch {
      setChat((c) => [...c, { de: "kopeet", resp: { luz: "sin-clasificar", titulo: "No pudimos responder", pasos: ["Revisa tu conexión e intenta de nuevo.", "Si es urgente, acude a tu veterinario."] } }]);
    } finally { setPensando(false); }
  }

  return (
    <div className="cuerpo entra consejero">
      <Link href="/inicio/emergencia" className="tarjeta-sos">
        <span className="sos-ic"><Siren size={20} /></span>
        <span><b>¿Es una emergencia?</b><em>Señales graves y veterinarias 24 h cerca</em></span>
        <ChevronRight size={18} />
      </Link>
      <p className="fecha-hoy" style={{ marginTop: 16 }}>Consejero 24 h</p>
      <h1>¿Qué le pasa a {nombre}?</h1>
      <div className="leyenda-sem"><span><i style={{ background: LUCES.verde }} />Observar</span><span><i style={{ background: LUCES.amarillo }} />Consultar</span><span><i style={{ background: LUCES.rojo }} />Veterinario ya</span></div>
      <div className="chat" aria-live="polite">
        {chat.length === 0 && <p className="vacio">Cuéntanos qué notas. Por ejemplo: “vomitó dos veces pero sigue jugando”.</p>}
        {chat.map((m, i) => m.de === "yo"
          ? <div key={i} className="msg yo">{m.texto}</div>
          : (
            <div key={i} className="msg ia">
              {m.resp!.luz !== "sin-clasificar" && (
                <div className={`semaforo ${m.resp!.luz}`}>
                  {(["verde", "amarillo", "rojo"] as const).map((l) => <span key={l} className={`luz ${m.resp!.luz === l ? "on" : ""}`} style={{ background: LUCES[l] }} />)}
                  <b>{m.resp!.titulo}</b>
                </div>
              )}
              {m.resp!.luz === "sin-clasificar" && <b>{m.resp!.titulo}</b>}
              <ul>{m.resp!.pasos.map((p) => <li key={p}>{p}</li>)}</ul>
              {m.resp!.luz === "rojo" && <Link className="cta rojo" href={`/inicio/emergencia?motivo=${encodeURIComponent(m.resp!.motivo ?? "")}`}><AlertTriangle size={17} /> Ver qué hacer ahora</Link>}
              <p className="aviso-vet">{m.ia ? "Respuesta con IA. " : ""}Esto es orientación, no un diagnóstico. No reemplaza al veterinario.</p>
            </div>
          ))}
        {pensando && <div className="msg ia pensando">Kopeet está pensando…</div>}
      </div>
      <form className="campo-chat" onSubmit={enviar}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe tu duda…" aria-label="Tu duda" maxLength={500} />
        <button type="submit" aria-label="Enviar" disabled={!texto.trim() || pensando}><Send size={17} /></button>
      </form>
    </div>
  );
}
