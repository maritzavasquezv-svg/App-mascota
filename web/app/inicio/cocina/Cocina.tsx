"use client";
import { useMemo, useState } from "react";
import { useHoy } from "@/lib/cocina/useHoy";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ChefHat, Pencil, Pill, ShoppingCart } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { usePerros } from "@/components/app/usePerros";
import SelectorPerros from "@/components/app/SelectorPerros";
import AvisoPlan, { usePlan } from "@/components/app/AvisoPlan";
import { useT, type Txt } from "@/lib/i18n";
import { INGREDIENTES, type Alergeno, type Receta } from "@/lib/cocina/datos";
import {
  ALERGENOS, caloriasDia, comidasDia, etapa, listaCompras, pesoAdultoEstimado, medidaCasera, planDelMes, porcionDia, puedeTenerPlan, suplementoDia, tanda,
  type Actividad, type Contextura, type DatosCocina,
} from "@/lib/cocina/motor";
import type { Perro } from "@/lib/app-datos";

const ACTIVIDAD: { id: Actividad; t: Txt }[] = [
  { id: "baja", t: { es: "Poca (menos de 1 h al día)", en: "Low (under 1 h a day)", pt: "Pouca (menos de 1 h por dia)" } },
  { id: "moderada", t: { es: "Moderada (1 a 3 h)", en: "Moderate (1 to 3 h)", pt: "Moderada (1 a 3 h)" } },
  { id: "alta", t: { es: "Alta (1 a 3 h corriendo o jugando fuerte)", en: "High (1 to 3 h running or intense play)", pt: "Alta (1 a 3 h correndo ou brincando forte)" } },
  { id: "muy_alta", t: { es: "Muy alta (perro de trabajo, 3 a 6 h)", en: "Very high (working dog, 3 to 6 h)", pt: "Muito alta (cão de trabalho, 3 a 6 h)" } },
];
const CONTEXTURA: { id: Contextura; t: Txt }[] = [
  { id: "delgado", t: { es: "Delgado (se le notan las costillas)", en: "Thin (ribs visible)", pt: "Magro (costelas aparentes)" } },
  { id: "ideal", t: { es: "Ideal (se sienten las costillas, con cintura)", en: "Ideal (ribs can be felt, has a waist)", pt: "Ideal (sente as costelas, tem cintura)" } },
  { id: "sobrepeso", t: { es: "Con kilos de más", en: "Overweight", pt: "Acima do peso" } },
];
const ALERG_TXT: Record<Alergeno, Txt> = {
  pollo: { es: "Pollo", en: "Chicken", pt: "Frango" }, pavo: { es: "Pavo", en: "Turkey", pt: "Peru" }, vacuno: { es: "Vacuno", en: "Beef", pt: "Carne bovina" },
  cerdo: { es: "Cerdo", en: "Pork", pt: "Porco" }, cordero: { es: "Cordero", en: "Lamb", pt: "Cordeiro" }, pescado: { es: "Pescado", en: "Fish", pt: "Peixe" },
  huevo: { es: "Huevo", en: "Egg", pt: "Ovo" }, cereales: { es: "Cereales (arroz, avena)", en: "Grains (rice, oats)", pt: "Cereais (arroz, aveia)" },
  legumbres: { es: "Legumbres (lentejas)", en: "Legumes (lentils)", pt: "Leguminosas (lentilhas)" },
};
const UNIDAD: Record<string, Txt> = {
  taza: { es: "taza", en: "cup", pt: "xícara" }, unidad: { es: "unid.", en: "pcs", pt: "unid." }, cda: { es: "cda", en: "tbsp", pt: "colher de sopa" },
  cdta: { es: "cdta", en: "tsp", pt: "colher de chá" }, lata: { es: "lata", en: "can", pt: "lata" },
};
const PASILLO: Record<string, Txt> = {
  carnes: { es: "Carnicería y pescadería", en: "Meat and fish", pt: "Açougue e peixaria" }, verduras: { es: "Verdulería", en: "Produce", pt: "Hortifrúti" },
  almacen: { es: "Almacén", en: "Pantry", pt: "Mercearia" }, farmacia: { es: "Farmacia o tienda de mascotas", en: "Pharmacy or pet store", pt: "Farmácia ou pet shop" },
};
const DIAS: Txt[] = [
  { es: "Lunes", en: "Monday", pt: "Segunda" }, { es: "Martes", en: "Tuesday", pt: "Terça" }, { es: "Miércoles", en: "Wednesday", pt: "Quarta" },
  { es: "Jueves", en: "Thursday", pt: "Quinta" }, { es: "Viernes", en: "Friday", pt: "Sexta" }, { es: "Sábado", en: "Saturday", pt: "Sábado" }, { es: "Domingo", en: "Sunday", pt: "Domingo" },
];
// Dibujo de cada ingrediente y color de cada receta (según su proteína principal).
const EMOJI: Record<string, string> = {
  pollo_trutro: "🍗", higado_pollo: "🍗", pavo_molido: "🦃", vacuno_molido: "🥩", higado_vacuno: "🥩", corazon_vacuno: "🥩", cerdo_lomo: "🥓", cordero: "🍖",
  pescado_blanco: "🐟", salmon: "🐟", sardina: "🐟", huevo: "🥚", arroz_blanco: "🍚", arroz_integral: "🍚", avena: "🌾", papa: "🥔", camote: "🍠",
  zanahoria: "🥕", zapallo: "🎃", zapallo_italiano: "🥒", porotos_verdes: "🌱", espinaca: "🥬", lentejas: "🥣", arvejas: "🌱",
  aceite_canola: "💧", sal: "🧂", carbonato_calcio: "🥄", fosfato_dicalcico: "🥄",
};
const PROTEINA: { re: RegExp; color: string; fondo: string }[] = [
  { re: /pollo/, color: "#d97706", fondo: "#fff4e0" }, { re: /pavo/, color: "#c2410c", fondo: "#ffede3" },
  { re: /vacuno/, color: "#b91c1c", fondo: "#ffe9e9" }, { re: /cerdo/, color: "#be185d", fondo: "#ffe8f2" },
  { re: /cordero/, color: "#7c3aed", fondo: "#f1eaff" }, { re: /pescado|salmon/, color: "#0369a1", fondo: "#e3f3ff" },
];
const estilo = (r: Receta) => PROTEINA.find((p) => p.re.test(r.id)) ?? PROTEINA[0];
const emojisReceta = (r: Receta) => [...new Set(Object.keys(r.gramos).map((k) => EMOJI[k]).filter((e) => e && e !== "🥄" && e !== "🧂" && e !== "💧"))].slice(0, 5);
const COLOR_COMIDA = ["#f59e0b", "#16a34a", "#8b5cf6", "#2f6bff"];

