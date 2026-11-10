"use client";
import Link from "next/link";
import { Check, ChevronRight, Footprints, Moon, PawPrint, Plus, ToyBrick, Undo2, UtensilsCrossed } from "lucide-react";
import { comidasDelDia, horasSueno, minutosHoy, vecesHoy, type Registro } from "@/lib/app-datos";
import { useT } from "@/lib/i18n";

type Tipo = Registro["tipo"];

function Fila({ icono, titulo, detalle, listo, children, tipo, puedeDeshacer, deshacer, etiquetaDeshacer }: { icono: React.ReactNode; titulo: string; detalle: string; listo: boolean; children: React.ReactNode; tipo: Tipo; puedeDeshacer: boolean; deshacer: (tipo: Tipo) => void; etiquetaDeshacer: string }) {
  return (
    <div className={`rutina-fila${listo ? " listo" : ""}`}>
      <span className="rutina-ic">{listo ? <Check size={17} /> : icono}</span>
      <div className="rutina-tx"><b>{titulo}</b><span>{detalle}</span></div>
      <div className="rutina-bt">
        {children}
        {puedeDeshacer && <button className="mini suave" onClick={() => deshacer(tipo)} aria-label={etiquetaDeshacer}><Undo2 size={13} /></button>}
      </div>
    </div>
  );
}

/** Todo el día a día del perro en una lista: comer, paseo, juego, orina y heces, y descanso. */
export default function RutinaHoy({ registros, edad, nombre, agregar, deshacer }: {
  registros: Registro[]; edad: string | null; nombre: string;
  agregar: (tipo: Tipo, minutos?: number) => void; deshacer: (tipo: Tipo) => void;
}) {
  const { t, idioma } = useT();
  const comidas = vecesHoy(registros, "comida"), metaComidas = comidasDelDia(edad);
  const paseo = minutosHoy(registros, "paseo") + minutosHoy(registros, "ejercicio");
  const juego = minutosHoy(registros, "juego");
  const necesidades = vecesHoy(registros, "bano");
  const durmio = vecesHoy(registros, "descanso") > 0;
  const undo = (titulo: string) => t(`Deshacer último registro de ${titulo}`, `Undo last ${titulo} entry`, `Desfazer último registro de ${titulo}`);
  const hoyMin = (m: number) => t(`${m} min hoy`, `${m} min today`, `${m} min hoje`);

  const tComer = t("Comer", "Eat", "Comer");
  const tPaseo = t("Paseo", "Walk", "Passeio");
  const tJuego = t("Juego", "Play", "Brincadeira");
  const tNec = t("Orina y heces", "Urine and feces", "Xixi e cocô");
  const tDormir = t("Dormir", "Sleep", "Dormir");

  return (
    <section className="tarjeta">
      <p className="tarjeta-tit"><span>{t("Su rutina de hoy", "Today's routine", "Rotina de hoje")}</span><b>{[comidas >= metaComidas, paseo > 0, juego > 0, necesidades > 0, durmio].filter(Boolean).length} {t("de", "of", "de")} 5</b></p>
      <div className="rutina">
        <Fila deshacer={deshacer} etiquetaDeshacer={undo(tComer)} icono={<UtensilsCrossed size={17} />} titulo={tComer} detalle={t(`${comidas} de ${metaComidas} comidas`, `${comidas} of ${metaComidas} meals`, `${comidas} de ${metaComidas} refeições`)} listo={comidas >= metaComidas} tipo="comida" puedeDeshacer={comidas > 0}>
          <button className="mini" onClick={() => agregar("comida")} disabled={comidas >= 6}><Plus size={13} /> {t("Comió", "Ate", "Comeu")}</button>
        </Fila>
        <Fila deshacer={deshacer} etiquetaDeshacer={undo(tPaseo)} icono={<Footprints size={17} />} titulo={tPaseo} detalle={paseo ? hoyMin(paseo) : t("Aún no sale", "Not out yet", "Ainda não saiu")} listo={paseo > 0} tipo="paseo" puedeDeshacer={minutosHoy(registros, "paseo") > 0}>
          <button className="mini" onClick={() => agregar("paseo", 15)}><Plus size={13} /> 15 min</button>
        </Fila>
        <Fila deshacer={deshacer} etiquetaDeshacer={undo(tJuego)} icono={<ToyBrick size={17} />} titulo={tJuego} detalle={juego ? hoyMin(juego) : t("Juego o estimulación mental", "Play or mental stimulation", "Brincadeira ou estímulo mental")} listo={juego > 0} tipo="juego" puedeDeshacer={juego > 0}>
          <button className="mini" onClick={() => agregar("juego", 10)}><Plus size={13} /> 10 min</button>
        </Fila>
        <Fila deshacer={deshacer} etiquetaDeshacer={undo(tNec)} icono={<PawPrint size={17} />} titulo={tNec}
          detalle={necesidades
            ? t(`${necesidades} vez${necesidades > 1 ? "es" : ""} en su lugar`, `${necesidades} time${necesidades > 1 ? "s" : ""} in the right spot`, `${necesidades} vez${necesidades > 1 ? "es" : ""} no lugar certo`)
            : t("En su lugar", "In the right spot", "No lugar certo")}
          listo={necesidades > 0} tipo="bano" puedeDeshacer={necesidades > 0}>
          <button className="mini" onClick={() => agregar("bano")}><Plus size={13} /> {t("Lo hizo", "Done", "Fez")}</button>
        </Fila>
        <Fila deshacer={deshacer} etiquetaDeshacer={undo(tDormir)} icono={<Moon size={17} />} titulo={tDormir}
          detalle={durmio ? t("Descansó bien", "Rested well", "Descansou bem") : t(`Necesita ${horasSueno(edad, idioma)} al día`, `Needs ${horasSueno(edad, idioma)} a day`, `Precisa de ${horasSueno(edad, idioma)} por dia`)}
          listo={durmio} tipo="descanso" puedeDeshacer={durmio}>
          {!durmio && <button className="mini" onClick={() => agregar("descanso")}><Check size={13} /> {t("Durmió bien", "Slept well", "Dormiu bem")}</button>}
        </Fila>
      </div>
      <Link className="enlace-raza" href="/inicio/bano" style={{ marginTop: 10 }}>{t("Plan para enseñarle a hacer orina y heces en su lugar", "Plan to teach them where to urinate and defecate", "Plano para ensinar a fazer xixi e cocô no lugar certo")} <ChevronRight size={14} /></Link>
      <p className="nota">{t(`Cantidades orientativas para ${nombre}. Tu veterinario puede indicarte otras.`, `Guideline amounts for ${nombre}. Your vet may recommend others.`, `Quantidades de referência para ${nombre}. Seu veterinário pode indicar outras.`)}</p>
    </section>
  );
}
