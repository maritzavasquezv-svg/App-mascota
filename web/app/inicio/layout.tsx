import Navegacion from "@/components/app/Navegacion";
import BotonEmergencia from "@/components/app/BotonEmergencia";
import "../flujo.css";
import "./app-interna.css";

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <main className="flujo app-interna">
      <div className="marco"><BotonEmergencia />{children}</div>
      <Navegacion />
    </main>
  );
}