const PROHIBIDOS: Txt = {
  es: "Nunca le des: chocolate, uvas o pasas, cebolla, ajo, palta, xilitol (endulzante), alcohol, café, nueces de macadamia, huesos cocidos ni masa cruda.",
  en: "Never give: chocolate, grapes or raisins, onion, garlic, avocado, xylitol (sweetener), alcohol, coffee, macadamia nuts, cooked bones or raw dough.",
  pt: "Nunca dê: chocolate, uvas ou passas, cebola, alho, abacate, xilitol (adoçante), álcool, café, nozes de macadâmia, ossos cozidos nem massa crua.",
};

function pasos(r: Receta): Txt[] {
  const tiene = (...ids: string[]) => ids.some((i) => r.gramos[i]);
  const p: Txt[] = [{ es: "Pesa todo en crudo con una balanza de cocina (gramera). El arroz y las lentejas se pesan ya cocidos.", en: "Weigh everything raw on a kitchen scale. Rice and lentils are weighed already cooked.", pt: "Pese tudo cru numa balança de cozinha. Arroz e lentilhas são pesados já cozidos." },
    { es: "Cocina la carne y el hígado hervidos o al vapor, sin sal ni condimentos, hasta que estén bien cocidos. Desmenuza y saca huesos o espinas.", en: "Boil or steam the meat and liver, without salt or seasoning, until fully cooked. Shred and remove any bones.", pt: "Cozinhe a carne e o fígado em água ou no vapor, sem sal nem temperos, até ficarem bem cozidos. Desfie e retire ossos ou espinhas." }];
  if (tiene("huevo")) p.push({ es: "Cocina los huevos (nunca crudos) y pícalos.", en: "Cook the eggs (never raw) and chop them.", pt: "Cozinhe os ovos (nunca crus) e pique." });
  if (tiene("arroz_blanco", "arroz_integral", "avena", "papa", "camote", "lentejas")) p.push({ es: "Cocina el arroz, la avena, la papa, el camote o las lentejas hasta que estén blandos. La papa y el camote siempre cocidos, nunca crudos.", en: "Cook the rice, oats, potato, sweet potato or lentils until soft. Potato and sweet potato always cooked, never raw.", pt: "Cozinhe o arroz, a aveia, a batata, a batata-doce ou as lentilhas até ficarem macios. Batata e batata-doce sempre cozidas, nunca cruas." });
  p.push({ es: "Cuece las verduras al vapor y pícalas fino o tritúralas: así las digiere mejor.", en: "Steam the vegetables and chop finely or blend them so they're easier to digest.", pt: "Cozinhe os legumes no vapor e pique fino ou triture: assim digere melhor." },
    { es: "Deja entibiar, mezcla todo y agrega al final el aceite, la sal y el calcio en polvo (carbonato o fosfato dicálcico, según la receta). Revuelve bien para repartirlos.", en: "Let it cool, mix everything and add the oil, salt and calcium powder (carbonate or dicalcium phosphate, as the recipe says) at the end. Stir well.", pt: "Deixe amornar, misture tudo e acrescente no fim o óleo, o sal e o cálcio em pó (carbonato ou fosfato bicálcico, conforme a receita). Mexa bem." },
    { es: "Divide en porciones de un día: 3 días al refrigerador y el resto al congelador. Descongela en el refrigerador, nunca a temperatura ambiente.", en: "Split into one-day portions: 3 days in the fridge, the rest in the freezer. Thaw in the fridge, never at room temperature.", pt: "Divida em porções de um dia: 3 dias na geladeira e o resto no freezer. Descongele na geladeira, nunca em temperatura ambiente." });
  return p;
}

