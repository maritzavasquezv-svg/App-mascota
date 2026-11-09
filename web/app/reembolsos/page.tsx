/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import "../legal.css";

export const metadata: Metadata = { title: "Reembolsos y cancelación · Kopeet" };

export default function Pagina() {
  return (
    <div className="legal">

<header className="top"><div className="w"><Link className="marca" href="/"><img src="/marca/isotipo-kopeet-180.png" alt="" />Kopeet</Link><Link className="volver" href="/">← Volver</Link></div></header>
<main><div className="w">
<header className="cab"><span className="eyebrow">Sin letra chica</span><h1>Reembolsos y cancelación</h1><p className="fecha">Última actualización: 9 de noviembre de 2026 · Versión 1.0</p>
<div className="resumen"><b className="t">En pocas palabras</b><ul><li><b>7 días gratis</b>: si cancelas antes, no pagas nada.</li><li><b>7 días de garantía</b> después de pagar: te devolvemos el dinero.</li><li>Puedes cancelar cuando quieras desde Hotmart.</li></ul></div></header>
<section className="b"><h2><span className="n">1</span>Prueba gratis de 7 días</h2><p>Al empezar no pagas nada. <b>Te avisamos antes de que termine</b> la prueba. Si cancelas antes del último día, no se te cobra.</p></section>
<section className="b"><h2><span className="n">2</span>Garantía de 7 días</h2><div className="destacado"><b>Si Kopeet no te sirve, te devolvemos el 100% de lo que pagaste</b> si lo pides dentro de los 7 días siguientes al cobro. Sin preguntas difíciles.</div><p>La garantía la opera <b>Hotmart</b>, la plataforma donde pagas. El reembolso vuelve al mismo medio de pago; el tiempo en que se ve reflejado depende de tu banco o tarjeta.</p></section>
<section className="b"><h2><span className="n">3</span>Cómo pedir el reembolso</h2><ol className="pasos"><li>Entra a <b>Hotmart</b> con el correo con el que pagaste.</li><li>Ve a <b>Mis compras</b> y elige <b>Kopeet</b>.</li><li>Toca <b>Solicitar reembolso</b> y sigue los pasos.</li></ol><p>Si tienes problemas, escríbenos a <a href="mailto:maritzavasquezv@gmail.com">maritzavasquezv@gmail.com</a> y te ayudamos.</p></section>
<section className="b"><h2><span className="n">4</span>Cómo cancelar la suscripción</h2><ol className="pasos"><li>Entra a <b>Hotmart</b> → <b>Mis compras</b> → <b>Kopeet</b>.</li><li>Toca <b>Cancelar suscripción</b>.</li><li>Listo: no se harán más cobros. Mantienes el acceso hasta el final del período que ya pagaste.</li></ol><p>También encontrarás el enlace directo en la app: <b>Perfil → Mi suscripción</b>.</p></section>
<section className="b"><h2><span className="n">5</span>Después de los 7 días</h2><ul><li>Si cancelas después de la garantía, no se hacen más cobros, pero el período ya pagado no se reembolsa.</li><li>Esto no limita los derechos que te da la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.</li></ul></section>
<section className="b"><h2><span className="n">6</span>Si el reembolso se aprueba</h2><p>El acceso a las funciones de pago se cierra cuando Hotmart confirma el reembolso. Tus datos se mantienen por si vuelves; si quieres borrarlos, sigue los pasos de la <a href="/privacidad">Política de privacidad</a>.</p></section>
<p className="legal-nota">Este documento es una primera versión preparada para Kopeet. Se recomienda su revisión por un abogado en Chile antes del lanzamiento.</p>
</div></main>
<footer><div className="w"><nav><a href="/terminos">Términos y condiciones</a><a href="/privacidad">Política de privacidad</a><a href="/reembolsos" aria-current="page">Reembolsos y cancelación</a><a href="/contacto">Contacto</a></nav>
<p>Kopeet es una guía educativa y preventiva. No reemplaza la consulta con un médico veterinario.</p><p>© 2026 Kopeet AI · Maritza Pilar Vásquez Valencia · Santiago, Chile.</p></div></footer>

    </div>
  );
}
