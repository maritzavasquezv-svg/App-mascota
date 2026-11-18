import fs from "fs"; import readline from "readline";
const DIR = process.argv[2];
const IDS = {pollo_pechuga:171077,pollo_trutro:173627,vacuno_molido:174030,pavo_molido:172850,cerdo_lomo:168230,cordero:172486,pescado_blanco:175129,salmon:175167,sardina:175139,huevo:171287,higado_vacuno:169451,higado_pollo:171060,corazon_vacuno:168625,arroz_blanco:169757,arroz_integral:169704,avena:169705,papa:170026,camote:168482,zanahoria:170393,zapallo:168448,porotos_verdes:169961,zapallo_italiano:169291,espinaca:168462,arvejas:170419,manzana:171688,lentejas:172421,aceite_canola:172336,aceite_maravilla:171017,aceite_salmon:172343,sal:173468};
const NUT = {1008:"kcal",1003:"prot",1004:"grasa",1087:"ca",1091:"p",1092:"k",1093:"na",1090:"mg",1089:"fe",1095:"zn",1098:"cu",1101:"mn",1103:"se",1100:"i",1104:"vitA",1110:"vitD",1109:"vitE_mg",1165:"b1",1166:"b2",1167:"b3",1170:"b5",1175:"b6",1177:"b9",1178:"b12",1180:"colina",1269:"la",1316:"la2",1270:"ala",1404:"ala2",1278:"epa",1272:"dha"};
const want = new Map(Object.entries(IDS).map(([k,v])=>[String(v),k]));
const out = {}; for (const k of Object.keys(IDS)) out[k] = { fdc: IDS[k] };
const rl = readline.createInterface({ input: fs.createReadStream(DIR + "/food_nutrient.csv") });
for await (const line of rl) {
  const c = line.split(",").map(x=>x.replace(/"/g,""));
  const k = want.get(c[1]); if (!k) continue; const n = NUT[c[2]]; if (!n) continue;
  out[k][n] = Number(c[3]);
}
for (const v of Object.values(out)) { if (v.la == null && v.la2 != null) v.la = v.la2; if (v.ala == null && v.ala2 != null) v.ala = v.ala2; delete v.la2; delete v.ala2; }
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
console.log(Object.entries(out).map(([k,v])=>`${k}: kcal=${v.kcal} prot=${v.prot} ca=${v.ca} vitD=${v.vitD} colina=${v.colina} la=${v.la}`).join("\n"));
