/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import "../legal.css";

export const metadata: Metadata = { title: "Contacto · Kopeet" };

export default function Pagina() {
  return (
    <div className="legal">

<header className="top"><div className="w"><Link className="marca" href="/"><img src="/marca/isotipo-kopeet-180.png" alt="" />Kopeet</Link><Link className="volver" href="/">← Volver</Link></div></header>
<main><div className="w">
<header className="cab"><span className="eyebrow">Estamos para ayudarte</span><h1>Contacto</h1><p className="fecha">Última actualización: 9 de noviembre de 2026 · Versión 1.0</p>
</header>
<div className="contacto">
<div className="c"><h2>✉️ Escríbenos</h2><p><a href="mailto:maritzavasquezv@gmail.com">maritzavasquezv@gmail.com</a></p><p>Respondemos en un plazo de 1 a 2 días hábiles.</p></div>
<div className="c"><h2>💸 Reembolsos y cancelación</h2><p>Se hacen desde Hotmart en minutos. Mira los pasos en <a href="/reembolsos">Reembolsos y cancelación</a>.</p></div>
<div className="c"><h2>🔒 Tus datos</h2><p>Para ver, corregir o borrar tus datos, escríbenos o revisa la <a href="/privacidad">Política de privacidad</a>.</p></div>
<div className="c"><h2>🚨 ¿Es una emergencia con tu perro?</h2><p><b>No esperes nuestra respuesta: acude de inmediato a una veterinaria.</b> En la app, el Consejero te muestra la veterinaria 24 horas más cercana.</p></div>
<div className="c"><h2>📍 Responsable</h2><p>Maritza Pilar Vásquez Valencia · Santiago, Chile.</p></div>
</div>
<p className="legal-nota">Este documento es una primera versión preparada para Kopeet. Se recomienda su revisión por un abogado en Chile antes del lanzamiento.</p>
</div></main>
<footer><div className="w"><nav><a href="/terminos">Términos y condiciones</a><a href="/privacidad">Política de privacidad</a><a href="/reembolsos">Reembolsos y cancelación</a><a href="/contacto" aria-current="page">Contacto</a></nav>
<p>Kopeet es una guía educativa y preventiva. No reemplaza la consulta con un médico veterinario.</p><p>© 2026 Kopeet AI · Maritza Pilar Vásquez Valencia · Santiago, Chile.</p></div></footer>

    </div>
  );
}
