"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, MapPin, Phone } from "lucide-react";
import { mapa } from "@/lib/app-datos";
import { IDIOMAS, useT, type Txt } from "@/lib/i18n";
import { EventoAlAbrir } from "@/components/Analitica";

// El motivo llega desde el Consejero en el idioma de la persona; se busca en los tres.
const CONSEJOS: { motivo: Txt; consejo: Txt }[] = [
  { motivo: { es: "Se tragó algo o se está ahogando", en: "Swallowed something or is choking", pt: "Engoliu algo ou está engasgado" },
    consejo: { es: "No le des de comer ni intentes sacarlo con la mano si no lo ves fácil.", en: "Don't feed it, and don't try to pull the object out by hand unless it's easy to see.", pt: "Não dê comida nem tente tirar com a mão se não estiver fácil de ver." } },
  { motivo: { es: "Posible intoxicación", en: "Possible poisoning", pt: "Possível intoxicação" },
    consejo: { es: "Si sabes qué comió, lleva el envase o una foto. No le provoques el vómito sin indicación del veterinario.", en: "If you know what it ate, bring the package or a photo. Don't induce vomiting unless a vet tells you to.", pt: "Se souber o que comeu, leve a embalagem ou uma foto. Não provoque o vômito sem orientação do veterinário." } },
  { motivo: { es: "Sangrado", en: "Bleeding", pt: "Sangramento" },
    consejo: { es: "Presiona la herida con un paño limpio mientras vas en camino.", en: "Press a clean cloth on the wound while you're on the way.", pt: "Pressione o ferimento com um pano limpo enquanto vai a caminho." } },
  { motivo: { es: "Golpe o accidente", en: "Injury or accident", pt: "Pancada ou acidente" },
    consejo: { es: "Muévelo lo menos posible y sostenlo sobre una manta firme.", en: "Move it as little as possible and carry it on a firm blanket.", pt: "Mova o mínimo possível e carregue sobre uma manta firme." } },
];

const SENALES: Txt[] = [
  { es: "Se tragó un objeto o está atorado", en: "Swallowed an object or something is stuck", pt: "Engoliu um objeto ou está engasgado" },
  { es: "Le cuesta respirar o tiene las encías moradas", en: "Struggling to breathe or has purple gums", pt: "Dificuldade para respirar ou gengivas roxas" },
  { es: "Convulsiones o no reacciona", en: "Seizures or not responding", pt: "Convulsões ou não reage" },
  { es: "Comió chocolate, uvas, cebolla, xilitol, raticida o medicamentos", en: "Ate chocolate, grapes, onion, xylitol, rat poison or medicine", pt: "Comeu chocolate, uva, cebola, xilitol, raticida ou remédios" },
  { es: "Sangrado que no para", en: "Bleeding that won't stop", pt: "Sangramento que não para" },
  { es: "Golpe fuerte, caída o atropello", en: "Hard blow, fall or hit by a car", pt: "Pancada forte, queda ou atropelamento" },
  { es: "Panza hinchada y dura, con arcadas sin vomitar", en: "Hard, swollen belly with retching but no vomit", pt: "Barriga inchada e dura, com ânsia sem vomitar" },
  { es: "Vómitos o diarrea con sangre", en: "Vomit or diarrhea with blood", pt: "Vômito ou diarreia com sangue" },
];

export default function Emergencia() {
  const { t, idioma } = useT();
  const motivo = useSearchParams().get("motivo") ?? "";
  const consejo = CONSEJOS.find((c) => IDIOMAS.some((i) => c.motivo[i] === motivo))?.consejo[idioma];
  return (
    <div className="cuerpo entra">
      <EventoAlAbrir nombre="emergencia_abierta" />
      <div className="emer">
        <div className="emer-icono"><AlertTriangle size={34} /></div>
        <p className="emer-et">{t("Emergencia", "Emergency", "Emergência")}</p>
        <h1>{motivo ? t("Llévalo al veterinario ahora", "Take your dog to the vet now", "Leve ao veterinário agora") : t("¿Es una emergencia?", "Is it an emergency?", "É uma emergência?")}</h1>
        {motivo
          ? <p className="emer-sub"><b>{motivo}.</b> {consejo ?? t("Mantén la calma y sal de inmediato.", "Stay calm and leave right away.", "Mantenha a calma e saia imediatamente.")}</p>
          : <p className="emer-sub">{t("Si ves cualquiera de estas señales, ", "If you see any of these signs, ", "Se você vir qualquer um destes sinais, ")}<b>{t("ve al veterinario de inmediato", "go to the vet right away", "vá ao veterinário imediatamente")}</b>{t(". No esperes.", ". Don't wait.", ". Não espere.")}</p>}
      </div>
      <a className="cta rojo" href={mapa(t("veterinaria 24 horas cerca de mí", "24 hour emergency vet near me", "veterinária 24 horas perto de mim"))} target="_blank" rel="noopener noreferrer"><MapPin size={18} /> {t("Buscar veterinaria 24 h cerca", "Find a 24-hour vet nearby", "Buscar veterinária 24 h perto")}</a>
      <p className="nota" style={{ textAlign: "center" }}>{t("Se abre en Google Maps con las veterinarias más cercanas. Desde ahí puedes llamar.", "Opens Google Maps with the nearest vets. You can call from there.", "Abre o Google Maps com as veterinárias mais próximas. De lá você pode ligar.")}</p>
      {!motivo && (
        <section className="tarjeta">
          <p className="tarjeta-tit"><span><Phone size={15} /> {t("Señales de emergencia", "Emergency signs", "Sinais de emergência")}</span></p>
          <ul className="senales">{SENALES.map((s) => <li key={s.es}>{s[idioma]}</li>)}</ul>
        </section>
      )}
      <Link className="secundario" href="/inicio/consejero">{t("¿No es tan grave? Pregúntale al Consejero", "Not that serious? Ask the Advisor", "Não é tão grave? Pergunte ao Conselheiro")}</Link>
    </div>
  );
}
