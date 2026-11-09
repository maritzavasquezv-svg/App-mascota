"use client";
import { useSearchParams } from "next/navigation";

export default function PlanElegido() {
  const plan = useSearchParams().get("plan");
  return <p className="sub">Plan elegido: <b>{plan === "mensual" ? "Mensual · US$6,99" : "Anual · US$4,17 al mes"}</b>.</p>;
}