const VACIO: DatosCocina = { peso_kg: 0, actividad: "moderada", castrado: false, contextura: "ideal", alergias: [], enfermedad: false };

function Formulario({ perro, alGuardar, alCancelar }: { perro: Perro; alGuardar: () => void; alCancelar?: () => void }) {
  const { t, idioma } = useT();
  const [d, setD] = useState<DatosCocina>(perro.cocina ?? VACIO);
  const [peso, setPeso] = useState(perro.cocina ? String(perro.cocina.peso_kg) : "");
  const esCachorro = perro.edad === "cachorro";
  const [meses, setMeses] = useState(perro.cocina?.meses != null ? String(perro.cocina.meses) : "");
  const [adulto, setAdulto] = useState(String(perro.cocina?.peso_adulto_kg ?? pesoAdultoEstimado(perro.estimacion?.peso_adulto_kg) ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  // Acepta "15", "15,5", "15kg" o "15 kilos".
  const num = (s: string) => Number((s.replace(",", ".").match(/\d+(\.\d+)?/) ?? [""])[0]);
  const pesoN = num(peso), mesesN = num(meses), adultoN = num(adulto);
  async function guardar() {
    if (!(pesoN >= 1 && pesoN <= 100)) { setError(t("Escribe su peso en kilos (entre 1 y 100).", "Enter their weight in kg (1 to 100).", "Escreva o peso em kg (entre 1 e 100).")); return; }
    if (esCachorro && !(mesesN >= 1 && mesesN <= 24)) { setError(t("Escribe su edad en meses (por ejemplo, 4).", "Enter their age in months (for example, 4).", "Escreva a idade em meses (por exemplo, 4).")); return; }
    if (esCachorro && !(adultoN >= 1 && adultoN <= 100 && adultoN >= pesoN)) { setError(t("Escribe el peso que tendrá de adulto (en kilos, mayor que su peso actual).", "Enter their expected adult weight (kg, more than their current weight).", "Escreva o peso que terá adulto (em kg, maior que o peso atual).")); return; }
    setGuardando(true); setError(null);
    const cocina: DatosCocina = { ...d, peso_kg: Math.round(pesoN * 10) / 10 };
    if (esCachorro) { cocina.meses = Math.round(mesesN * 10) / 10; cocina.peso_adulto_kg = Math.round(adultoN * 10) / 10; } else { delete cocina.meses; delete cocina.peso_adulto_kg; }
    const { error } = await crearCliente().from("perros").update({ cocina }).eq("id", perro.id);
    setGuardando(false);
    if (error) { setError(t("No pudimos guardar. Intenta de nuevo.", "We couldn't save. Try again.", "Não conseguimos salvar. Tente de novo.")); return; }
    alGuardar();
  }
  const chips = <T extends string>(ops: { id: T; t: Txt }[], val: T, set: (v: T) => void) =>
    <div className="chips">{ops.map((o) => <button key={o.id} type="button" className="chip" aria-pressed={val === o.id} onClick={() => set(o.id)}>{o.t[idioma]}</button>)}</div>;
  const sino = [{ id: "no", t: { es: "No", en: "No", pt: "Não" } }, { id: "si", t: { es: "Sí", en: "Yes", pt: "Sim" } }] as { id: "no" | "si"; t: Txt }[];
  return (
    <section className="tarjeta cocina-form">
      <p className="tarjeta-tit"><span>{t(`Datos de ${perro.nombre || "tu perro"} para su cocina`, `${perro.nombre || "Your dog"}'s details for the kitchen`, `Dados de ${perro.nombre || "seu cão"} para a cozinha`)}</span></p>
      <label className="etiqueta" htmlFor="peso">{t("Peso actual (kg)", "Current weight (kg)", "Peso atual (kg)")}</label>
      <input id="peso" className="campo chico" inputMode="decimal" placeholder="12,5" value={peso} onChange={(e) => setPeso(e.target.value)} />
      {esCachorro ? (<>
        <label className="etiqueta" htmlFor="meses">{t("Edad en meses", "Age in months", "Idade em meses")}</label>
        <input id="meses" className="campo chico" inputMode="decimal" placeholder="4" value={meses} onChange={(e) => setMeses(e.target.value)} />
        <label className="etiqueta" htmlFor="adulto">{t("Peso que tendrá de adulto (kg)", "Expected adult weight (kg)", "Peso que terá adulto (kg)")}</label>
        <input id="adulto" className="campo chico" inputMode="decimal" placeholder="20" value={adulto} onChange={(e) => setAdulto(e.target.value)} />
        <p className="nota">{t("Si no lo sabes, usa el que estimó el escáner o pregúntale a tu veterinario. Las porciones del cachorro dependen de este dato.", "If you don't know, use the scanner's estimate or ask your vet. Puppy portions depend on it.", "Se não souber, use a estimativa do escâner ou pergunte ao veterinário. As porções do filhote dependem disso.")}</p>
      </>) : (<>
        <p className="etiqueta">{t("Actividad diaria", "Daily activity", "Atividade diária")}</p>
        {chips(ACTIVIDAD, d.actividad, (v) => setD({ ...d, actividad: v }))}
        <p className="etiqueta">{t("Contextura", "Body condition", "Condição corporal")}</p>
        {chips(CONTEXTURA, d.contextura, (v) => setD({ ...d, contextura: v }))}
        <p className="etiqueta">{t("¿Está castrado o esterilizada?", "Neutered or spayed?", "É castrado(a)?")}</p>
        {chips(sino, d.castrado ? "si" : "no", (v) => setD({ ...d, castrado: v === "si" }))}
      </>)}
      <p className="etiqueta">{t("Alergias alimentarias diagnosticadas", "Diagnosed food allergies", "Alergias alimentares diagnosticadas")}</p>
      <div className="chips">{ALERGENOS.map((a) => <button key={a} type="button" className="chip" aria-pressed={d.alergias.includes(a)}
        onClick={() => setD({ ...d, alergias: d.alergias.includes(a) ? d.alergias.filter((x) => x !== a) : [...d.alergias, a] })}>{ALERG_TXT[a][idioma]}</button>)}</div>
      <p className="etiqueta">{t("¿Tiene alguna enfermedad diagnosticada? (riñón, hígado, corazón, páncreas, diabetes, problemas digestivos crónicos u otra)", "Any diagnosed illness? (kidney, liver, heart, pancreas, diabetes, chronic digestive problems or other)", "Tem alguma doença diagnosticada? (rim, fígado, coração, pâncreas, diabetes, problemas digestivos crônicos ou outra)")}</p>
      {chips(sino, d.enfermedad ? "si" : "no", (v) => setD({ ...d, enfermedad: v === "si" }))}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="botones-min"><button onClick={guardar} disabled={guardando}>{guardando ? t("Guardando…", "Saving…", "Salvando…") : t("Armar su plan", "Build the plan", "Montar o plano")}</button>
        {alCancelar && <button className="suave" onClick={alCancelar}>{t("Cancelar", "Cancel", "Cancelar")}</button>}</div>
    </section>
  );
}

export default function Cocina() {
  const { perros, fotos, activo, elegir, error, recargar } = usePerros();
  const { t, idioma } = useT();
  const plan = usePlan();
  // La fecha se lee en el navegador (no durante el prerender).
  const hoy = useHoy();
  const semanaHoy = hoy ? Math.min(3, Math.floor((hoy.getDate() - 1) / 7)) : 0;
  const [semana, setSemana] = useState<number | null>(null);
  const [editando, setEditando] = useState(false);
  const [compras, setCompras] = useState<"semana" | "mes">("semana");

  const datos = activo?.cocina ?? null;
  const raza = activo ? `${activo.raza_declarada ?? ""} ${activo.estimacion?.mezcla ?? ""}` : "";
  const cal = useMemo(() => (datos && activo ? caloriasDia(datos, activo.edad, raza) : null), [datos, activo, raza]);
  const et = activo ? etapa(activo.edad, datos) : "adulto";
  const mes = useMemo(() => (datos && hoy ? planDelMes(datos.alergias, et, hoy) : []), [datos, et, hoy]);

  if (error) return <p className="error" role="alert">{error}</p>;
  if (!perros || !activo) return <p className="sub">{t("Cargando…", "Loading…", "Carregando…")}</p>;
  const nombre = activo.nombre || t("tu perro", "your dog", "seu cão");
  const motivo = datos ? puedeTenerPlan(datos, activo.edad) : null;
  const sem = semana ?? semanaHoy;
  const r = mes[sem];
  const fmtG = (g: number) => g >= 1000 ? `${(g / 1000).toLocaleString(idioma === "en" ? "en-US" : "es-CL", { maximumFractionDigits: 2 })} kg` : `${g} g`;
  const med = (id: string, g: number) => { const m = medidaCasera(id, g); return m ? ` · ≈ ${m.n} ${UNIDAD[m.unidad][idioma]}` : ""; };

  return (
    <div className="cuerpo entra">
      <Link className="atras" href="/inicio" aria-label={t("Volver a Hoy", "Back to Today", "Voltar para Hoje")} style={{ marginBottom: 8 }}><ArrowLeft size={18} /></Link>
      <p className="fecha-hoy">{t(`Cocina de ${nombre}`, `${nombre}'s kitchen`, `Cozinha de ${nombre}`)}</p>
      <h1>{t("Comida casera", "Home-cooked food", "Comida caseira")}</h1>
      <SelectorPerros perros={perros} fotos={fotos} activoId={activo.id} elegir={(id) => { setEditando(false); elegir(id); }} />
      <AvisoPlan plan={plan} />

      {(!datos || editando) && <Formulario key={activo.id} perro={activo} alGuardar={() => { setEditando(false); recargar(); }} alCancelar={datos ? () => setEditando(false) : undefined} />}

      {datos && !editando && motivo && (
        <section className="tarjeta aviso-cocina" role="note">
          <AlertTriangle size={18} />
          <p>{motivo === "muy_chico"
            ? t(`${nombre} tiene menos de 2 meses: a esa edad todavía necesita leche materna o la fórmula que indique tu veterinario. Desde los 2 meses, Kopeet le arma su plan.`, `${nombre} is under 2 months old: at that age they still need mother's milk or the formula your vet recommends. From 2 months on, Kopeet will build their plan.`, `${nombre} tem menos de 2 meses: nessa idade ainda precisa de leite materno ou da fórmula indicada pelo veterinário. A partir dos 2 meses, o Kopeet monta o plano.`)
            : motivo === "faltan_datos"
            ? t(`Para armar el plan de un cachorro necesitamos su edad en meses y el peso que tendrá de adulto.`, `To build a puppy's plan we need their age in months and expected adult weight.`, `Para montar o plano de um filhote precisamos da idade em meses e do peso que terá adulto.`)
            : motivo === "enfermedad"
              ? t(`Como ${nombre} tiene una enfermedad diagnosticada, su comida debe indicarla su veterinario: muchas enfermedades necesitan dietas especiales. Kopeet no le arma un plan para no ponerlo en riesgo.`, `Since ${nombre} has a diagnosed illness, their food must be prescribed by your vet: many illnesses need special diets. Kopeet won't build a plan so as not to put them at risk.`, `Como ${nombre} tem uma doença diagnosticada, a comida deve ser indicada pelo veterinário: muitas doenças precisam de dietas especiais. O Kopeet não monta um plano para não colocá-lo em risco.`)
              : t(`Con esas alergias no tenemos recetas seguras para ${nombre}. Consulta a tu veterinario por una dieta a su medida.`, `With those allergies we don't have safe recipes for ${nombre}. Ask your vet for a tailored diet.`, `Com essas alergias não temos receitas seguras para ${nombre}. Consulte seu veterinário para uma dieta sob medida.`)}</p>
          <button className="mini" onClick={() => setEditando(true)}><Pencil size={14} /> {t("Cambiar datos", "Edit details", "Mudar dados")}</button>
        </section>
      )}

      {datos && !editando && !motivo && cal && r && (() => {
        const gDia = porcionDia(r, cal.kcal);
        const sup = suplementoDia(r, cal.kcal);
        const n = comidasDia(et, datos.meses);
        const gComida = Math.round(gDia / n / 5) * 5;
        const nombresComidas: Txt[] = n === 4
          ? [{ es: "Desayuno", en: "Breakfast", pt: "Café" }, { es: "Almuerzo", en: "Lunch", pt: "Almoço" }, { es: "Once", en: "Afternoon", pt: "Lanche" }, { es: "Cena", en: "Dinner", pt: "Jantar" }]
          : n === 3 ? [{ es: "Desayuno", en: "Breakfast", pt: "Café" }, { es: "Almuerzo", en: "Lunch", pt: "Almoço" }, { es: "Cena", en: "Dinner", pt: "Jantar" }]
          : [{ es: "Desayuno", en: "Breakfast", pt: "Café" }, { es: "Cena", en: "Dinner", pt: "Jantar" }];
        const lista = compras === "semana" ? listaCompras([r], (x) => porcionDia(x, cal.kcal)) : listaCompras(mes, (x) => porcionDia(x, cal.kcal));
        return (<>
          <section className="tarjeta cocina-resumen">
            <div className="tarjeta-tit"><span><ChefHat size={15} /> {t("Lo que necesita al día", "What they need per day", "O que precisa por dia")}</span>
              <button className="mini" onClick={() => setEditando(true)}><Pencil size={14} /> {t("Datos", "Details", "Dados")}</button></div>
            <div className="cocina-cifras">
              <div><b>{cal.kcal}</b><span>kcal</span></div>
              <div><b>{gDia} g</b><span>{t("de comida", "of food", "de comida")}</span></div>
              <div><b>{n} × {gComida} g</b><span>{t(`${n} comidas`, `${n} meals`, `${n} refeições`)}</span></div>
            </div>
            {et === "cachorro"
              ? <p className="nota">{t(`Etapa cachorro · ${datos.meses} meses · ${datos.peso_kg} kg de ${datos.peso_adulto_kg} kg adulto · fórmula de crecimiento FEDIAF 2024. Pésalo cada semana y actualiza su peso aquí: la porción crece con él. Nunca le dejes comida a libre disposición.`, `Puppy stage · ${datos.meses} months · ${datos.peso_kg} kg of ${datos.peso_adulto_kg} kg adult · FEDIAF 2024 growth formula. Weigh them every week and update their weight here: the portion grows with them. Never leave food out all day.`, `Fase filhote · ${datos.meses} meses · ${datos.peso_kg} kg de ${datos.peso_adulto_kg} kg adulto · fórmula de crescimento FEDIAF 2024. Pese toda semana e atualize o peso aqui: a porção cresce junto. Nunca deixe comida à vontade.`)}</p>
              : <p className="nota">{t(`${et === "senior" ? "Etapa senior · " : ""}${datos.peso_kg} kg · fórmula FEDIAF 2024: ${cal.factor} × peso^0,75. Pésalo cada 2 semanas: si sube, baja un 10 % la porción; si baja, súbela un 10 %.`, `${et === "senior" ? "Senior stage · " : ""}${datos.peso_kg} kg · FEDIAF 2024 formula: ${cal.factor} × weight^0.75. Weigh them every 2 weeks: if they gain, cut the portion 10%; if they lose, add 10%.`, `${et === "senior" ? "Fase sênior · " : ""}${datos.peso_kg} kg · fórmula FEDIAF 2024: ${cal.factor} × peso^0,75. Pese a cada 2 semanas: se subir, reduza a porção em 10 %; se baixar, aumente 10 %.`)}</p>}
            {cal.notas.includes("raza_grande") && <p className="nota"><b>{t("Raza grande: ", "Large breed: ", "Raça grande: ")}</b>{t("crecer rápido daña sus articulaciones. Respeta las porciones al gramo, no agregues calcio extra y llévalo a control veterinario cada mes.", "growing too fast harms their joints. Stick to the portions to the gram, don't add extra calcium and take them to the vet every month.", "crescer rápido prejudica as articulações. Respeite as porções ao grama, não acrescente cálcio extra e leve ao veterinário todo mês.")}</p>}
          </section>

          <div className="semanas-tabs" role="tablist">{mes.map((x, i) => (
            <button key={i} role="tab" aria-selected={sem === i} className={i === semanaHoy ? "hoy" : ""} style={{ "--c": estilo(x).color, "--f": estilo(x).fondo } as React.CSSProperties} onClick={() => setSemana(i)}><span aria-hidden="true">{EMOJI[Object.keys(x.gramos)[0]]}</span>{t(`Semana ${i + 1}`, `Week ${i + 1}`, `Semana ${i + 1}`)}</button>))}</div>

          <section className="tarjeta receta-color" style={{ "--c": estilo(r).color, "--f": estilo(r).fondo } as React.CSSProperties}>
            <div className="receta-cabeza">
              <span className="receta-plato" aria-hidden="true">{EMOJI[Object.keys(r.gramos)[0]]}</span>
              <div className="receta-info">
                <small>{t(`Semana ${sem + 1}`, `Week ${sem + 1}`, `Semana ${sem + 1}`)}{r.etapa === "cachorro" ? t(" · cachorro", " · puppy", " · filhote") : ""}</small>
                <b>{r.nombre[idioma].replace(/ \((cachorro|puppy|filhote)\)/, "")}</b>
                <div className="receta-ings" aria-hidden="true">{emojisReceta(r).map((e) => <i key={e}>{e}</i>)}</div>
              </div>
            </div>
            <div className="receta-pastillas"><span>⚖️ {gDia} g {t("al día", "a day", "por dia")}</span><span>🍽️ {n} × {gComida} g</span></div>
            <div className="calendario-semana">{DIAS.map((d, i) => (
              <div key={i}><b>{d[idioma]}</b>{nombresComidas.map((c, j) => <span key={c.es} className="comida" style={{ "--m": COLOR_COMIDA[j === n - 1 ? 3 : j] } as React.CSSProperties}><i />{c[idioma]} <em>{gComida} g</em></span>)}</div>))}</div>
            {sem === 0 && <p className="nota">{t("¿Viene de alimento comprado? Haz el cambio en 7 días: días 1–2, ¼ casero; días 3–4, la mitad; días 5–6, ¾; día 7, todo casero.", "Coming from commercial food? Switch over 7 days: days 1–2, ¼ homemade; days 3–4, half; days 5–6, ¾; day 7, all homemade.", "Vem de ração comprada? Faça a troca em 7 dias: dias 1–2, ¼ caseira; dias 3–4, metade; dias 5–6, ¾; dia 7, tudo caseiro.")}</p>}
          </section>

          <section className="tarjeta">
            <p className="tarjeta-tit"><span>{t("Ingredientes para los 7 días", "Ingredients for 7 days", "Ingredientes para os 7 dias")}</span></p>
            <ul className="lista-ing">{tanda(r, gDia, 7).map((x) => (
              <li key={x.id}><span><i className="ing-emoji" aria-hidden="true">{EMOJI[x.id] ?? "•"}</i>{INGREDIENTES[x.id].nombre[idioma]}</span><b>{fmtG(x.g)}<small>{med(x.id, x.g)}</small></b></li>))}</ul>
            <p className="tarjeta-tit" style={{ marginTop: 12 }}><span>{t("Preparación", "Preparation", "Preparo")}</span></p>
            <ol className="pasos-cocina">{pasos(r).map((p, i) => <li key={i}>{p[idioma]}</li>)}</ol>
          </section>

          <section className="tarjeta">
            <p className="tarjeta-tit"><span><Pill size={15} /> {t("Suplemento diario (obligatorio)", "Daily supplement (required)", "Suplemento diário (obrigatório)")}</span></p>
            <p className="nota" style={{ marginTop: 4 }}>{t("Ninguna comida casera alcanza sola estos nutrientes. Elige un multivitamínico y mineral para perros cuya etiqueta aporte al día al menos:", "No home-cooked food reaches these nutrients on its own. Choose a dog multivitamin-mineral whose label provides per day at least:", "Nenhuma comida caseira alcança sozinha estes nutrientes. Escolha um multivitamínico e mineral para cães cujo rótulo forneça por dia pelo menos:")}</p>
            <ul className="lista-ing">
              {([["Hierro", "Iron", "Ferro", sup.fe, "mg"], ["Zinc", "Zinc", "Zinco", sup.zn, "mg"], ["Cobre", "Copper", "Cobre", sup.cu, "mg"], ["Yodo", "Iodine", "Iodo", sup.i, "µg"],
                ["Vitamina D", "Vitamin D", "Vitamina D", sup.vitD, "UI"], ["Vitamina E", "Vitamin E", "Vitamina E", sup.vitE, "UI"]] as const)
                .filter((x) => x[3] > 0).map((x) => <li key={x[0]}><span>{t(x[0], x[1], x[2])}</span><b>{x[3]} {x[4]}</b></li>)}</ul>
            <p className="nota">{t("No le des otro suplemento de calcio: la receta ya lo trae. Muéstrale esta lista a tu veterinario o en la tienda de mascotas.", "Don't add another calcium supplement: the recipe already has it. Show this list to your vet or at the pet store.", "Não dê outro suplemento de cálcio: a receita já tem. Mostre esta lista ao veterinário ou no pet shop.")}</p>
          </section>

          <section className="tarjeta">
            <div className="tarjeta-tit"><span><ShoppingCart size={15} /> {t("Lista de compras", "Shopping list", "Lista de compras")}</span>
              <div className="chips" style={{ margin: 0 }}>
                <button className="chip" aria-pressed={compras === "semana"} onClick={() => setCompras("semana")}>{t(`Semana ${sem + 1}`, `Week ${sem + 1}`, `Semana ${sem + 1}`)}</button>
                <button className="chip" aria-pressed={compras === "mes"} onClick={() => setCompras("mes")}>{t("Mes", "Month", "Mês")}</button></div></div>
            {(["carnes", "verduras", "almacen", "farmacia"] as const).map((p) => {
              const items = lista.filter((x) => x.pasillo === p); if (!items.length) return null;
              return <div key={p}><p className="pasillo">{PASILLO[p][idioma]}</p>
                <ul className="lista-ing">{items.map((x) => <li key={x.id}><span><i className="ing-emoji" aria-hidden="true">{EMOJI[x.id] ?? "•"}</i>{INGREDIENTES[x.id].nombre[idioma].replace(/ \((peso cocido|cooked weight|peso cozido)\)/, "")}</span><b>{fmtG(x.g)}</b></li>)}</ul></div>;
            })}
            <p className="nota">{t("Arroz y lentejas en crudo. Más el suplemento diario.", "Rice and lentils listed raw. Plus the daily supplement.", "Arroz e lentilhas em cru. Mais o suplemento diário.")}</p>
          </section>

          <section className="tarjeta aviso-cocina" role="note">
            <AlertTriangle size={18} />
            <p>{PROHIBIDOS[idioma]}</p>
          </section>
          <p className="nota">{t("Recetas calculadas con las guías nutricionales FEDIAF 2024 y la base de alimentos del USDA. No reemplazan al veterinario: consúltalo antes de cambiar la dieta, sobre todo si es senior o si notas vómitos, diarrea o cambios de peso.", "Recipes calculated with the FEDIAF 2024 nutritional guidelines and the USDA food database. They don't replace your vet: check with them before changing the diet, especially for seniors or if you notice vomiting, diarrhea or weight changes.", "Receitas calculadas com as diretrizes nutricionais FEDIAF 2024 e a base de alimentos do USDA. Não substituem o veterinário: consulte-o antes de mudar a dieta, principalmente se for idoso ou se notar vômitos, diarreia ou mudanças de peso.")}</p>
        </>);
      })()}
    </div>
  );
}
