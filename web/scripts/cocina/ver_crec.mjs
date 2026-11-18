import fs from "fs"; import { analizar } from "./validar.mjs";
const MIN = {prot:62.5,grasa:21.25,la:3.25,ca:2.5,p:2.25,k:1.1,na:0.55,mg:0.10,cu:2.75,i:0.38,fe:22,mn:1.4,se:100,zn:25,vitA:1250,vitD:138,vitE:12.5,b1:0.45,b2:1.05,b5:3.0,b6:0.30,b12:7.0,b3:3.4,b9:54,colina:425};
const R = JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
for (const [n,r] of Object.entries(R)) { const {kcal,por1000:x}=analizar(r); const g=Object.values(r).reduce((a,b)=>a+b,0);
  console.log(`\n${n}: ${(kcal/g*100).toFixed(0)} kcal/100g · prot ${x.prot.toFixed(0)} grasa ${x.grasa.toFixed(0)} Ca ${x.ca.toFixed(2)} P ${x.p.toFixed(2)} Ca:P ${(x.ca/x.p).toFixed(2)} vitD ${x.vitD.toFixed(0)} vitA ${x.vitA.toFixed(0)}`);
  console.log("  faltan:", Object.keys(MIN).filter(k=>x[k]<MIN[k]).map(k=>`${k} ${Math.round(100*x[k]/MIN[k])}%`).join(", ")); }
