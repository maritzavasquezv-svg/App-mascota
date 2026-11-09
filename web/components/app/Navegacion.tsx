"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Droplets, Home, MessageCircle, UserRound } from "lucide-react";

const ITEMS = [
  { href: "/inicio", texto: "Hoy", Icono: Home },
  { href: "/inicio/bano", texto: "Baño", Icono: Droplets },
  { href: "/inicio/consejero", texto: "Consejero", Icono: MessageCircle },
  { href: "/inicio/premios", texto: "Premios", Icono: Award },
  { href: "/inicio/cuenta", texto: "Cuenta", Icono: UserRound },
];

export default function Navegacion() {
  const ruta = usePathname();
  return (
    <nav className="nav-app" aria-label="Navegación principal">
      {ITEMS.map(({ href, texto, Icono }) => {
        const on = href === "/inicio" ? ruta === "/inicio" : ruta.startsWith(href);
        return (
          <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
            <span className="ic"><Icono size={19} /></span><span className="tx">{texto}</span>
          </Link>
        );
      })}
    </nav>
  );
}
