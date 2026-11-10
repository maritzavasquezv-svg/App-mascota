import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { NOMBRE_IDIOMA, tr, type Idioma } from "./idiomas";

// Modelo configurable por variable de entorno (nunca escrito a mano en el código).
export const MODELO_IA = process.env.AI_MODEL || "claude-opus-5-5";
export const LIMITE_DIARIO = Number(process.env.AI_LIMITE_DIARIO || 30);
export const iaDisponible = () => Boolean(process.env.ANTHROPIC_API_KEY);

let cliente: Anthropic | null = null;
const ia = () => (cliente ??= new Anthropic());

// Si la IA declina por seguridad, el servidor de Anthropic reintenta con otro modelo adecuado.
const FALLBACK = { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const };

// ---------------- Consejero ----------------
export const RespuestaConsejero = z.object({
  luz: z.enum(["verde", "amarillo", "rojo"]).describe("verde = observar en casa; amarillo = consultar al veterinario pronto; rojo = ir al veterinario ya"),
  titulo: z.string().describe("Máximo 4 palabras, por ejemplo: Observa en casa / Consulta pronto / Veterinario ya"),
  pasos: z.array(z.string()).describe("2 a 4 pasos cortos y concretos, una idea por paso"),
  motivo: z.string().describe("Solo si luz es rojo: la emergencia en pocas palabras. Si no, texto vacío"),
});
export type RespuestaConsejero = z.infer<typeof RespuestaConsejero>;

const SISTEMA_CONSEJERO = `Eres el Consejero de Kopeet, una app que ayuda a personas que tienen un perro por primera vez (muchas veces adoptado, mestizo o sin historial) a cuidarlo.
Respondes en el idioma que se indica en cada consulta, cálido y sin juzgar. Nunca asumas que el perro es de raza pura.
Clasificas cada consulta con un semáforo:
- rojo: posible emergencia (se tragó un objeto, atoramiento, dificultad para respirar, convulsiones, sangrado importante, intoxicación con chocolate, uvas, cebolla, xilitol, medicamentos o raticida, golpe fuerte o atropello, abdomen hinchado y duro, no reacciona). Indica ir al veterinario de inmediato y no des tratamientos caseros.
- amarillo: algo que conviene consultar pronto con el veterinario (vómitos o diarrea que se repiten, no come hace más de un día, cojera, tos, decaimiento). Da pasos seguros mientras tanto y di cuándo consultar.
- verde: dudas de conducta, rutina, alimentación o adaptación sin señales de alarma. Da pasos prácticos.
Reglas: no diagnostiques enfermedades ni recetes medicamentos ni dosis; ante la duda entre dos colores, elige el más precavido; si es cachorro o senior, sé más precavido.`;

export async function consultarConsejero(pregunta: string, contexto: string, idioma: Idioma = "es"): Promise<RespuestaConsejero | null> {
  const r = await ia().beta.messages.parse({
    model: MODELO_IA,
    max_tokens: 4000,
    ...FALLBACK,
    output_config: { effort: "low", format: betaZodOutputFormat(RespuestaConsejero) },
    system: [{ type: "text", text: SISTEMA_CONSEJERO, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: `Idioma de la respuesta (título, pasos y motivo): ${NOMBRE_IDIOMA[idioma]}.\n${contexto}\n\nConsulta: ${pregunta}` }],
  });
  if (r.stop_reason === "refusal") return null;
  return r.parsed_output ?? null;
}

// ---------------- Escáner por foto ----------------
export const EstimacionPerro = z.object({
  es_perro: z.boolean().describe("false si la foto no muestra un perro con claridad"),
  mezcla: z.string().describe("Raza o mezcla más probable, en lenguaje simple. Ejemplos: 'Border collie', 'Mezcla de Labrador y Pastor alemán', 'Mestizo de tamaño mediano'"),
  confianza: z.enum(["baja", "media", "alta"]),
  etapa: z.enum(["cachorro", "adulto", "senior", "no-se"]).describe("Etapa de vida estimada"),
  edad_aprox: z.string().describe("Rango aproximado, por ejemplo: 1 a 2 años"),
  tamano_adulto: z.enum(["pequeño", "mediano", "grande", "gigante"]),
  peso_adulto_kg: z.string().describe("Rango aproximado de peso adulto, por ejemplo: 14 a 20 kg"),
  nota: z.string().describe("Una frase amable que recuerde que es una estimación por foto, no un diagnóstico"),
});
export type EstimacionPerro = z.infer<typeof EstimacionPerro>;

const SISTEMA_ESCANER = `Analizas fotos de perros para Kopeet, una app para perros de cualquier origen: de raza, mestizos, adoptados o comprados.
Identifica la raza más probable según los rasgos visibles, sin suponer de antemano que el perro es mestizo ni que es de raza:
- Si los rasgos coinciden claramente con una raza, nombra esa raza (por ejemplo "Border collie").
- Si ves rasgos de varias razas, describe la mezcla. Si no se distingue ninguna, di "Mestizo" y su tamaño.
- Usa la información que da la dueña: si dice la raza o que tiene pedigrí, esa información manda; no la contradigas, úsala para estimar tamaño, peso y etapa.
- Si la imagen es un dibujo o ilustración, igual describe la raza que representa, baja la confianza y menciónalo en la nota.
Estima etapa de vida, edad aproximada, tamaño y peso adulto con rangos. Escribe mezcla, edad_aprox, peso_adulto_kg y nota en el idioma que se indica en la consulta, sin juzgar; los campos de lista (confianza, etapa, tamano_adulto) siempre con los valores exactos permitidos. Si no se ve un perro con claridad, marca es_perro en false.`;

export async function estimarPerro(imagenBase64: string, tipo: "image/jpeg" | "image/png" | "image/webp", contexto = "", idioma: Idioma = "es"): Promise<EstimacionPerro | null> {
  const r = await ia().beta.messages.parse({
    model: MODELO_IA,
    max_tokens: 4000,
    ...FALLBACK,
    output_config: { effort: "medium", format: betaZodOutputFormat(EstimacionPerro) },
    system: SISTEMA_ESCANER,
    messages: [{ role: "user", content: [
      { type: "image", source: { type: "base64", media_type: tipo, data: imagenBase64 } },
      { type: "text", text: `Idioma de los textos: ${NOMBRE_IDIOMA[idioma]}.\n${contexto ? `Lo que dice la dueña: ${contexto}\n\n` : ""}Estima la raza o mezcla, la etapa de vida, la edad y el tamaño adulto de este perro.` },
    ] }],
  });
  if (r.stop_reason === "refusal") return null;
  return r.parsed_output ?? null;
}

export function mensajeErrorIA(error: unknown, i: Idioma = "es"): string {
  if (error instanceof Anthropic.RateLimitError) return tr(i, "Hay muchas consultas en este momento. Intenta de nuevo en un minuto.", "Lots of questions right now. Try again in a minute.", "Muitas consultas neste momento. Tente de novo em um minuto.");
  if (error instanceof Anthropic.AuthenticationError) return tr(i, "La IA no está configurada correctamente.", "The AI isn't set up correctly.", "A IA não está configurada corretamente.");
  if (error instanceof Anthropic.APIError) return tr(i, "La IA no respondió. Intenta de nuevo en un momento.", "The AI didn't respond. Try again in a moment.", "A IA não respondeu. Tente de novo em um momento.");
  return tr(i, "No pudimos procesar tu consulta. Intenta de nuevo.", "We couldn't process your question. Try again.", "Não conseguimos processar sua consulta. Tente de novo.");
}
