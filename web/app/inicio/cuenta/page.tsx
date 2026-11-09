import type { Metadata } from "next";
import Cuenta from "./Cuenta";
import "../../flujo.css";

export const metadata: Metadata = { title: "Mi cuenta · Kopeet" };

export default function PaginaCuenta() {
  return (
    <main className="flujo">
      <div className="marco"><Cuenta /></div>
    </main>
  );
}
