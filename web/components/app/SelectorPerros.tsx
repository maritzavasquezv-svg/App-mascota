"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Dog, Plus } from "lucide-react";
import type { Perro } from "@/lib/app-datos";

export default function SelectorPerros({ perros, fotos, activoId, elegir }: { perros: Perro[]; fotos: Record<string, string>; activoId?: string; elegir: (id: string) => void }) {
  return (
    <div className="selector" role="tablist" aria-label="Tus perros">
      {perros.map((p) => (
        <button key={p.id} role="tab" aria-selected={p.id === activoId} className={p.id === activoId ? "on" : ""} onClick={() => elegir(p.id)} title={p.nombre || "Tu perro"}>
          {fotos[p.id] ? <img src={fotos[p.id]} alt={p.nombre || "Tu perro"} /> : <span className="sin-foto"><Dog size={20} /></span>}
        </button>
      ))}
      <Link href="/inicio/sumar-perro" className="sumar" aria-label="Sumar otro perro"><Plus size={20} /></Link>
    </div>
  );
}
