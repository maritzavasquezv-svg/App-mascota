/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import SelectorIdioma from "@/components/SelectorIdioma";
import FijarIdioma from "@/components/FijarIdioma";
import { tr, type Idioma } from "@/lib/idiomas";
import "@/app/legal.css";

export type DocLegal = "terminos" | "privacidad" | "reembolsos" | "cookies" | "aviso-ia" | "contacto";

/** Cabecera y pie comunes de las páginas legales, en el idioma de la página. */
export default function MarcoLegal({ i, doc, children }: { i: Idioma; doc: DocLegal; children: React.ReactNode }) {
  const t = (es: string, en: string, pt: string) => tr(i, es, en, pt);
  const L = (ruta: string) => (i === "es" ? ruta : `/${i}${ruta}`);
  const enlaces: [DocLegal, string][] = [
    ["terminos", t("Términos y condiciones", "Terms and conditions", "Termos e condições")],
    ["privacidad", t("Política de privacidad", "Privacy policy", "Política de privacidade")],
    ["reembolsos", t("Reembolsos y cancelación", "Refunds and cancellation", "Reembolsos e cancelamento")],
    ["cookies", t("Cookies", "Cookies", "Cookies")],
    ["aviso-ia", t("Aviso sobre la IA", "AI notice", "Aviso sobre a IA")],
    ["contacto", t("Contacto", "Contact", "Contato")],
  ];
  return (
    <div className="legal">
      <FijarIdioma i={i} />
      <header className="top"><div className="w">
        <Link className="marca" href={L("/")}><img src="/marca/isotipo-kopeet-180.png" alt="" />Kopeet</Link>
        <SelectorIdioma />
        <Link className="volver" href={L("/")}>{t("← Volver", "← Back", "← Voltar")}</Link>
      </div></header>
      <main><div className="w">
        {children}
        <p className="legal-nota">{t(
          "Este documento es una primera versión preparada para Kopeet. Se recomienda su revisión por un abogado en Chile antes del lanzamiento.",
          "This document is a first version prepared for Kopeet and should be reviewed by a lawyer in Chile before launch. This English translation is provided for convenience; if there is any difference, the Spanish version prevails.",
          "Este documento é uma primeira versão preparada para o Kopeet e deve ser revisado por um advogado no Chile antes do lançamento. Esta tradução para o português é oferecida por conveniência; em caso de diferença, prevalece a versão em espanhol.")}</p>
      </div></main>
      <footer><div className="w">
        <nav>{enlaces.map(([d, texto]) => <a key={d} href={L(`/${d}`)} aria-current={d === doc ? "page" : undefined}>{texto}</a>)}</nav>
        <p>{t("Kopeet es una guía educativa y preventiva. No reemplaza la consulta con un médico veterinario.", "Kopeet is an educational, preventive guide. It does not replace a visit to a veterinarian.", "O Kopeet é um guia educativo e preventivo. Não substitui a consulta com um médico veterinário.")}</p>
        <p>© 2026 Kopeet AI · Maritza Pilar Vásquez Valencia · Santiago, Chile.</p>
      </div></footer>
    </div>
  );
}
