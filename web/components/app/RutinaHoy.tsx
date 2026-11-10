"use client";
import Link from "next/link";
import { Check, ChevronRight, Footprints, Moon, PawPrint, Plus, ToyBrick, Undo2, UtensilsCrossed } from "lucide-react";
import { comidasDelDia, horasSueno, minutosHoy, vecesHoy, type Registro } from "@/lib/app-datos";

type Tipo = Registro["tipo"];

function Fila({ icono, titulo, detalle, listo, children, tipo, puedeDeshacer, deshacer }: { icono: React.ReactNode; titulo: string; detalle: string; listo: boolean; children: React.ReactNode; tipo: Tipo; puedeDeshacer: boolean; deshacer: (tipo: Tipo) => void }) {
return (
  <div className={`rutina-fila${listo ? " listo" : ""}`}>
    <span className="rutina-ic">{listo ? <Check size={17} /> : icono}</span>
    <div className="rutina-tx"><b>{titulo}</b><span>{detalle}</span></div>
    <div className="rutina-bt">
      {children}
      {puedeDeshacer && <button className="mini suave" onClick={() => deshacer(tipo)} aria-label={`Deshacer último registro de ${titulo}`}><Undo2 size={13} /></button>}
    </div>
  </div>
);
}

/** Todo el día a día del perro en una lista: comer, paseo, juego, orina y heces, y descanso. */
export default function RutinaHoy({ registros, edad, nombre, agregar, deshacer }: {
  registros: Registro[]; edad: string | null; nombre: string;
  agregar: (tipo: Tipo, minutos?: number) => void; deshacer: (tipo: Tipo) => void;
}) {
  const comidas = vecesHoy(registros, "comida"), metaComidas = comidasDelDia(edad);
  const paseo = minutosHoy(registros, "paseo") + minutosHoy(registros, "ejercicio");
  const juego = minutosHoy(registros, "juego");
  const necesidades = vecesHoy(registros, "bano");
  const durmio = vecesHoy(registros, "descanso") > 0;


  return (
    <section className="tarjeta">
      <p className="tarjeta-tit"><span>Su rutina de hoy</span><b>{[comidas >= metaComidas, paseo > 0, juego > 0, necesidades > 0, durmio].filter(Boolean).length} de 5</b></p>
      <div className="rutina">
        <Fila deshacer={deshacer} icono={<UtensilsCrossed size={17} />} titulo="Comer" detalle={`${comidas} de ${metaComidas} comidas`} listo={comidas >= metaComidas} tipo="comida" puedeDeshacer={comidas > 0}>
          <button className="mini" onClick={() => agregar("comida")} disabled={comidas >= 6}><Plus size={13} /> Comió</button>
        </Fila>
        <Fila deshacer={deshacer} icono={<Footprints size={17} />} titulo="Paseo" detalle={paseo ? `${paseo} min hoy` : "Aún no sale"} listo={paseo > 0} tipo="paseo" puedeDeshacer={minutosHoy(registros, "paseo") > 0}>
          <button className="mini" onClick={() => agregar("paseo", 15)}><Plus size={13} /> 15 min</button>
        </Fila>
        <Fila deshacer={deshacer} icono={<ToyBrick size={17} />} titulo="Juego" detalle={juego ? `${juego} min hoy` : "Juego o estimulación mental"} listo={juego > 0} tipo="juego" puedeDeshacer={juego > 0}>
          <button className="mini" onClick={() => agregar("juego", 10)}><Plus size={13} /> 10 min</button>
        </Fila>
        <Fila deshacer={deshacer} icono={<PawPrint size={17} />} titulo="Orina y heces" detalle={necesidades ? `${necesidades} vez${necesidades > 1 ? "es" : ""} en su lugar` : "En su lugar"} listo={necesidades > 0} tipo="bano" puedeDeshacer={necesidades > 0}>
          <button className="mini" onClick={() => agregar("bano")}><Plus size={13} /> Lo hizo</button>
        </Fila>
        <Fila deshacer={deshacer} icono={<Moon size={17} />} titulo="Dormir" detalle={durmio ? "Descansó bien" : `Necesita ${horasSueno(edad)} al día`} listo={durmio} tipo="descanso" puedeDeshacer={durmio}>
          {!durmio && <button className="mini" onClick={() => agregar("descanso")}><Check size={13} /> Durmió bien</button>}
        </Fila>
      </div>
      <Link className="enlace-raza" href="/inicio/bano" style={{ marginTop: 10 }}>Plan para enseñarle a hacer orina y heces en su lugar <ChevronRight size={14} /></Link>
      <p className="nota">Cantidades orientativas para {nombre}. Tu veterinario puede indicarte otras.</p>
    </section>
  );
}
