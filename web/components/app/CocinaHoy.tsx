"use client";
import { ChefHat } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useHoy } from "@/lib/cocina/useHoy";
import { caloriasDia, comidasDia, etapa, planDelMes, porcionDia, puedeTenerPlan } from "@/lib/cocina/motor";
import type { Perro } from "@/lib/app-datos";

/** Tarjeta en Hoy: lo que come hoy según su plan de comida casera (o invitación a armarlo). */
export default function CocinaHoy({ perro }: { perro: Perro }) {
  const { t, idioma } = useT();
  const hoy = useHoy();
  const nombre = perro.nombre || t("tu perro", "your dog", "seu cão");
  const d = perro.cocina;
  if (!hoy) return null;
  const motivo = d ? puedeTenerPlan(d, perro.edad) : null;
  const et = etapa(perro.edad, d ?? null);
  const r = d && !motivo ? planDelMes(d.alergias, et, hoy)[Math.min(3, Math.floor((hoy.getDate() - 1) / 7))] : null;
  const kcal = d && r ? caloriasDia(d, perro.edad, `${perro.raza_declarada ?? ""} ${perro.estimacion?.mezcla ?? ""}`).kcal : 0;
  const n = comidasDia(et, d?.meses);
  const porComida = r ? Math.round(porcionDia(r, kcal) / n / 5) * 5 : 0;
  return (
    <a className="tarjeta cocina-hoy" href="/inicio/cocina">
      <div className="tarjeta-tit"><span><ChefHat size={15} /> {t("Comida casera de hoy", "Today's home-cooked food", "Comida caseira de hoje")}</span><b>›</b></div>
      {r
        ? <p><b>{r.nombre[idioma]}</b><br />{t(`${n} comidas de ${porComida} g`, `${n} meals of ${porComida} g`, `${n} refeições de ${porComida} g`)} · {t("+ suplemento", "+ supplement", "+ suplemento")}</p>
        : <p>{d
          ? t("Ver por qué no tiene plan de comida casera.", "See why there's no home-cooked plan.", "Veja por que não há plano de comida caseira.")
          : t(`Arma el plan mensual de comida casera de ${nombre}: recetas, gramos y lista de compras.`, `Build ${nombre}'s monthly home-cooked plan: recipes, grams and shopping list.`, `Monte o plano mensal de comida caseira de ${nombre}: receitas, gramas e lista de compras.`)}</p>}
    </a>
  );
}
