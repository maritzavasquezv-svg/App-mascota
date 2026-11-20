import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clienteConSesion } from "@/lib/supabase/servidor";
import { LIMITE_DIARIO, LIMITE_MENSUAL, consultarConsejero, iaDisponible, mensajeErrorIA } from "@/lib/ia";
import { triage } from "@/lib/app-datos";
import { estadoPlan } from "@/lib/plan";
import { etiquetaEdad, etiquetaOrigen, type Edad, type Origen } from "@/lib/onboarding";
import { idiomaDePeticion, tr } from "@/lib/idiomas";

const Entrada = z.object({ pregunta: z.string().trim().min(2).max(500), perroId: z.string().uuid().optional(), idioma: z.string().optional() });

export async function POST(req: NextRequest) {
  const cuerpo = await req.json().catch(() => null);
  const i = idiomaDePeticion(req, cuerpo?.idioma);
  const supabase = await clienteConSesion();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: tr(i, "Inicia sesión para usar el Consejero.", "Sign in to use the Advisor.", "Entre para usar o Conselheiro.") }, { status: 401 });

  const datos = Entrada.safeParse(cuerpo);
  if (!datos.success) return NextResponse.json({ error: tr(i, "Escribe tu duda (máximo 500 caracteres).", "Type your question (500 characters max).", "Escreva sua dúvida (máximo 500 caracteres).") }, { status: 400 });
  const { pregunta, perroId } = datos.data;

  // 1) Seguridad primero: si las reglas detectan una emergencia, se responde al instante.
  const reglas = triage(pregunta, i);
  if (reglas.luz === "rojo" || !iaDisponible()) return NextResponse.json({ respuesta: reglas, fuente: "reglas" });

  // La IA es parte del plan pagado. Sin plan, responde con las reglas de seguridad y lo explica.
  const plan = await estadoPlan(supabase, user);
  if (!plan.activo) return NextResponse.json({ respuesta: reglas, fuente: "reglas", requierePlan: true });

  // 2) Límite por persona (controla el costo de la IA): se reserva en la base de forma atómica (auditoría H6).
  const { data: reserva } = await supabase.rpc("reservar_uso_ia", { p_tipo: "consejero", p_limite_dia: LIMITE_DIARIO, p_limite_mes: LIMITE_MENSUAL });
  if (!reserva) {
    const limite = tr(i, `Llegaste al límite de consultas (${LIMITE_DIARIO} al día y ${LIMITE_MENSUAL} al mes). Se renueva solo.`, `You reached the question limit (${LIMITE_DIARIO} a day and ${LIMITE_MENSUAL} a month). It resets automatically.`, `Você atingiu o limite de consultas (${LIMITE_DIARIO} por dia e ${LIMITE_MENSUAL} por mês). Renova sozinho.`);
    return NextResponse.json({ respuesta: { ...reglas, pasos: [...reglas.pasos, limite] }, fuente: "reglas" });
  }

  // 3) Contexto del perro (solo lo necesario: nada de datos personales de la persona)
  let contexto = "Perro sin datos adicionales.";
  if (perroId) {
    const { data: p } = await supabase.from("perros").select("nombre,origen,edad,preocupaciones").eq("id", perroId).maybeSingle();
    if (p) contexto = `Perro: ${p.nombre || "sin nombre"}, ${etiquetaOrigen(p.origen as Origen | null)}, ${etiquetaEdad(p.edad as Edad | null)}. Preocupaciones de la persona: ${(p.preocupaciones as string[]).join(", ") || "ninguna"}.`;
  }

  try {
    const { respuesta: r, uso } = await consultarConsejero(pregunta, contexto, i);
    await supabase.rpc("completar_uso_ia", { p_id: reserva, p_modelo: uso.modelo, p_entrada: uso.tokens_entrada, p_salida: uso.tokens_salida, p_cache: uso.tokens_cache, p_costo: uso.costo_usd });
    if (!r) return NextResponse.json({ respuesta: reglas, fuente: "reglas" });
    return NextResponse.json({ respuesta: r, fuente: "ia" });
  } catch (error) {
    console.error("consejero", error);
    await supabase.rpc("registrar_error", { p_origen: "consejero", p_mensaje: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ respuesta: { ...reglas, pasos: [mensajeErrorIA(error, i), ...reglas.pasos] }, fuente: "reglas" });
  }
}
