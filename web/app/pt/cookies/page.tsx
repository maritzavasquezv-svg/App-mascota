import type { Metadata } from "next";
import Cookies from "@/components/legal/Cookies";

export const metadata: Metadata = { title: "Política de cookies · Kopeet" };

export default function Pagina() {
  return <Cookies i="pt" />;
}
