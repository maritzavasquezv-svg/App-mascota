import fs from "fs";
const ING = JSON.parse(fs.readFileSync("ingredientes.json","utf8"));
ING.carbonato_calcio = { kcal:0, ca:40000 };
// Fosfato dicálcico dihidratado (CaHPO4·2H2O): 23,3 % calcio y 18,0 % fósforo (estequiometría).
ING.fosfato_dicalcico = { kcal:0, ca:23300, p:18000 };
// FEDIAF 2024 tabla III-3b, adulto MER 95 kcal/kg^0.75, por 1000 kcal
const MIN = {prot:52.1,grasa:13.75,la:3.82,ca:1.45,p:1.16,k:1.45,na:0.29,mg:0.20,cu:2.08,i:0.30,fe:10.4,mn:1.67,se:67.5,zn:20.8,vitA:1754,vitD:159,vitE:10.4,b1:0.62,b2:1.74,b5:4.11,b6:0.42,b12:9.68,b3:4.74,b9:74.7,colina:474};
const UNI = {prot:"g",grasa:"g",la:"g",ca:"g",p:"g",k:"g",na:"g",mg:"g",cu:"mg",i:"mg",fe:"mg",mn:"mg",se:"µg",zn:"mg",vitA:"UI",vitD:"UI",vitE:"UI",b1:"mg",b2:"mg",b5:"mg",b6:"mg",b12:"µg",b3:"mg",b9:"µg",colina:"mg"};
const MAX = {ca:6.25,p:4.0,vitA:100000,vitD:800};
// conversiones desde USDA por 100 g a la unidad FEDIAF
const conv = (n,v) => ["ca","p","k","na","mg"].includes(n) ? v/1000 : n==="i" ? v/1000 : n==="vitE" ? v*1.49 : v;
export function analizar(receta) {
  const tot = {}; let kcal = 0;
  for (const [ing,g] of Object.entries(receta)) { const d = ING[ing]; if (!d) throw new Error(ing); kcal += d.kcal*g/100;
    for (const n of Object.keys(MIN)) { const key = n==="vitE"?"vitE_mg":n; tot[n]=(tot[n]??0)+conv(n,(d[key]??0))*g/100; } }
  const por1000 = Object.fromEntries(Object.entries(tot).map(([n,v])=>[n,v*1000/kcal]));
  return { kcal, por1000 };
}
if (process.argv[2]) {
  const recetas = JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
  for (const [nombre, r] of Object.entries(recetas)) {
    const { kcal, por1000 } = analizar(r);
    const faltan = Object.keys(MIN).filter(n=>por1000[n] < MIN[n]).map(n=>`${n} ${Math.round(100*por1000[n]/MIN[n])}%`);
    const pasan = Object.keys(MAX).filter(n=>por1000[n] > MAX[n]).map(n=>`${n}>${MAX[n]}`);
    const cap = (por1000.ca/por1000.p).toFixed(2);
    const g = Object.values(r).reduce((a,b)=>a+b,0);
    console.log(`\n${nombre}: ${Math.round(kcal)} kcal en ${g} g (${(kcal/g*100).toFixed(0)} kcal/100g) · prot ${por1000.prot.toFixed(0)} g/Mcal · grasa ${por1000.grasa.toFixed(0)} · Ca:P ${cap}`);
    console.log("  faltan:", faltan.join(", ") || "nada", pasan.length ? " | se pasa: "+pasan : "");
  }
}
