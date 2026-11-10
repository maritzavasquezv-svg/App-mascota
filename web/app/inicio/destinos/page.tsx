import type { Metadata } from "next";
import Destinos from "./Destinos";

export const metadata: Metadata = { title: "Destinos · Kopeet" };

export default function PaginaDestinos() {
  return <Destinos />;
}
