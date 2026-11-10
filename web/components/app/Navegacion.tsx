"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Home, MapPin, MessageCircle, UserRound } from "lucide-react";
import { useT, type Txt } from "@/lib/i18n";

const ITEMS: { href: string; texto: Txt; Icono: typeof Home }[] = [
  { href: "/inicio", texto: { es: "Hoy", en: "Today", pt: "Hoje" }, Icono: Home },
  { href: "/inicio/consejero", texto: { es: "Consejero", en: "Advisor", pt: "Conselheiro" }, Icono: MessageCircle },
  { href: "/inicio/premios", texto: { es: "Premios", en: "Rewards", pt: "Prêmios" }, Icono: Award },
  { href: "/inicio/destinos", texto: { es: "Destinos", en: "Places", pt: "Destinos" }, Icono: MapPin },
  { href: "/inicio/cuenta", texto: { es: "Cuenta", en: "Account", pt: "Conta" }, Icono: UserRound },
];

export default function Navegacion() {
  const ruta = usePathname();
  const { t, idioma } = useT();
  return (
    <nav className="nav-app" aria-label={t("Navegación principal", "Main navigation", "Navegação principal")}>
      {ITEMS.map(({ href, texto, Icono }) => {
        const on = href === "/inicio" ? ruta === "/inicio" || ruta.startsWith("/inicio/bano") || ruta.startsWith("/inicio/sumar-perro") || ruta.startsWith("/inicio/editar-perro")
          : href === "/inicio/consejero" ? ruta.startsWith(href) || ruta.startsWith("/inicio/emergencia") : ruta.startsWith(href);
        return (
          <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}
            aria-label={href === "/inicio/consejero" ? t("Consejero y emergencia", "Advisor and emergency", "Conselheiro e emergência") : undefined}>
            <span className="ic"><Icono size={19} />{href === "/inicio/consejero" && <i className="punto-sos" aria-hidden="true" />}</span><span className="tx">{texto[idioma]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
