"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Home, MapPin, MessageCircle, UserRound } from "lucide-react";

const ITEMS = [
  { href: "/inicio", texto: "Hoy", Icono: Home },
  { href: "/inicio/consejero", texto: "Consejero", Icono: MessageCircle },
  { href: "/inicio/premios", texto: "Premios", Icono: Award },
  { href: "/inicio/destinos", texto: "Destinos", Icono: MapPin },
  { href: "/inicio/cuenta", texto: "Cuenta", Icono: UserRound },
];

export default function Navegacion() {
  const ruta = usePathname();
  return (
    <nav className="nav-app" aria-label="Navegación principal">
      {ITEMS.map(({ href, texto, Icono }) => {
        const on = href === "/inicio" ? ruta === "/inicio" || ruta.startsWith("/inicio/bano") || ruta.startsWith("/inicio/sumar-perro")
          : href === "/inicio/consejero" ? ruta.startsWith(href) || ruta.startsWith("/inicio/emergencia") : ruta.startsWith(href);
        return (
          <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined} aria-label={href === "/inicio/consejero" ? "Consejero y emergencia" : undefined}>
            <span className="ic"><Icono size={19} />{href === "/inicio/consejero" && <i className="punto-sos" aria-hidden="true" />}</span><span className="tx">{texto}</span>
          </Link>
        );
      })}
    </nav>
  );
}
