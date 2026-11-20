// Testimonios reales (auditoría H4). La sección no aparece mientras la lista esté vacía:
// nunca se muestran testimonios inventados. Para agregar uno: nombre, ciudad, frase (en los idiomas que haya)
// y la foto del perro en public/testimonios/ (por ejemplo public/testimonios/toby.jpg).
import { tr, type Idioma } from "@/lib/idiomas";

interface Testimonio { nombre: string; ciudad: string; perro: string; foto: string; frase: { es: string; en?: string; pt?: string } }

export const TESTIMONIOS: Testimonio[] = [
  // { nombre: "Camila", ciudad: "Santiago", perro: "Toby", foto: "/testimonios/toby.jpg", frase: { es: "…" } },
];

export default function Testimonios({ i }: { i: Idioma }) {
  if (TESTIMONIOS.length === 0) return null;
  const t = (es: string, en: string, pt: string) => tr(i, es, en, pt);
  return (
    <section><div className="wrap rev">
      <h2>{t("Lo que dicen ", "What ", "O que dizem ")}<em>{t("otras familias", "other families say", "outras famílias")}</em></h2>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 18 }}>
        {TESTIMONIOS.map((x) => (
          <figure key={x.nombre + x.perro} className="costo" style={{ margin: 0, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <img src={x.foto} alt={x.perro} width={64} height={64} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <div>
              <blockquote style={{ margin: 0 }}>“{(i !== "es" && x.frase[i]) || x.frase.es}”</blockquote>
              <figcaption style={{ marginTop: 8, fontSize: 14 }}><b>{x.nombre}</b> · {x.ciudad} · {t("con ", "with ", "com ")}{x.perro}</figcaption>
            </div>
          </figure>
        ))}
      </div>
    </div></section>
  );
}
