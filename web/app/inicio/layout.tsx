import Navegacion from "@/components/app/Navegacion";
import { SincronizarAvisos } from "@/components/app/Recordatorios";
import "../flujo.css";
import "./app-interna.css";

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <main className="flujo app-interna">
      <div className="marco">{children}</div>
      <Navegacion />
      <SincronizarAvisos />
    </main>
  );
}
