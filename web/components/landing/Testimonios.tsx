"use client";
// Recomendaciones reales de clientes (auditoría H4), escritas en la app y aprobadas por la dueña en el Panel.
// La sección no aparece mientras no haya ninguna aprobada: nunca se muestran testimonios inventados.
import { useEffect, useState } from "react";
import { crearCliente } from "@/lib/supabase/cliente";
import { tr, type Idioma } from "@/lib/idiomas";

interface Testimonio { nombre: string; ciudad: string; mascota: string; frase: string; foto: string | null }

export default function Testimonios({ i }: { i: Idioma }) {
  const [lista, setLista] = useState<Testimonio[]>([]);
  useEffect(() => {
    let vivo = true;
    void crearCliente().rpc("testimonios_publicos").then(({ data }) => { if (vivo && Array.isArray(data)) setLista(data as Testimonio[]); }, () => {});
    return () => { vivo = false; };
  }, []);
  if (!lista.length) return null;
  const t = (es: string, en: string, pt: string) => tr(i, es, en, pt);
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/testimonios/`;
  return (
    <section><div className="wrap">
      <h2>{t("Lo que dicen ", "What ", "O que dizem ")}<em>{t("otras familias", "other families say", "outras famílias")}</em></h2>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 18 }}>
        {lista.map((x) => (
          <figure key={x.nombre + x.mascota + x.frase.slice(0, 10)} className="costo" style={{ margin: 0, display: "flex", gap: 12, alignItems: "flex-start" }}>
            {x.foto
              ? <img src={base + x.foto} alt={x.mascota} width={72} height={72} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              : <span aria-hidden="true" style={{ width: 72, height: 72, borderRadius: "50%", background: "#eef4ff", display: "grid", placeItems: "center", fontSize: 30, flexShrink: 0 }}>🐾</span>}
            <div>
              <blockquote style={{ margin: 0 }}>“{x.frase}”</blockquote>
              <figcaption style={{ marginTop: 8, fontSize: 14 }}><b>{x.nombre}</b> · {x.ciudad} · {t("con ", "with ", "com ")}{x.mascota}</figcaption>
            </div>
          </figure>
        ))}
      </div>
    </div></section>
  );
}
