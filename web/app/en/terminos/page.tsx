import type { Metadata } from "next";
import Terminos from "@/components/legal/Terminos";

export const metadata: Metadata = { title: "Terms and conditions · Kopeet" };

export default function Pagina() {
  return <Terminos i="en" />;
}
