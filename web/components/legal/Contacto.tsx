import MarcoLegal from "./MarcoLegal";
import { tr, type Idioma } from "@/lib/idiomas";

export default function Contacto({ i }: { i: Idioma }) {
  const t = (es: string, en: string, pt: string) => tr(i, es, en, pt);
  const L = (ruta: string) => (i === "es" ? ruta : `/${i}${ruta}`);
  return (
    <MarcoLegal i={i} doc="contacto">
      <header className="cab"><span className="eyebrow">{t("Estamos para ayudarte", "We’re here to help", "Estamos aqui para ajudar")}</span><h1>{t("Contacto", "Contact", "Contato")}</h1>
        <p className="fecha">{t("Última actualización: 9 de noviembre de 2026 · Versión 1.0", "Last updated: November 9, 2026 · Version 1.0", "Última atualização: 9 de novembro de 2026 · Versão 1.0")}</p>
      </header>
      <div className="contacto">
        <div className="c"><h2>✉️ {t("Escríbenos", "Email us", "Escreva para nós")}</h2><p><a href="mailto:maritzavasquezv@gmail.com">maritzavasquezv@gmail.com</a></p><p>{t("Respondemos en un plazo de 1 a 2 días hábiles.", "We reply within 1 to 2 business days.", "Respondemos em 1 a 2 dias úteis.")}</p></div>
        <div className="c"><h2>💸 {t("Reembolsos y cancelación", "Refunds and cancellation", "Reembolsos e cancelamento")}</h2><p>{t("Se hacen desde Hotmart en minutos. Mira los pasos en ", "They’re done from Hotmart in minutes. See the steps in ", "São feitos pela Hotmart em minutos. Veja os passos em ")}<a href={L("/reembolsos")}>{t("Reembolsos y cancelación", "Refunds and cancellation", "Reembolsos e cancelamento")}</a>.</p></div>
        <div className="c"><h2>🔒 {t("Tus datos", "Your data", "Seus dados")}</h2><p>{t("Para ver, corregir o borrar tus datos, escríbenos o revisa la ", "To view, correct or delete your data, email us or read the ", "Para ver, corrigir ou apagar seus dados, escreva para nós ou veja a ")}<a href={L("/privacidad")}>{t("Política de privacidad", "Privacy policy", "Política de privacidade")}</a>.</p></div>
        <div className="c"><h2>🚨 {t("¿Es una emergencia con tu perro?", "Is it an emergency with your dog?", "É uma emergência com seu cão?")}</h2><p><b>{t("No esperes nuestra respuesta: acude de inmediato a una veterinaria.", "Don’t wait for our reply: go to a vet clinic right away.", "Não espere nossa resposta: procure imediatamente uma veterinária.")}</b> {t("En la app, el Consejero te muestra la veterinaria 24 horas más cercana.", "In the app, the Advisor shows you the nearest 24-hour vet.", "No app, o Conselheiro mostra a veterinária 24 horas mais próxima.")}</p></div>
        <div className="c"><h2>📍 {t("Responsable", "Responsible party", "Responsável")}</h2><p>Maritza Pilar Vásquez Valencia · RUT 15.333.434-K · Santiago de Chile.</p></div>
      </div>
    </MarcoLegal>
  );
}
