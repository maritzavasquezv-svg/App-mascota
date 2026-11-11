import MarcoLegal from "./MarcoLegal";
import { tr, type Idioma } from "@/lib/idiomas";

/** Aviso sobre la inteligencia artificial y la salud del perro (también se muestra un resumen junto al Consejero y al escáner). */
export default function AvisoIA({ i }: { i: Idioma }) {
  const t = (es: string, en: string, pt: string) => tr(i, es, en, pt);
  const L = (ruta: string) => (i === "es" ? ruta : `/${i}${ruta}`);
  return (
    <MarcoLegal i={i} doc="aviso-ia">
      <header className="cab"><span className="eyebrow">{t("Importante", "Important", "Importante")}</span><h1>{t("Aviso sobre la IA y la salud de tu perro", "Notice about AI and your dog’s health", "Aviso sobre a IA e a saúde do seu cão")}</h1>
        <p className="fecha">{t("Última actualización: 11 de noviembre de 2026 · Versión 1.0", "Last updated: November 11, 2026 · Version 1.0", "Última atualização: 11 de novembro de 2026 · Versão 1.0")}</p>
        <div className="resumen"><b className="t">{t("En pocas palabras", "In short", "Em poucas palavras")}</b><ul>
          <li><b>{t("La IA puede equivocarse.", "AI can be wrong.", "A IA pode errar.")}</b></li>
          <li>{t("Kopeet orienta; no diagnostica ni receta.", "Kopeet guides; it doesn’t diagnose or prescribe.", "O Kopeet orienta; não diagnostica nem receita.")}</li>
          <li>{t("Tú decides, y ante la duda, veterinario.", "You decide, and when in doubt, see a vet.", "Você decide e, na dúvida, procure o veterinário.")}</li>
        </ul></div>
      </header>
      <section className="b"><h2><span className="n">1</span>{t("Dónde usamos IA", "Where we use AI", "Onde usamos IA")}</h2>
        <ul>
          <li><b>{t("Consejero 24 h:", "24/7 Advisor:", "Conselheiro 24 h:")}</b> {t("responde tus dudas y clasifica cada consulta con un semáforo (observar, consultar, veterinario ya).", "answers your questions and rates each one with a traffic light (watch, see a vet, vet now).", "responde suas dúvidas e classifica cada consulta com um semáforo (observar, consultar, veterinário já).")}</li>
          <li><b>{t("Escáner por foto:", "Photo scanner:", "Scanner por foto:")}</b> {t("estima la raza o mezcla, la edad y el tamaño adulto a partir de una foto.", "estimates breed or mix, age and adult size from a photo.", "estima raça ou mistura, idade e tamanho adulto a partir de uma foto.")}</li>
        </ul>
        <p>{t("La IA la provee Anthropic (modelos Claude), en Estados Unidos.", "The AI is provided by Anthropic (Claude models), in the United States.", "A IA é fornecida pela Anthropic (modelos Claude), nos Estados Unidos.")}</p></section>
      <section className="b"><h2><span className="n">2</span>{t("Lo que la IA puede y no puede hacer", "What AI can and can’t do", "O que a IA pode e não pode fazer")}</h2>
        <div className="aviso"><b>{t("Las respuestas pueden ser incorrectas, incompletas o no aplicar a tu perro. No son un diagnóstico, un tratamiento ni consejo veterinario profesional.",
          "Answers may be incorrect, incomplete or not apply to your dog. They are not a diagnosis, treatment or professional veterinary advice.",
          "As respostas podem estar incorretas, incompletas ou não se aplicar ao seu cão. Não são diagnóstico, tratamento nem aconselhamento veterinário profissional.")}</b></div>
        <ul>
          <li>{t("No examina a tu perro: solo conoce lo que tú escribes o la foto que subes.", "It doesn’t examine your dog: it only knows what you type or the photo you upload.", "Ela não examina seu cão: só conhece o que você escreve ou a foto que envia.")}</li>
          <li>{t("No receta medicamentos ni dosis.", "It doesn’t prescribe medicine or doses.", "Não receita remédios nem doses.")}</li>
          <li>{t("Las estimaciones por foto son aproximadas; si conoces la raza de tu perro, la que tú indicas manda.", "Photo estimates are approximate; if you know your dog’s breed, the one you enter takes priority.", "As estimativas por foto são aproximadas; se você souber a raça do seu cão, a que você informar prevalece.")}</li>
        </ul></section>
      <section className="b"><h2><span className="n">3</span>{t("Emergencias", "Emergencies", "Emergências")}</h2>
        <p>{t("Si tu perro se tragó algo, le cuesta respirar, convulsiona, sangra, comió algo tóxico o no reacciona, ", "If your dog swallowed something, struggles to breathe, has a seizure, is bleeding, ate something toxic or isn’t responding, ", "Se seu cão engoliu algo, tem dificuldade para respirar, convulsiona, sangra, comeu algo tóxico ou não reage, ")}<b>{t("ve de inmediato a una veterinaria", "go to a vet right away", "vá imediatamente a uma veterinária")}</b>{t(". No esperes la respuesta de la app.", ". Don’t wait for the app’s answer.", ". Não espere a resposta do app.")}</p></section>
      <section className="b"><h2><span className="n">4</span>{t("Tú decides", "You decide", "Você decide")}</h2>
        <p>{t("Usas la orientación de Kopeet bajo tu responsabilidad. Las decisiones sobre la salud de tu perro son tuyas y de tu veterinario. Más detalle en los ", "You use Kopeet’s guidance at your own responsibility. Decisions about your dog’s health are yours and your vet’s. More in the ", "Você usa a orientação do Kopeet sob sua responsabilidade. As decisões sobre a saúde do seu cão são suas e do seu veterinário. Mais detalhes nos ")}<a href={L("/terminos")}>{t("Términos y condiciones", "Terms and conditions", "Termos e condições")}</a>.</p></section>
    </MarcoLegal>
  );
}
