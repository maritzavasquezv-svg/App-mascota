"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, Send, Siren } from "lucide-react";
import { usePerros } from "@/components/app/usePerros";
import type { RespuestaConsejero } from "@/lib/app-datos";
import { useT } from "@/lib/i18n";
import { registrarEvento } from "@/lib/eventos";

interface Mensaje { de: "yo" | "kopeet"; texto?: string; resp?: RespuestaConsejero; ia?: boolean; plan?: boolean }
const LUCES = { rojo: "#e53935", amarillo: "#f4b400", verde: "#22b35e" } as const;

export default function Consejero() {
  const { activo } = usePerros();
  const { t, idioma } = useT();
  const [texto, setTexto] = useState("");
  const [chat, setChat] = useState<Mensaje[]>([]);
  const [pensando, setPensando] = useState(false);
  const nombre = activo?.nombre || t("tu perro", "your dog", "seu cão");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const pregunta = texto.trim();
    if (!pregunta || pensando) return;
    setChat((c) => [...c, { de: "yo", texto: pregunta }]);
    setTexto("");
    setPensando(true);
    registrarEvento("consejero");
    try {
      const res = await fetch("/api/consejero", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pregunta, perroId: activo?.id, idioma }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "error");
      const r = d.respuesta as RespuestaConsejero;
      setChat((c) => [...c, { de: "kopeet", resp: { ...r, luz: r.luz as RespuestaConsejero["luz"] }, ia: d.fuente === "ia", plan: Boolean(d.requierePlan) }]);
    } catch {
      setChat((c) => [...c, { de: "kopeet", resp: {
        luz: "sin-clasificar", titulo: t("No pudimos responder", "We couldn't answer", "Não conseguimos responder"),
        pasos: [t("Revisa tu conexión e intenta de nuevo.", "Check your connection and try again.", "Confira sua conexão e tente de novo."), t("Si es urgente, acude a tu veterinario.", "If it's urgent, go to your vet.", "Se for urgente, procure seu veterinário.")],
      } }]);
    } finally { setPensando(false); }
  }

  return (
    <div className="cuerpo entra consejero">
      <Link href="/inicio/emergencia" className="tarjeta-sos">
        <span className="sos-ic"><Siren size={20} /></span>
        <span><b>{t("¿Es una emergencia?", "Is it an emergency?", "É uma emergência?")}</b><em>{t("Señales graves y veterinarias 24 h cerca", "Serious signs and 24/7 vets nearby", "Sinais graves e veterinárias 24 h perto")}</em></span>
        <ChevronRight size={18} />
      </Link>
      <p className="fecha-hoy" style={{ marginTop: 16 }}>{t("Consejero 24 h", "24/7 Advisor", "Conselheiro 24 h")}</p>
      <h1>{t(`¿Qué le pasa a ${nombre}?`, `What's going on with ${nombre}?`, `O que está acontecendo com ${nombre}?`)}</h1>
      <div className="leyenda-sem">
        <span><i style={{ background: LUCES.verde }} />{t("Observar", "Watch", "Observar")}</span>
        <span><i style={{ background: LUCES.amarillo }} />{t("Consultar", "See a vet", "Consultar")}</span>
        <span><i style={{ background: LUCES.rojo }} />{t("Veterinario ya", "Vet now", "Veterinário já")}</span>
      </div>
      <div className="chat" aria-live="polite">
        {chat.length === 0 && <p className="vacio">{t("Cuéntanos qué notas. Por ejemplo: “vomitó dos veces pero sigue jugando”.", "Tell us what you notice. For example: “vomited twice but is still playing”.", "Conte o que você nota. Por exemplo: “vomitou duas vezes mas continua brincando”.")}</p>}
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
              {m.resp!.luz === "rojo" && <Link className="cta rojo" href={`/inicio/emergencia?motivo=${encodeURIComponent(m.resp!.motivo ?? "")}`}><AlertTriangle size={17} /> {t("Ver qué hacer ahora", "See what to do now", "Ver o que fazer agora")}</Link>}
              {m.plan && <p className="nota"><b>{t("Con el plan", "With the plan", "Com o plano")}</b>{t(", el Consejero responde cualquier duda con IA. ", ", the Advisor answers any question with AI. ", ", o Conselheiro responde qualquer dúvida com IA. ")}<Link href="/inicio">{t("Activar mi plan", "Activate my plan", "Ativar meu plano")}</Link></p>}
              <p className="aviso-vet">{m.ia ? t("Respuesta con IA. ", "AI answer. ", "Resposta com IA. ") : ""}{t("Puede equivocarse. Es orientación, no un diagnóstico, y no reemplaza al veterinario: tú decides.", "It can be wrong. This is guidance, not a diagnosis, and it doesn't replace your vet: you decide.", "Pode errar. É orientação, não um diagnóstico, e não substitui o veterinário: você decide.")}</p>
            </div>
          ))}
        {pensando && <div className="msg ia pensando">{t("Kopeet está pensando…", "Kopeet is thinking…", "O Kopeet está pensando…")}</div>}
      </div>
      <form className="campo-chat" onSubmit={enviar}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={t("Escribe tu duda…", "Type your question…", "Escreva sua dúvida…")} aria-label={t("Tu duda", "Your question", "Sua dúvida")} maxLength={500} />
        <button type="submit" aria-label={t("Enviar", "Send", "Enviar")} disabled={!texto.trim() || pensando}><Send size={17} /></button>
      </form>
    </div>
  );
}
