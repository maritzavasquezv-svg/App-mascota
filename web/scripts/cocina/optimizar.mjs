import fs from "fs"; import { analizar } from "./validar.mjs";
const MIN_ADULTO = {prot:52.1,grasa:13.75,la:3.82,ca:1.45,p:1.16,k:1.45,na:0.29,mg:0.20,fe:10.4,mn:1.67,se:67.5,vitA:1754,b1:0.62,b2:1.74,b5:4.11,b6:0.42,b12:9.68,b3:4.74,b9:74.7,colina:474};
// FEDIAF 2024 tabla III-3b, crecimiento temprano (<14 semanas): lo más exigente; sirve también para crecimiento tardío.
const MIN_CREC = {prot:62.5,grasa:21.25,la:3.25,ca:2.5,p:2.25,k:1.1,na:0.55,mg:0.10,mn:1.4,se:100,vitA:1250,b1:0.45,b2:1.05,b5:3.0,b6:0.30,b12:7.0,b3:3.4,b9:54,colina:425};
const CREC = process.argv[3] === "crecimiento";
const MIN = CREC ? MIN_CREC : MIN_ADULTO;
// suplemento siempre: yodo, zinc, cobre, vitamina D, vitamina E (y hierro en cachorros)
const T = JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
function pen(r){ const {por1000:x}=analizar(r); let s=0;
  for (const n in MIN) { const c=x[n]/MIN[n]; if (c<1.04) s+=(1.04-c)**2*10; }
  const cap=x.ca/x.p, capMax = CREC ? 1.55 : 1.8; if(cap<1.1) s+=(1.1-cap)**2*20; if(cap>capMax) s+=(cap-capMax)**2*20; if (CREC && x.ca>3.9) s+=(x.ca-3.9)**2*20;
  if (x.vitD>700) s+=1; if (x.vitA>90000) s+=1; if (x.grasa>60) s+=((x.grasa-60)/10)**2;
  return s; }
const res = {};
for (const [nombre, rangos] of Object.entries(T)) {
  const fino=k=>k==="sal"||k==="carbonato_calcio"||k==="fosfato_dicalcico"||k.startsWith("aceite"); let r = Object.fromEntries(Object.entries(rangos).map(([k,[a,b]])=>[k, fino(k)? Math.round(a+b)/2 : Math.round((a+b)/10)*5]));
  let best = pen(r);
  for (let it=0; it<2000; it++) { let mejoro=false;
    for (const k of Object.keys(r)) { const [a,b]=rangos[k]; const paso=fino(k)?0.5:5;
      for (const d of [paso,-paso]) { const v=Math.min(b,Math.max(a,r[k]+d)); if (v===r[k]) continue; const old=r[k]; r[k]=v; const p=pen(r); if (p<best-1e-9){best=p;mejoro=true;} else r[k]=old; } }
    if(!mejoro) break; }
  // redondeo práctico
  for (const k in r) r[k] = k==="sal"||k==="carbonato_calcio"||k.startsWith("aceite") ? Math.round(r[k]*2)/2 : Math.round(r[k]/5)*5;
  res[nombre]=r; console.log(nombre, best.toFixed(4), JSON.stringify(r));
}
fs.writeFileSync(process.argv[4] ?? "recetas_opt.json", JSON.stringify(res,null,1));
