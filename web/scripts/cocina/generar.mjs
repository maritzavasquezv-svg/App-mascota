// Genera lib/cocina/datos.ts a partir de los datos del USDA y las recetas optimizadas (comprobadas con validar.mjs).
import fs from "fs";
const ING = JSON.parse(fs.readFileSync(new URL("./ingredientes.json", import.meta.url)));
ING.carbonato_calcio = { fdc: null, kcal: 0, ca: 40000 };
ING.fosfato_dicalcico = { fdc: null, kcal: 0, ca: 23300, p: 18000 };
const ADULTO = JSON.parse(fs.readFileSync(new URL("./recetas_opt.json", import.meta.url)));
const CACHORRO = JSON.parse(fs.readFileSync(new URL("./recetas_cachorro.json", import.meta.url)));
const REC = { ...ADULTO, ...CACHORRO };
// nombre es/en/pt · medida casera (g por unidad) · pasillo de compra · factor crudo→compra (arroz y lentejas se pesan cocidos)
const META = {
  pollo_trutro: [["Trutro de pollo sin piel ni hueso","Skinless boneless chicken thigh","Sobrecoxa de frango sem pele e sem osso"], null, "carnes"],
  higado_pollo: [["Hígado de pollo","Chicken liver","Fígado de frango"], null, "carnes"],
  vacuno_molido: [["Carne molida de vacuno 10% grasa","Lean ground beef (10% fat)","Carne moída bovina 10% gordura"], ["taza",225], "carnes"],
  higado_vacuno: [["Hígado de vacuno","Beef liver","Fígado bovino"], null, "carnes"],
  pavo_molido: [["Pavo molido","Ground turkey","Peru moído"], ["taza",225], "carnes"],
  cerdo_lomo: [["Lomo de cerdo sin grasa","Lean pork loin","Lombo suíno magro"], null, "carnes"],
  cordero: [["Pierna de cordero sin grasa","Lean lamb leg","Pernil de cordeiro magro"], null, "carnes"],
  pescado_blanco: [["Pescado blanco (merluza o reineta) sin espinas","White fish (hake or pollock), boneless","Peixe branco (merluza ou polaca) sem espinhas"], null, "carnes"],
  salmon: [["Salmón sin espinas","Boneless salmon","Salmão sem espinhas"], null, "carnes"],
  sardina: [["Sardinas en conserva, escurridas","Canned sardines, drained","Sardinha em conserva, escorrida"], ["lata",90], "almacen"],
  huevo: [["Huevo","Egg","Ovo"], ["unidad",50], "almacen"],
  arroz_blanco: [["Arroz blanco (peso cocido)","White rice (cooked weight)","Arroz branco (peso cozido)"], ["taza",158], "almacen", 1/3],
  arroz_integral: [["Arroz integral (peso cocido)","Brown rice (cooked weight)","Arroz integral (peso cozido)"], ["taza",195], "almacen", 1/2.6],
  avena: [["Avena","Rolled oats","Aveia em flocos"], ["taza",81], "almacen"],
  papa: [["Papa con cáscara","Potato with skin","Batata inglesa com casca"], ["taza",150], "verduras"],
  camote: [["Camote","Sweet potato","Batata-doce"], ["taza",133], "verduras"],
  zanahoria: [["Zanahoria","Carrot","Cenoura"], ["taza",128], "verduras"],
  zapallo: [["Zapallo","Pumpkin","Abóbora"], ["taza",116], "verduras"],
  zapallo_italiano: [["Zapallo italiano","Zucchini","Abobrinha"], ["taza",124], "verduras"],
  porotos_verdes: [["Porotos verdes","Green beans","Vagem"], ["taza",100], "verduras"],
  espinaca: [["Espinaca","Spinach","Espinafre"], null, "verduras"],
  lentejas: [["Lentejas (peso cocido)","Lentils (cooked weight)","Lentilhas (peso cozido)"], ["taza",198], "almacen", 1/2.5],
  aceite_canola: [["Aceite de canola","Canola oil","Óleo de canola"], ["cda",13.6], "almacen"],
  sal: [["Sal yodada","Iodized salt","Sal iodado"], ["cdta",6], "almacen"],
  fosfato_dicalcico: [["Fosfato dicálcico en polvo (tienda veterinaria o agrícola)","Dicalcium phosphate powder (vet or farm store)","Fosfato bicálcico em pó (loja veterinária ou agropecuária)"], null, "farmacia"],
  carbonato_calcio: [["Carbonato de calcio en polvo (o cáscara de huevo seca y molida)","Calcium carbonate powder (or dried ground eggshell)","Carbonato de cálcio em pó (ou casca de ovo seca e moída)"], null, "farmacia"],
};
const ALERGENO_DE = { pollo_trutro:"pollo", higado_pollo:"pollo", pavo_molido:"pavo", vacuno_molido:"vacuno", higado_vacuno:"vacuno", corazon_vacuno:"vacuno", cerdo_lomo:"cerdo", cordero:"cordero", pescado_blanco:"pescado", salmon:"pescado", sardina:"pescado", huevo:"huevo", arroz_blanco:"cereales", arroz_integral:"cereales", avena:"cereales", lentejas:"legumbres", arvejas:"legumbres" };
const alergenos = (r) => [...new Set(Object.keys(r).filter((k) => r[k] > 0).map((k) => ALERGENO_DE[k]).filter(Boolean))];
const NOMBRE = {
  pollo_arroz:["Pollo con arroz y zanahoria","Chicken with rice and carrot","Frango com arroz e cenoura"],
  vacuno_papa:["Carne con papa y zapallo","Beef with potato and pumpkin","Carne com batata e abóbora"],
  pavo_camote:["Pavo con camote y zapallo italiano","Turkey with sweet potato and zucchini","Peru com batata-doce e abobrinha"],
  pescado_arroz:["Pescado con arroz integral","Fish with brown rice","Peixe com arroz integral"],
  cerdo_avena:["Cerdo con avena y camote","Pork with oats and sweet potato","Porco com aveia e batata-doce"],
  cordero_papa:["Cordero con papa y zanahoria","Lamb with potato and carrot","Cordeiro com batata e cenoura"],
  vacuno_camote:["Carne con camote y lentejas","Beef with sweet potato and lentils","Carne com batata-doce e lentilhas"],
  pescado_papa:["Salmón y pescado blanco con papa","Salmon and white fish with potato","Salmão e peixe branco com batata"],
  c_pollo_arroz:["Pollo con arroz (cachorro)","Chicken with rice (puppy)","Frango com arroz (filhote)"],
  c_vacuno_papa:["Carne con papa (cachorro)","Beef with potato (puppy)","Carne com batata (filhote)"],
  c_pavo_camote:["Pavo con camote (cachorro)","Turkey with sweet potato (puppy)","Peru com batata-doce (filhote)"],
  c_pescado_arroz:["Pescado con arroz (cachorro)","Fish with rice (puppy)","Peixe com arroz (filhote)"],
  c_cerdo_avena:["Cerdo con avena y camote (cachorro)","Pork with oats and sweet potato (puppy)","Porco com aveia e batata-doce (filhote)"],
  c_cordero_papa:["Cordero con papa (cachorro)","Lamb with potato (puppy)","Cordeiro com batata (filhote)"],
};
const r1 = (x) => Math.round(x * 1000) / 1000;
const ingredientes = {};
for (const k of new Set(Object.values(REC).flatMap((r) => Object.keys(r).filter((x) => r[x] > 0)))) {
  const d = ING[k], m = META[k]; if (!m) throw new Error("falta meta " + k);
  ingredientes[k] = { nombre: { es: m[0][0], en: m[0][1], pt: m[0][2] }, medida: m[1] ? { unidad: m[1][0], g: m[1][1] } : null, pasillo: m[2], compra: m[3] ?? 1,
    fdc: d.fdc ?? null, n: { kcal: d.kcal ?? 0, fe: r1(d.fe ?? 0), i: r1(d.i ?? 0), zn: r1(d.zn ?? 0), cu: r1(d.cu ?? 0), vitD: r1(d.vitD ?? 0), vitE: r1((d.vitE_mg ?? 0) * 1.49) } };
}
const recetas = Object.entries(REC).map(([id, r]) => ({ id, nombre: { es: NOMBRE[id][0], en: NOMBRE[id][1], pt: NOMBRE[id][2] }, etapa: id.startsWith("c_") ? "cachorro" : "adulto", alergenos: alergenos(r),
  gramos: Object.fromEntries(Object.entries(r).filter(([, g]) => g > 0)) }));
