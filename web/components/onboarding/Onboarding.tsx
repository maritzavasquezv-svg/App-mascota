"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BellRing, Camera, Check, Dog, Moon, Sun } from "lucide-react";
import {
  EDADES, HORAS, ORIGENES, PREOCUPACIONES, contarRespuestas, guardar, leer, nombreDe, preocupacion, reducirFoto,
  type Respuestas,
} from "@/lib/onboarding";
import { useT } from "@/lib/i18n";
import SelectorIdioma from "@/components/SelectorIdioma";
import { registrarEvento } from "@/lib/eventos";

const TOTAL = 8;

export default function Onboarding() {
  const router = useRouter();
  const { t, idioma } = useT();
  const [paso, setPaso] = useState(1);
  const [r, setR] = useState<Respuestas>(() => leer());
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [cargando, setCargando] = useState(0); // paso 8: cuántos ítems del plan ya están listos
  const nombreRef = useRef<HTMLInputElement>(null);

  useEffect(() => { guardar(r); }, [r]);
  useEffect(() => { if (paso === 1) nombreRef.current?.focus(); }, [paso]);
  useEffect(() => { registrarEvento("onboarding_paso", { paso }); }, [paso]);

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
  const nombre = nombreDe(r, idioma);
  const sinNombre = !r.nombre.trim();
  const seguir = t("Seguir", "Continue", "Continuar");

  async function elegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErrorFoto(null);
    if (!f.type.startsWith("image/")) {
      setErrorFoto(t("Ese archivo no es una foto. Elige una imagen JPG o PNG.", "That file isn't a photo. Choose a JPG or PNG image.", "Esse arquivo não é uma foto. Escolha uma imagem JPG ou PNG."));
      return;
    }
    try { cambiar({ foto: await reducirFoto(f) }); } catch (err) { setErrorFoto((err as Error).message); }
  }

  async function pedirAvisos() {
    if (!("Notification" in window)) { cambiar({ avisos: "rechazados" }); return; }
    const res = await Notification.requestPermission();
    cambiar({ avisos: res === "granted" ? "activados" : "rechazados" });
  }

  const n = r.preocupaciones.length;

  return (
    <main className="flujo">
      <div className="marco">
        <div className="barra">
          <button className="atras" onClick={atras} aria-label={t("Volver", "Back", "Voltar")} disabled={paso === TOTAL}><ArrowLeft size={18} /></button>
          <div className="progreso" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={paso} aria-label={t("Avance", "Progress", "Progresso")}><i style={{ width: `${(paso / TOTAL) * 100}%` }} /></div>
          <span className="paso">{paso} {t("de", "of", "de")} {TOTAL}</span>
          {paso === 1 && <button className="saltar" onClick={() => { cambiar({ nombre: "" }); siguiente(); }}>{t("Saltar", "Skip", "Pular")}</button>}
        </div>
        {paso === 1 && <div className="idioma-fila"><SelectorIdioma /></div>}

        <div className="cuerpo entra" key={paso}>
          {paso === 1 && (<>
            <h1>{t("¿Cómo se llama tu perro?", "What's your dog's name?", "Qual é o nome do seu cão?")}</h1>
            <p className="sub">{t("Así armamos el plan con su nombre.", "We'll build the plan with their name.", "Assim montamos o plano com o nome dele.")}</p>
            <input ref={nombreRef} className="campo" value={r.nombre} maxLength={24} placeholder={t("Ej.: Bruno", "E.g.: Max", "Ex.: Thor")} aria-label={t("Nombre de tu perro", "Your dog's name", "Nome do seu cão")}
              onChange={(e) => cambiar({ nombre: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter" && r.nombre.trim()) siguiente(); }} />
            <p className="nota">{t("¿Tienes más de un perro? Después sumas a los demás.", "Have more than one dog? You can add the others later.", "Tem mais de um cão? Depois você adiciona os outros.")}</p>
            <button className="cta" onClick={siguiente} disabled={!r.nombre.trim()}>{seguir}</button>
          </>)}

          {paso === 2 && (<>
            <h1>{t("¿Cómo llegó ", "How did ", "Como ")}<em>{nombre}</em>{t(" a tu vida?", " come into your life?", " chegou à sua vida?")}</h1>
            <p className="sub">{t("Todos los perros merecen un buen plan.", "Every dog deserves a good plan.", "Todo cão merece um bom plano.")}</p>
            <div className="opciones" role="radiogroup" aria-label={t("Cómo llegó", "How they arrived", "Como chegou")}>
              {ORIGENES.map((o) => (
                <button key={o.id} className="opt" role="radio" aria-checked={r.origen === o.id} onClick={() => cambiar({ origen: o.id })}>
                  <b>{o.texto[idioma]}</b><span className="marca">{r.origen === o.id && <Check size={14} />}</span>
                </button>
              ))}
            </div>
            <div className="espacio" />
            <button className="cta" onClick={siguiente} disabled={!r.origen}>{seguir}</button>
          </>)}

          {paso === 3 && (<>
            <h1>{sinNombre
              ? t("¿Qué edad tiene?", "How old is your dog?", "Qual é a idade dele?")
              : t(`¿Qué edad tiene ${nombre}?`, `How old is ${nombre}?`, `Qual é a idade de ${nombre}?`)}</h1>
            <p className="sub">{t("Con eso calculamos sus vacunas, su ración y cuánto ejercicio necesita.", "That's how we work out vaccines, daily food and how much exercise they need.", "Com isso calculamos as vacinas, a ração e quanto exercício ele precisa.")}</p>
            <div className="opciones" role="radiogroup" aria-label={t("Edad", "Age", "Idade")}>
              {EDADES.map((o) => (
                <button key={o.id} className="opt" role="radio" aria-checked={r.edad === o.id} onClick={() => cambiar({ edad: o.id })}>
                  <div><b>{o.texto[idioma]}</b><span className="d">{o.detalle[idioma]}</span></div><span className="marca">{r.edad === o.id && <Check size={14} />}</span>
                </button>
              ))}
            </div>
            <div className="espacio" />
            <button className="cta" onClick={siguiente} disabled={!r.edad}>{seguir}</button>
          </>)}

          {paso === 4 && (<>
            <h1>{t(`¿Qué te preocupa hoy de ${nombre}?`, `What worries you about ${nombre} today?`, `O que te preocupa hoje em ${nombre}?`)}</h1>
            <p className="sub">{t("Elige todas las que quieras. Las ponemos primero en su plan.", "Pick as many as you like. We'll put them first in the plan.", "Escolha quantas quiser. Colocamos primeiro no plano.")}</p>
            <div className="chips">
              {PREOCUPACIONES.map((p) => {
                const on = r.preocupaciones.includes(p);
                return (
                  <button key={p} className="chip" aria-pressed={on}
                    onClick={() => cambiar({ preocupaciones: on ? r.preocupaciones.filter((x) => x !== p) : [...r.preocupaciones, p] })}>
                    {on && <Check size={14} />}{preocupacion(p, idioma)}
                  </button>
                );
              })}
            </div>
            <p className="nota">{n
              ? t(`${n} elegida${n > 1 ? "s" : ""}`, `${n} selected`, `${n} escolhida${n > 1 ? "s" : ""}`)
              : t("Si nada te preocupa, sigue igual.", "If nothing worries you, just continue.", "Se nada te preocupa, continue assim mesmo.")}</p>
            <div className="espacio" />
            <button className="cta" onClick={siguiente}>{seguir}</button>
          </>)}

          {paso === 5 && (<>
            <div className="reco">
              {r.foto ? <img className="foto-redonda" src={r.foto} alt={nombre} /> : <div className="foto-redonda"><Dog size={44} /></div>}
              <h1>{t("No lo estás haciendo mal", "You're not doing it wrong", "Você não está fazendo errado")}</h1>
              <p>{t("Nadie te explicó qué es ", "Nobody explained what's ", "Ninguém te explicou o que é ")}<b>{t("normal", "normal", "normal")}</b>{t(" en las primeras semanas con un perro nuevo.", " in the first weeks with a new dog.", " nas primeiras semanas com um cão novo.")}</p>
              <p>{t("Por eso Google te confunde: ", "That's why Google confuses you: ", "Por isso o Google te confunde: ")}<b>{t("cada página habla de otro perro", "every page talks about a different dog", "cada página fala de outro cão")}</b>{t(". Kopeet habla de ", ". Kopeet talks about ", ". O Kopeet fala de ")}<b>{nombre}</b>.</p>
            </div>
            <div className="espacio" />
            <button className="cta" onClick={siguiente}>{seguir}</button>
          </>)}

          {paso === 6 && (<>
            <h1>{t(`Sácale una foto a ${nombre}`, `Take a photo of ${nombre}`, `Tire uma foto de ${nombre}`)}</h1>
            <p className="sub">{t("Estimamos su mezcla, su edad y su tamaño de adulto.", "We estimate their mix, age and adult size.", "Estimamos a mistura, a idade e o tamanho adulto.")}</p>
            <label className="subir">
              {r.foto
                ? <img src={r.foto} alt={t(`Foto de ${nombre}`, `Photo of ${nombre}`, `Foto de ${nombre}`)} />
                : (<><Camera size={34} />{t("Tomar o subir una foto", "Take or upload a photo", "Tirar ou enviar uma foto")}<small>{t("De frente y con buena luz", "Facing the camera, in good light", "De frente e com boa luz")}</small></>)}
              <input type="file" accept="image/*" capture="environment" onChange={elegirFoto} aria-label={t("Elegir foto", "Choose photo", "Escolher foto")} />
            </label>
            {errorFoto && <p className="error" role="alert">{errorFoto}</p>}
            {r.foto && (
              <div className="resultado">
                <b>{t(`¡Listo! Ya tenemos la foto de ${nombre}`, `Done! We have ${nombre}'s photo`, `Pronto! Já temos a foto de ${nombre}`)}</b>
                <p>{t("Toca la foto si quieres cambiarla.", "Tap the photo to change it.", "Toque na foto se quiser trocá-la.")}</p>
                <p className="aviso-prueba">{t("La estimación con IA (mezcla, edad y tamaño) aparece en su plan cuando crees tu cuenta.", "The AI estimate (mix, age and size) appears in the plan once you create your account.", "A estimativa com IA (mistura, idade e tamanho) aparece no plano quando você criar sua conta.")}</p>
              </div>
            )}
            <div className="espacio" />
            <button className="cta" onClick={siguiente} disabled={!r.foto}>{t(`Armar el plan de ${nombre}`, `Build ${nombre}'s plan`, `Montar o plano de ${nombre}`)}</button>
            <button className="secundario" onClick={siguiente}>{t("Sin foto por ahora", "No photo for now", "Sem foto por enquanto")}</button>
          </>)}

          {paso === 7 && (<>
            <h1>{t(`¿A qué hora sacas a pasear a ${nombre}?`, `What time do you walk ${nombre}?`, `Que horas você leva ${nombre} para passear?`)}</h1>
            <p className="sub">{t("Te avisamos a esa hora con lo que le toca hoy.", "We'll remind you at that time with what's due today.", "Avisamos nesse horário com o que ele precisa hoje.")}</p>
            <div className="opciones" role="radiogroup" aria-label={t("Hora del paseo", "Walk time", "Hora do passeio")}>
              {HORAS.map((o) => (
                <button key={o.id} className="opt" role="radio" aria-checked={r.hora === o.id} onClick={() => cambiar({ hora: o.id })}>
                  {o.id === "manana" ? <Sun size={18} /> : o.id === "noche" ? <Moon size={18} /> : null}
                  <div><b>{o.texto[idioma]}</b><span className="d">{o.detalle[idioma]}</span></div><span className="marca">{r.hora === o.id && <Check size={14} />}</span>
                </button>
              ))}
            </div>
            {r.avisos === "activados"
              ? <div className="permiso ok"><BellRing size={18} />{t("Avisos activados. Te escribimos a tu hora.", "Reminders on. We'll message you at your time.", "Avisos ativados. Escrevemos no seu horário.")}</div>
              : <div className="permiso"><Bell size={18} />{r.avisos === "rechazados"
                ? t("Sin avisos por ahora. Puedes activarlos después en tu perfil.", "No reminders for now. You can turn them on later in your profile.", "Sem avisos por enquanto. Você pode ativá-los depois no seu perfil.")
                : t("Activa los avisos para no olvidar sus vacunas.", "Turn on reminders so you never forget a vaccine.", "Ative os avisos para não esquecer as vacinas.")}</div>}
            <div className="espacio" />
            {r.avisos === "sin-respuesta"
              ? <button className="cta" disabled={!r.hora} onClick={async () => { await pedirAvisos(); siguiente(); }}>{t("Activar avisos y seguir", "Turn on reminders and continue", "Ativar avisos e continuar")}</button>
              : <button className="cta" disabled={!r.hora} onClick={siguiente}>{seguir}</button>}
            {r.avisos === "sin-respuesta" && <button className="secundario" disabled={!r.hora} onClick={siguiente}>{t("Ahora no", "Not now", "Agora não")}</button>}
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
              <h1>{t("Armando el ", "Building ", "Montando o ")}<em>{t("Plan de Bienvenida", "Welcome Plan", "Plano de Boas-vindas")}</em>{t(` de ${nombre}`, ` for ${nombre}`, ` de ${nombre}`)}</h1>
              <p className="sub">{t("Hecho con tus ", "Made with your ", "Feito com suas ")}<b>{contarRespuestas(r)} {t("respuestas", "answers", "respostas")}</b></p>
              <div className="lista">
                {[
                  t("Su edad y etapa de vida", "Age and life stage", "Idade e fase da vida"),
                  t("Calendario de vacunas", "Vaccine calendar", "Calendário de vacinas"),
                  t("Ración de cada día", "Daily food portion", "Ração de cada dia"),
                  t("Adaptación: 3 días · 1 semana · 1 mes", "Settling in: 3 days · 1 week · 1 month", "Adaptação: 3 dias · 1 semana · 1 mês"),
                ].map((txt, i) => (
                  <div key={i}><span className={`ic${cargando > i ? "" : " carga"}`}>{cargando > i && <Check size={14} />}</span>{txt}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
