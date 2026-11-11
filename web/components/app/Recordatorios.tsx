"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Share, X } from "lucide-react";
import { activarAvisos, apagarAvisos, avisoDePrueba, estadoAvisos, sincronizarAvisos, type EstadoAvisos } from "@/lib/avisos";
import { useT } from "@/lib/i18n";

/** Conecta este celular al abrir la app, si ya dio permiso. Va en el layout de /inicio. */
export function SincronizarAvisos() {
  const { idioma } = useT();
  useEffect(() => { void sincronizarAvisos(idioma); }, [idioma]);
  return null;
}

const OCULTO_HOY = "kopeet-avisos-tarjeta-oculta";

/**
 * Tarjeta de recordatorios. `compacta` (en Hoy): solo aparece si aún no están activos y se puede cerrar.
 * Completa (en Cuenta): muestra el estado, permite apagarlos y enviar un aviso de prueba.
 */
export default function Recordatorios({ compacta = false }: { compacta?: boolean }) {
  const { t, idioma } = useT();
  const [estado, setEstado] = useState<EstadoAvisos>("cargando");
  const [ocupado, setOcupado] = useState(false);
  const [nota, setNota] = useState<string | null>(null);
  const [oculta, setOculta] = useState(() => {
    if (!compacta || typeof window === "undefined") return false;
    try { return localStorage.getItem(OCULTO_HOY) === "1"; } catch { return false; }
  });

  useEffect(() => { let vivo = true; void estadoAvisos().then((e) => { if (vivo) setEstado(e); }); return () => { vivo = false; }; }, []);

  async function hacer(f: () => Promise<EstadoAvisos | boolean>, ok?: string) {
    setOcupado(true); setNota(null);
    try {
      const r = await f();
      if (typeof r === "string") setEstado(r);
      if (ok) setNota(ok);
    } catch {
      setNota(t("No pudimos activar los avisos. Intenta de nuevo en un momento.", "We couldn't turn on reminders. Try again in a moment.", "Não conseguimos ativar os avisos. Tente de novo em instantes."));
    }
    setOcupado(false);
  }

  if (compacta && (oculta || estado === "cargando" || estado === "activo" || estado === "no-soportado" || estado === "denegado")) return null;
  if (!compacta && estado === "cargando") return null;

  return (
    <section className="tarjeta avisos-tarjeta">
      <div className="tarjeta-tit">
        <span><Bell size={15} /> {t("Recordatorios", "Reminders", "Lembretes")}</span>
        {compacta
          ? <button className="cerrar-mini" aria-label={t("Ahora no", "Not now", "Agora não")} onClick={() => { try { localStorage.setItem(OCULTO_HOY, "1"); } catch { /* nada */ } setOculta(true); }}><X size={15} /></button>
          : <b>{estado === "activo" ? t("Activados", "On", "Ativados") : t("Apagados", "Off", "Desativados")}</b>}
      </div>

      {estado === "ios-instalar" ? (
        <>
          <p className="vacio">{t("En iPhone, los avisos funcionan cuando agregas Kopeet a tu pantalla de inicio:", "On iPhone, reminders work once you add Kopeet to your home screen:", "No iPhone, os avisos funcionam quando você adiciona o Kopeet à tela de início:")}</p>
          <ol className="pasos-ios">
            <li>{t("En Safari, toca ", "In Safari, tap ", "No Safari, toque em ")}<Share size={14} aria-label="Compartir" />{t(" (Compartir).", " (Share).", " (Compartilhar).")}</li>
            <li>{t("Elige «Agregar a inicio».", "Choose “Add to Home Screen”.", "Escolha “Adicionar à Tela de Início”.")}</li>
            <li>{t("Abre Kopeet desde ese ícono y activa los avisos aquí.", "Open Kopeet from that icon and turn on reminders here.", "Abra o Kopeet por esse ícone e ative os avisos aqui.")}</li>
          </ol>
        </>
      ) : estado === "no-soportado" ? (
        <p className="vacio">{t("Este navegador no permite avisos. Prueba con Chrome en Android o instalando Kopeet en tu iPhone.", "This browser doesn't support reminders. Try Chrome on Android or installing Kopeet on your iPhone.", "Este navegador não permite avisos. Tente o Chrome no Android ou instalar o Kopeet no iPhone.")}</p>
      ) : estado === "denegado" ? (
        <p className="vacio">{t("Bloqueaste los avisos para Kopeet. Para activarlos, permítelos en la configuración del navegador (ícono del candado junto a la dirección) y vuelve aquí.", "You blocked reminders for Kopeet. To turn them on, allow them in your browser settings (padlock icon next to the address) and come back.", "Você bloqueou os avisos do Kopeet. Para ativá-los, permita nas configurações do navegador (ícone de cadeado ao lado do endereço) e volte aqui.")}</p>
      ) : (
        <>
          <p className="vacio">{estado === "activo"
            ? t("Te avisamos la hora del paseo, 3 días antes de vacunas y controles, y si estás por cortar tu racha.", "We remind you of walk time, 3 days before vaccines and checkups, and when your streak is at risk.", "Avisamos a hora do passeio, 3 dias antes de vacinas e consultas, e quando sua sequência estiver em risco.")
            : t("Activa los avisos para no olvidar el paseo ni sus vacunas. Puedes apagarlos cuando quieras.", "Turn on reminders so you never forget walks or vaccines. You can turn them off anytime.", "Ative os avisos para não esquecer o passeio nem as vacinas. Você pode desativá-los quando quiser.")}</p>
          <div className="botones-min" style={{ justifyContent: "flex-start" }}>
            {estado === "activo" ? (
              <>
                <button disabled={ocupado} onClick={() => hacer(avisoDePrueba, t("Listo: el aviso de prueba llega en unos segundos.", "Done: the test reminder arrives in a few seconds.", "Pronto: o aviso de teste chega em alguns segundos."))}><Bell size={14} /> {t("Enviar aviso de prueba", "Send a test reminder", "Enviar aviso de teste")}</button>
                <button className="suave" disabled={ocupado} onClick={() => hacer(apagarAvisos)}><BellOff size={14} /> {t("Apagar en este celular", "Turn off on this phone", "Desativar neste celular")}</button>
              </>
            ) : (
              <button disabled={ocupado} onClick={() => hacer(() => activarAvisos(idioma))}><Bell size={14} /> {ocupado ? t("Activando…", "Turning on…", "Ativando…") : t("Activar avisos", "Turn on reminders", "Ativar avisos")}</button>
            )}
          </div>
        </>
      )}
      {nota && <p className="nota" role="status">{nota}</p>}
    </section>
  );
}
