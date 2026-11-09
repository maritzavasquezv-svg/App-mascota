import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

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
Respondes en español neutro latinoamericano, con tuteo, cálido y sin juzgar. Nunca asumas que el perro es de raza pura.
Clasificas cada consulta con un semáforo:
- rojo: posible emergencia (se tragó un objeto, atoramiento, dificultad para respirar, convulsiones, sangrado importante, intoxicación con chocolate, uvas, cebolla, xilitol, medicamentos o raticida, golpe fuerte o atropello, abdomen hinchado y duro, no reacciona). Indica ir al veterinario de inmediato y no des tratamientos caseros.
- amarillo: algo que conviene consultar pronto con el veterinario (vómitos o diarrea que se repiten, no come hace más de un día, cojera, tos, decaimiento). Da pasos seguros mientras tanto y di cuándo consultar.
- verde: dudas de conducta, rutina, alimentación o adaptación sin señales de alarma. Da pasos prácticos.
Reglas: no diagnostiques enfermedades ni recetes medicamentos ni dosis; ante la duda entre dos colores, elige el más precavido; si es cachorro o senior, sé más precavido.`;

export async function consultarConsejero(pregunta: string, contexto: string): Promise<RespuestaConsejero | null> {
  const r = await ia().beta.messages.parse({
    model: MODELO_IA,
    max_tokens: 4000,
    ...FALLBACK,
    output_config: { effort: "low", format: betaZodOutputFormat(RespuestaConsejero) },
    system: [{ type: "text", text: SISTEMA_CONSEJERO, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: `${contexto}\n\nConsulta: ${pregunta}` }],
  });
  if (r.stop_reason === "refusal") return null;
  return r.parsed_output ?? null;
}

// ---------------- Escáner por foto ----------------
export const EstimacionPerro = z.object({
  es_perro: z.boolean().describe("false si la foto no muestra un perro con claridad"),
  mezcla: z.string().describe("Mezcla o raza probable en lenguaje simple, por ejemplo: Mestizo con rasgos de Border collie"),
  confianza: z.enum(["baja", "media", "alta"]),
  etapa: z.enum(["cachorro", "adulto", "senior", "no-se"]).describe("Etapa de vida estimada"),
  edad_aprox: z.string().describe("Rango aproximado, por ejemplo: 1 a 2 años"),
  tamano_adulto: z.enum(["pequeño", "mediano", "grande", "gigante"]),
  peso_adulto_kg: z.string().describe("Rango aproximado de peso adulto, por ejemplo: 14 a 20 kg"),
  nota: z.string().describe("Una frase amable que recuerde que es una estimación por foto, no un diagnóstico"),
});
export type EstimacionPerro = z.infer<typeof EstimacionPerro>;

const SISTEMA_ESCANER = `Analizas fotos de perros para Kopeet. La mayoría son mestizos o adoptados: describe la mezcla probable en lenguaje simple y sin juzgar; no afirmes razas puras salvo que sea muy evidente. Estima etapa de vida, edad aproximada, tamaño y peso adulto con rangos. Responde en español neutro. Si la foto no muestra un perro con claridad, marca es_perro en false.`;

export async function estimarPerro(imagenBase64: string, tipo: "image/jpeg" | "image/png" | "image/webp"): Promise<EstimacionPerro | null> {
  const r = await ia().beta.messages.parse({
    model: MODELO_IA,
    max_tokens: 4000,
    ...FALLBACK,
    output_config: { effort: "medium", format: betaZodOutputFormat(EstimacionPerro) },
    system: SISTEMA_ESCANER,
    messages: [{ role: "user", content: [
      { type: "image", source: { type: "base64", media_type: tipo, data: imagenBase64 } },
      { type: "text", text: "Estima la mezcla, la etapa de vida, la edad y el tamaño adulto de este perro." },
    ] }],
  });
  if (r.stop_reason === "refusal") return null;
  return r.parsed_output ?? null;
}

export function mensajeErrorIA(error: unknown): string {
  if (error instanceof Anthropic.RateLimitError) return "Hay muchas consultas en este momento. Intenta de nuevo en un minuto.";
  if (error instanceof Anthropic.AuthenticationError) return "La IA no está configurada correctamente.";
  if (error instanceof Anthropic.APIError) return "La IA no respondió. Intenta de nuevo en un momento.";
  return "No pudimos procesar tu consulta. Intenta de nuevo.";
}
