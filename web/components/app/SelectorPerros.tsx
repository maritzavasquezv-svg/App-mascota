"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Dog, Plus } from "lucide-react";
import type { Perro } from "@/lib/app-datos";
import { useT } from "@/lib/i18n";

export default function SelectorPerros({ perros, fotos, activoId, elegir }: { perros: Perro[]; fotos: Record<string, string>; activoId?: string; elegir: (id: string) => void }) {
  const { t } = useT();
  const sinNombre = t("Tu perro", "Your dog", "Seu cão");
  return (
    <div className="selector" role="tablist" aria-label={t("Tus perros", "Your dogs", "Seus cães")}>
      {perros.map((p) => (
        <button key={p.id} role="tab" aria-selected={p.id === activoId} className={p.id === activoId ? "on" : ""} onClick={() => elegir(p.id)} title={p.nombre || sinNombre}>
          {fotos[p.id] ? <img src={fotos[p.id]} alt={p.nombre || sinNombre} /> : <span className="sin-foto"><Dog size={20} /></span>}
        </button>
      ))}
      <Link href="/inicio/sumar-perro" className="sumar" aria-label={t("Sumar otro perro", "Add another dog", "Adicionar outro cão")}><Plus size={20} /></Link>
    </div>
  );
}
