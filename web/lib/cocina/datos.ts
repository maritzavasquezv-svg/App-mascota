// GENERADO por scripts/cocina/generar.mjs — no editar a mano.
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
export const INGREDIENTES: Record<string, Ingrediente> = {
 "pollo_trutro": {
  "nombre": {
   "es": "Trutro de pollo sin piel ni hueso",
   "en": "Skinless boneless chicken thigh",
   "pt": "Sobrecoxa de frango sem pele e sem osso"
  },
  "medida": null,
  "pasillo": "carnes",
  "compra": 1,
  "fdc": 173627,
  "n": {
   "kcal": 121,
   "fe": 0.81,
   "i": 0,
   "zn": 1.58,
   "cu": 0.062,
   "vitD": 1,
   "vitE": 0.268
  }
 },
 "higado_pollo": {
  "nombre": {
   "es": "Hígado de pollo",
   "en": "Chicken liver",
   "pt": "Fígado de frango"
  },
  "medida": null,
  "pasillo": "carnes",
  "compra": 1,
  "fdc": 171060,
  "n": {
   "kcal": 119,
   "fe": 8.99,
   "i": 0,
   "zn": 2.67,
   "cu": 0.492,
   "vitD": 0,
   "vitE": 1.043
  }
 },
 "huevo": {
  "nombre": {
   "es": "Huevo",
   "en": "Egg",
   "pt": "Ovo"
  },
  "medida": {
   "unidad": "unidad",
   "g": 50
  },
  "pasillo": "almacen",
  "compra": 1,
  "fdc": 171287,
  "n": {
   "kcal": 143,
   "fe": 1.75,
   "i": 0,
   "zn": 1.29,
   "cu": 0.072,
   "vitD": 82,
   "vitE": 1.565
  }
 },
 "arroz_blanco": {
  "nombre": {
   "es": "Arroz blanco (peso cocido)",
   "en": "White rice (cooked weight)",
   "pt": "Arroz branco (peso cozido)"
  },
  "medida": {
   "unidad": "taza",
   "g": 158
  },
  "pasillo": "almacen",
  "compra": 0.3333333333333333,
  "fdc": 169757,
  "n": {
   "kcal": 130,
   "fe": 0.2,
   "i": 0,
   "zn": 0.49,
   "cu": 0.069,
   "vitD": 0,
   "vitE": 0.06
  }
 },
 "avena": {
  "nombre": {
   "es": "Avena",
   "en": "Rolled oats",
   "pt": "Aveia em flocos"
  },
  "medida": {
   "unidad": "taza",
   "g": 81
  },
  "pasillo": "almacen",
  "compra": 1,
  "fdc": 169705,
  "n": {
   "kcal": 389,
   "fe": 4.72,
   "i": 0,
   "zn": 3.97,
   "cu": 0.626,
   "vitD": 0,
   "vitE": 0
  }
 },
 "zanahoria": {
  "nombre": {
   "es": "Zanahoria",
   "en": "Carrot",
   "pt": "Cenoura"
  },
  "medida": {
   "unidad": "taza",
   "g": 128
  },
  "pasillo": "verduras",
  "compra": 1,
  "fdc": 170393,
  "n": {
   "kcal": 41,
   "fe": 0.3,
   "i": 0,
   "zn": 0.24,
   "cu": 0.045,
   "vitD": 0,
   "vitE": 0.983
  }
 },
 "espinaca": {
  "nombre": {
   "es": "Espinaca",
   "en": "Spinach",
   "pt": "Espinafre"
  },
  "medida": null,
  "pasillo": "verduras",
  "compra": 1,
  "fdc": 168462,
  "n": {
   "kcal": 23,
   "fe": 2.71,
   "i": 0,
   "zn": 0.53,
   "cu": 0.13,
   "vitD": 0,
   "vitE": 3.025
  }
 },
 "aceite_canola": {
  "nombre": {
   "es": "Aceite de canola",
   "en": "Canola oil",
   "pt": "Óleo de canola"
  },
  "medida": {
   "unidad": "cda",
   "g": 13.6
  },
  "pasillo": "almacen",
  "compra": 1,
  "fdc": 172336,
  "n": {
   "kcal": 884,
   "fe": 0,
   "i": 0,
   "zn": 0,
   "cu": 0,
   "vitD": 0,
   "vitE": 26.015
  }
 },
 "sal": {
  "nombre": {
   "es": "Sal yodada",
   "en": "Iodized salt",
   "pt": "Sal iodado"
  },
  "medida": {
   "unidad": "cdta",
   "g": 6
  },
  "pasillo": "almacen",
  "compra": 1,
  "fdc": 173468,
  "n": {
   "kcal": 0,
   "fe": 0.33,
   "i": 0,
   "zn": 0.1,
   "cu": 0.03,
   "vitD": 0,
   "vitE": 0
  }
 },
 "carbonato_calcio": {
  "nombre": {
   "es": "Carbonato de calcio en polvo (o cáscara de huevo seca y molida)",
   "en": "Calcium carbonate powder (or dried ground eggshell)",
   "pt": "Carbonato de cálcio em pó (ou casca de ovo seca e moída)"
  },
  "medida": null,
  "pasillo": "farmacia",
  "compra": 1,
  "fdc": null,
  "n": {
   "kcal": 0,
   "fe": 0,
   "i": 0,
   "zn": 0,
   "cu": 0,
   "vitD": 0,
   "vitE": 0
  }
 },
 "vacuno_molido": {
  "nombre": {
   "es": "Carne molida de vacuno 10% grasa",
   "en": "Lean ground beef (10% fat)",
   "pt": "Carne moída bovina 10% gordura"
  },
  "medida": {
   "unidad": "taza",
   "g": 225
  },
  "pasillo": "carnes",
  "compra": 1,
  "fdc": 174030,
  "n": {
   "kcal": 176,
   "fe": 2.24,
   "i": 0,
   "zn": 4.79,
   "cu": 0.072,
   "vitD": 3,
   "vitE": 0.253
  }
 },
 "higado_vacuno": {
  "nombre": {
   "es": "Hígado de vacuno",
   "en": "Beef liver",
   "pt": "Fígado bovino"
  },
  "medida": null,
  "pasillo": "carnes",
  "compra": 1,
  "fdc": 169451,
  "n": {
   "kcal": 135,
   "fe": 4.9,
   "i": 0,
   "zn": 4,
   "cu": 9.755,
   "vitD": 49,
   "vitE": 0.566
  }
 },
 "papa": {
  "nombre": {
   "es": "Papa con cáscara",
   "en": "Potato with skin",
   "pt": "Batata inglesa com casca"
  },
  "medida": {
   "unidad": "taza",
   "g": 150
  },
  "pasillo": "verduras",
  "compra": 1,
  "fdc": 170026,
  "n": {
   "kcal": 77,
   "fe": 0.81,
   "i": 0,
   "zn": 0.3,
   "cu": 0.11,
   "vitD": 0,
   "vitE": 0.015
  }
 },
 "zapallo": {
  "nombre": {
   "es": "Zapallo",
   "en": "Pumpkin",
   "pt": "Abóbora"
  },
  "medida": {
   "unidad": "taza",
   "g": 116
  },
  "pasillo": "verduras",
  "compra": 1,
  "fdc": 168448,
  "n": {
   "kcal": 26,
   "fe": 0.8,
   "i": 0,
   "zn": 0.32,
   "cu": 0.127,
   "vitD": 0,
   "vitE": 1.579
  }
 },
 "pavo_molido": {
  "nombre": {
   "es": "Pavo molido",
   "en": "Ground turkey",
   "pt": "Peru moído"
  },
  "medida": {
   "unidad": "taza",
   "g": 225
  },
  "pasillo": "carnes",
  "compra": 1,
  "fdc": 172850,
  "n": {
   "kcal": 150,
   "fe": 1.17,
   "i": 0,
   "zn": 2.53,
   "cu": 0.107,
   "vitD": 14,
   "vitE": 0.164
  }
 },
 "camote": {
  "nombre": {
   "es": "Camote",
   "en": "Sweet potato",
   "pt": "Batata-doce"
  },
  "medida": {
   "unidad": "taza",
   "g": 133
  },
  "pasillo": "verduras",
  "compra": 1,
  "fdc": 168482,
  "n": {
   "kcal": 86,
   "fe": 0.61,
   "i": 0,
   "zn": 0.3,
   "cu": 0.151,
   "vitD": 0,
   "vitE": 0.387
  }
 },
 "zapallo_italiano": {
  "nombre": {
   "es": "Zapallo italiano",
   "en": "Zucchini",
   "pt": "Abobrinha"
  },
  "medida": {
   "unidad": "taza",
   "g": 124
  },
  "pasillo": "verduras",
  "compra": 1,
  "fdc": 169291,
  "n": {
   "kcal": 17,
   "fe": 0.37,
   "i": 0,
   "zn": 0.32,
   "cu": 0.053,
   "vitD": 0,
   "vitE": 0.179
  }
 },
 "pescado_blanco": {
  "nombre": {
   "es": "Pescado blanco (merluza o reineta) sin espinas",
   "en": "White fish (hake or pollock), boneless",
   "pt": "Peixe branco (merluza ou polaca) sem espinhas"
  },
  "medida": null,
  "pasillo": "carnes",
  "compra": 1,
  "fdc": 175129,
  "n": {
   "kcal": 92,
   "fe": 0.46,
   "i": 0,
   "zn": 0.47,
   "cu": 0.05,
   "vitD": 42,
   "vitE": 0.343
  }
 },
 "sardina": {
  "nombre": {
   "es": "Sardinas en conserva, escurridas",
   "en": "Canned sardines, drained",
   "pt": "Sardinha em conserva, escorrida"
  },
  "medida": {
   "unidad": "lata",
   "g": 90
  },
  "pasillo": "almacen",
  "compra": 1,
  "fdc": 175139,
  "n": {
   "kcal": 208,
   "fe": 2.92,
   "i": 0,
   "zn": 1.31,
   "cu": 0.186,
   "vitD": 193,
   "vitE": 3.04
  }
 },
 "arroz_integral": {
  "nombre": {
   "es": "Arroz integral (peso cocido)",
   "en": "Brown rice (cooked weight)",
   "pt": "Arroz integral (peso cozido)"
  },
  "medida": {
   "unidad": "taza",
   "g": 195
  },
  "pasillo": "almacen",
  "compra": 0.3846153846153846,
  "fdc": 169704,
  "n": {
   "kcal": 123,
   "fe": 0.56,
   "i": 0,
   "zn": 0.71,
   "cu": 0.106,
   "vitD": 0,
   "vitE": 0.253
  }
 },
 "cerdo_lomo": {
  "nombre": {
   "es": "Lomo de cerdo sin grasa",
   "en": "Lean pork loin",
   "pt": "Lombo suíno magro"
  },
  "medida": null,
  "pasillo": "carnes",
  "compra": 1,
  "fdc": 168230,
  "n": {
   "kcal": 143,
   "fe": 0.84,
   "i": 0,
   "zn": 1.84,
   "cu": 0.062,
   "vitD": 22,
   "vitE": 0.268
  }
 },
 "cordero": {
  "nombre": {
   "es": "Pierna de cordero sin grasa",
   "en": "Lean lamb leg",
   "pt": "Pernil de cordeiro magro"
  },
  "medida": null,
  "pasillo": "carnes",
  "compra": 1,
  "fdc": 172486,
  "n": {
   "kcal": 125,
   "fe": 1.82,
   "i": 0,
   "zn": 3.89,
   "cu": 0.124,
   "vitD": 0,
   "vitE": 0.298
  }
 },
 "lentejas": {
  "nombre": {
   "es": "Lentejas (peso cocido)",
   "en": "Lentils (cooked weight)",
   "pt": "Lentilhas (peso cozido)"
  },
  "medida": {
   "unidad": "taza",
   "g": 198
  },
  "pasillo": "almacen",
  "compra": 0.4,
  "fdc": 172421,
  "n": {
   "kcal": 116,
   "fe": 3.33,
   "i": 0,
   "zn": 1.27,
   "cu": 0.251,
   "vitD": 0,
   "vitE": 0.164
  }
 },
 "porotos_verdes": {
  "nombre": {
   "es": "Porotos verdes",
   "en": "Green beans",
   "pt": "Vagem"
  },
  "medida": {
   "unidad": "taza",
   "g": 100
  },
  "pasillo": "verduras",
  "compra": 1,
  "fdc": 169961,
  "n": {
   "kcal": 31,
   "fe": 1.03,
   "i": 0,
   "zn": 0.24,
   "cu": 0.069,
   "vitD": 0,
   "vitE": 0.611
  }
 },
 "salmon": {
  "nombre": {
   "es": "Salmón sin espinas",
   "en": "Boneless salmon",
   "pt": "Salmão sem espinhas"
  },
  "medida": null,
  "pasillo": "carnes",
  "compra": 1,
  "fdc": 175167,
  "n": {
   "kcal": 208,
   "fe": 0.34,
   "i": 0,
   "zn": 0.36,
   "cu": 0.045,
   "vitD": 441,
   "vitE": 5.289
  }
 },
 "fosfato_dicalcico": {
  "nombre": {
   "es": "Fosfato dicálcico en polvo (tienda veterinaria o agrícola)",
   "en": "Dicalcium phosphate powder (vet or farm store)",
   "pt": "Fosfato bicálcico em pó (loja veterinária ou agropecuária)"
  },
  "medida": null,
  "pasillo": "farmacia",
  "compra": 1,
  "fdc": null,
  "n": {
   "kcal": 0,
   "fe": 0,
   "i": 0,
   "zn": 0,
   "cu": 0,
   "vitD": 0,
   "vitE": 0
  }
 }
};
export const RECETAS: Receta[] = [
 {
  "id": "pollo_arroz",
  "nombre": {
   "es": "Pollo con arroz y zanahoria",
   "en": "Chicken with rice and carrot",
   "pt": "Frango com arroz e cenoura"
  },
  "etapa": "adulto",
  "alergenos": [
   "pollo",
   "huevo",
   "cereales"
  ],
  "gramos": {
   "pollo_trutro": 460,
   "higado_pollo": 85,
   "huevo": 70,
   "arroz_blanco": 230,
   "avena": 25,
   "zanahoria": 60,
   "espinaca": 80,
   "aceite_canola": 8,
   "sal": 3,
   "carbonato_calcio": 5.5
  }
 },
 {
  "id": "vacuno_papa",
  "nombre": {
   "es": "Carne con papa y zapallo",
   "en": "Beef with potato and pumpkin",
   "pt": "Carne com batata e abóbora"
  },
  "etapa": "adulto",
  "alergenos": [
   "vacuno",
   "huevo",
   "cereales"
  ],
  "gramos": {
   "vacuno_molido": 390,
   "higado_vacuno": 80,
   "huevo": 95,
   "papa": 205,
   "zapallo": 120,
   "espinaca": 100,
   "aceite_canola": 8,
   "sal": 2.5,
   "carbonato_calcio": 5.5,
   "avena": 60
  }
 },
 {
  "id": "pavo_camote",
  "nombre": {
   "es": "Pavo con camote y zapallo italiano",
   "en": "Turkey with sweet potato and zucchini",
   "pt": "Peru com batata-doce e abobrinha"
  },
  "etapa": "adulto",
  "alergenos": [
   "pavo",
   "pollo"
  ],
  "gramos": {
   "pavo_molido": 365,
   "higado_pollo": 90,
   "camote": 180,
   "zapallo_italiano": 120,
   "espinaca": 100,
   "sal": 1.5,
   "carbonato_calcio": 4.5
  }
 },
 {
  "id": "pescado_arroz",
  "nombre": {
   "es": "Pescado con arroz integral",
   "en": "Fish with brown rice",
   "pt": "Peixe com arroz integral"
  },
  "etapa": "adulto",
  "alergenos": [
   "pescado",
   "pollo",
   "huevo",
   "cereales"
  ],
  "gramos": {
   "pescado_blanco": 400,
   "sardina": 40,
   "higado_pollo": 55,
   "huevo": 50,
   "arroz_integral": 250,
   "zanahoria": 80,
   "espinaca": 60,
   "aceite_canola": 10,
   "sal": 2,
   "carbonato_calcio": 4
  }
 },
 {
  "id": "cerdo_avena",
  "nombre": {
   "es": "Cerdo con avena y camote",
   "en": "Pork with oats and sweet potato",
   "pt": "Porco com aveia e batata-doce"
  },
  "etapa": "adulto",
  "alergenos": [
   "cerdo",
   "pollo",
   "cereales"
  ],
  "gramos": {
   "cerdo_lomo": 430,
   "higado_pollo": 90,
   "avena": 35,
   "camote": 170,
   "zapallo": 50,
   "espinaca": 90,
   "aceite_canola": 7,
   "sal": 2,
   "carbonato_calcio": 5.5
  }
 },
 {
  "id": "cordero_papa",
  "nombre": {
   "es": "Cordero con papa y zanahoria",
   "en": "Lamb with potato and carrot",
   "pt": "Cordeiro com batata e cenoura"
  },
  "etapa": "adulto",
  "alergenos": [
   "cordero",
   "vacuno",
   "huevo"
  ],
  "gramos": {
   "cordero": 395,
   "higado_vacuno": 80,
   "huevo": 65,
   "papa": 275,
   "zanahoria": 120,
   "espinaca": 100,
   "aceite_canola": 8.5,
   "sal": 3,
   "carbonato_calcio": 5.5
  }
 },
 {
  "id": "vacuno_camote",
  "nombre": {
   "es": "Carne con camote y lentejas",
   "en": "Beef with sweet potato and lentils",
   "pt": "Carne com batata-doce e lentilhas"
  },
  "etapa": "adulto",
  "alergenos": [
   "vacuno",
   "huevo",
   "legumbres"
  ],
  "gramos": {
   "vacuno_molido": 350,
   "higado_vacuno": 80,
   "huevo": 120,
   "camote": 150,
   "lentejas": 120,
   "porotos_verdes": 120,
   "espinaca": 100,
   "aceite_canola": 10,
   "sal": 3,
   "carbonato_calcio": 5.5
  }
 },
 {
  "id": "pescado_papa",
  "nombre": {
   "es": "Salmón y pescado blanco con papa",
   "en": "Salmon and white fish with potato",
   "pt": "Salmão e peixe branco com batata"
  },
  "etapa": "adulto",
  "alergenos": [
   "pescado",
   "vacuno",
   "legumbres"
  ],
  "gramos": {
   "salmon": 105,
   "pescado_blanco": 255,
   "higado_vacuno": 30,
   "papa": 220,
   "lentejas": 50,
   "zapallo": 50,
   "espinaca": 90,
   "aceite_canola": 11.5,
   "sal": 3,
   "carbonato_calcio": 4
  }
 },
 {
  "id": "c_pollo_arroz",
  "nombre": {
   "es": "Pollo con arroz (cachorro)",
   "en": "Chicken with rice (puppy)",
   "pt": "Frango com arroz (filhote)"
  },
  "etapa": "cachorro",
  "alergenos": [
   "pollo",
   "huevo",
   "cereales"
  ],
  "gramos": {
   "pollo_trutro": 475,
   "higado_pollo": 65,
   "huevo": 90,
   "arroz_blanco": 190,
   "zanahoria": 65,
   "espinaca": 60,
   "aceite_canola": 12.5,
   "sal": 2.5,
   "carbonato_calcio": 4,
   "fosfato_dicalcico": 10
  }
 },
 {
  "id": "c_vacuno_papa",
  "nombre": {
   "es": "Carne con papa (cachorro)",
   "en": "Beef with potato (puppy)",
   "pt": "Carne com batata (filhote)"
  },
  "etapa": "cachorro",
  "alergenos": [
   "vacuno",
   "huevo"
  ],
  "gramos": {
   "vacuno_molido": 370,
   "higado_vacuno": 90,
   "huevo": 70,
   "papa": 215,
   "zapallo": 100,
   "espinaca": 100,
   "aceite_canola": 8,
   "sal": 4,
   "carbonato_calcio": 4,
   "fosfato_dicalcico": 10
  }
 },
 {
  "id": "c_pavo_camote",
  "nombre": {
   "es": "Pavo con camote (cachorro)",
   "en": "Turkey with sweet potato (puppy)",
   "pt": "Peru com batata-doce (filhote)"
  },
  "etapa": "cachorro",
  "alergenos": [
   "pavo",
   "pollo"
  ],
  "gramos": {
   "pavo_molido": 455,
   "higado_pollo": 100,
   "camote": 190,
   "zapallo_italiano": 95,
   "espinaca": 90,
   "aceite_canola": 10.5,
   "sal": 4,
   "carbonato_calcio": 3.5,
   "fosfato_dicalcico": 10
  }
 },
 {
  "id": "c_pescado_arroz",
  "nombre": {
   "es": "Pescado con arroz (cachorro)",
   "en": "Fish with rice (puppy)",
   "pt": "Peixe com arroz (filhote)"
  },
  "etapa": "cachorro",
  "alergenos": [
   "pescado",
   "vacuno",
   "huevo",
   "cereales"
  ],
  "gramos": {
   "pescado_blanco": 355,
   "salmon": 80,
   "sardina": 65,
   "higado_vacuno": 55,
   "huevo": 95,
   "arroz_blanco": 195,
   "zanahoria": 70,
   "espinaca": 55,
   "aceite_canola": 10.5,
   "sal": 2,
   "carbonato_calcio": 3.5,
   "fosfato_dicalcico": 10
  }
 },
 {
  "id": "c_cerdo_avena",
  "nombre": {
   "es": "Cerdo con avena y camote (cachorro)",
   "en": "Pork with oats and sweet potato (puppy)",
   "pt": "Porco com aveia e batata-doce (filhote)"
  },
  "etapa": "cachorro",
  "alergenos": [
   "cerdo",
   "pollo",
   "huevo",
   "cereales"
  ],
  "gramos": {
   "cerdo_lomo": 475,
   "higado_pollo": 65,
   "huevo": 75,
   "avena": 60,
   "camote": 150,
   "espinaca": 60,
   "aceite_canola": 12.5,
   "sal": 2.5,
   "carbonato_calcio": 4,
   "fosfato_dicalcico": 10
  }
 },
 {
  "id": "c_cordero_papa",
  "nombre": {
   "es": "Cordero con papa (cachorro)",
   "en": "Lamb with potato (puppy)",
   "pt": "Cordeiro com batata (filhote)"
  },
  "etapa": "cachorro",
  "alergenos": [
   "cordero",
   "vacuno",
   "huevo"
  ],
  "gramos": {
   "cordero": 460,
   "higado_vacuno": 85,
   "huevo": 65,
   "papa": 215,
   "zanahoria": 90,
   "espinaca": 85,
   "aceite_canola": 10.5,
   "sal": 4,
   "carbonato_calcio": 3.5,
   "fosfato_dicalcico": 10
  }
 }
];
