import MarcoLegal from "./MarcoLegal";
import { CambiarCookies } from "@/components/AvisoCookies";
import { tr, type Idioma } from "@/lib/idiomas";

export default function Cookies({ i }: { i: Idioma }) {
  const t = (es: string, en: string, pt: string) => tr(i, es, en, pt);
  const L = (ruta: string) => (i === "es" ? ruta : `/${i}${ruta}`);
  return (
    <MarcoLegal i={i} doc="cookies">
      <header className="cab"><span className="eyebrow">{t("Cookies", "Cookies", "Cookies")}</span><h1>{t("Política de cookies", "Cookie policy", "Política de cookies")}</h1>
        <p className="fecha">{t("Última actualización: 11 de noviembre de 2026 · Versión 1.0", "Last updated: November 11, 2026 · Version 1.0", "Última atualização: 11 de novembro de 2026 · Versão 1.0")}</p>
        <div className="resumen"><b className="t">{t("En pocas palabras", "In short", "Em poucas palavras")}</b><ul>
          <li>{t("Solo usamos lo necesario para que la app funcione.", "We only use what’s needed for the app to work.", "Só usamos o necessário para o app funcionar.")}</li>
          <li>{t("La medición de uso se activa solo si aceptas.", "Usage measurement turns on only if you accept.", "A medição de uso só é ativada se você aceitar.")}</li>
          <li>{t("No usamos publicidad ni píxeles de redes sociales.", "No advertising and no social media pixels.", "Sem publicidade nem pixels de redes sociais.")}</li>
        </ul></div>
      </header>
      <section className="b"><h2><span className="n">1</span>{t("Qué son", "What they are", "O que são")}</h2>
        <p>{t("Las cookies y el almacenamiento del navegador son pequeños datos que la app guarda en tu celular o computador para recordar cosas, como tu sesión o tu idioma.",
          "Cookies and browser storage are small pieces of data the app saves on your phone or computer to remember things, like your session or language.",
          "Cookies e o armazenamento do navegador são pequenos dados que o app guarda no seu celular ou computador para lembrar coisas, como sua sessão ou idioma.")}</p></section>
      <section className="b"><h2><span className="n">2</span>{t("Necesarias (siempre activas)", "Necessary (always on)", "Necessários (sempre ativos)")}</h2>
        <table><tbody>
          <tr><th>{t("Qué", "What", "O quê")}</th><th>{t("Para qué", "What for", "Para quê")}</th></tr>
          <tr><td>{t("Sesión de Supabase", "Supabase session", "Sessão do Supabase")}</td><td>{t("Mantenerte con la sesión iniciada.", "Keep you signed in.", "Manter você conectado.")}</td></tr>
          <tr><td><code>idioma</code></td><td>{t("Recordar tu idioma.", "Remember your language.", "Lembrar seu idioma.")}</td></tr>
          <tr><td><code>kopeet-consentimiento</code></td><td>{t("Recordar si aceptaste o rechazaste la medición (6 meses).", "Remember whether you accepted or rejected measurement (6 months).", "Lembrar se você aceitou ou recusou a medição (6 meses).")}</td></tr>
          <tr><td>{t("Datos del inicio del plan y perro elegido", "Plan setup answers and selected dog", "Respostas do início do plano e cão escolhido")}</td><td>{t("Guardar tus respuestas mientras creas la cuenta y recordar qué perro estás viendo.", "Keep your answers while you create your account and remember which dog you’re viewing.", "Guardar suas respostas enquanto cria a conta e lembrar qual cão você está vendo.")}</td></tr>
        </tbody></table></section>
      <section className="b"><h2><span className="n">3</span>{t("Medición de uso (solo si aceptas)", "Usage measurement (only if you accept)", "Medição de uso (só se você aceitar)")}</h2>
        <p>{t("Con tu permiso guardamos un identificador anónimo del navegador y de dónde llegaste (por ejemplo, Instagram), y registramos acciones dentro de la app (por ejemplo, «anotó la rutina»). Es medición propia de Kopeet: no la compartimos con redes sociales ni anunciantes. Si rechazas, no se guarda ni se envía nada de esto.",
          "With your permission we save an anonymous browser ID and where you came from (e.g., Instagram), and record actions in the app (e.g., “logged the routine”). It’s Kopeet’s own measurement: we don’t share it with social networks or advertisers. If you reject, none of this is saved or sent.",
          "Com sua permissão guardamos um identificador anônimo do navegador e de onde você veio (por exemplo, Instagram), e registramos ações no app (por exemplo, “anotou a rotina”). É medição própria do Kopeet: não compartilhamos com redes sociais nem anunciantes. Se recusar, nada disso é guardado nem enviado.")}</p></section>
      <section className="b"><h2><span className="n">4</span>{t("Cambiar tu elección", "Change your choice", "Mudar sua escolha")}</h2>
        <CambiarCookies />
        <p>{t("También puedes borrar las cookies desde la configuración de tu navegador. Más sobre tus datos en la ", "You can also delete cookies in your browser settings. More about your data in the ", "Você também pode apagar os cookies nas configurações do navegador. Mais sobre seus dados na ")}<a href={L("/privacidad")}>{t("Política de privacidad", "Privacy policy", "Política de privacidade")}</a>.</p></section>
    </MarcoLegal>
  );
}
