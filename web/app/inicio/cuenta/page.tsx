import type { Metadata } from "next";
import Cuenta from "./Cuenta";

export const metadata: Metadata = { title: "Mi cuenta · Kopeet" };

export default function PaginaCuenta() {
  return <Cuenta />;
}