const ts = `// GENERADO por scripts/cocina/generar.mjs — no editar a mano.
// Nutrientes: USDA FoodData Central, SR Legacy (abril 2018), por 100 g. vitE en UI (1 mg alfa-tocoferol = 1,49 UI).
// Recetas comprobadas con scripts/cocina/validar.mjs contra FEDIAF 2024 (tabla III-3b, adulto 95 kcal/kg^0,75):
// Adulto: cumplen con comida todos los mínimos salvo yodo, zinc, cobre, vitamina D y vitamina E (los cubre el suplemento).
// Cachorro (recetas c_*): comprobadas con ver_crec.mjs contra crecimiento temprano (<14 semanas), lo más exigente;
// cumplen todo salvo yodo, zinc, cobre, hierro, vitamina D y vitamina E (suplemento). Ca ≤ 3,9 g y Ca:P ≤ 1,6.
import type { Txt } from "@/lib/i18n";
export type Alergeno = "pollo" | "pavo" | "vacuno" | "cerdo" | "cordero" | "pescado" | "huevo" | "cereales" | "legumbres";
export interface Ingrediente { nombre: Txt; medida: { unidad: "taza" | "unidad" | "cda" | "cdta" | "lata"; g: number } | null; pasillo: "carnes" | "verduras" | "almacen" | "farmacia"; compra: number; fdc: number | null;
  n: { kcal: number; fe: number; i: number; zn: number; cu: number; vitD: number; vitE: number } }
export interface Receta { id: string; etapa: "cachorro" | "adulto"; nombre: Txt; alergenos: Alergeno[]; gramos: Record<string, number> }
export const INGREDIENTES: Record<string, Ingrediente> = ${JSON.stringify(ingredientes, null, 1)};
export const RECETAS: Receta[] = ${JSON.stringify(recetas, null, 1)};
`;
fs.writeFileSync(new URL("../../lib/cocina/datos.ts", import.meta.url), ts);
console.log("ok", recetas.length, "recetas,", Object.keys(ingredientes).length, "ingredientes");
