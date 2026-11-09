import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clienteConSesion } from "@/lib/supabase/servidor";
import { LIMITE_DIARIO, consultarConsejero, iaDisponible, mensajeErrorIA } from "@/lib/ia";
import { triage } from "@/lib/app-datos";
import { etiquetaEdad, etiquetaOrigen, type Edad, type Origen } from "@/lib/onboarding";

const Entrada = z.object({ pregunta: z.string().trim().min(2).max(500), perroId: z.string().uuid().optional() });

export async function POST(req: NextRequest) {
  const supabase = await clienteConSesion();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión para usar el Consejero." }, { status: 401 });

  const datos = Entrada.safeParse(await req.json().catch(() => null));
  if (!datos.success) return NextResponse.json({ error: "Escribe tu duda (máximo 500 caracteres)." }, { status: 400 });
  const { pregunta, perroId } = datos.data;

  // 1) Seguridad primero: si las reglas detectan una emergencia, se responde al instante.
  const reglas = triage(pregunta);
  if (reglas.luz === "rojo" || !iaDisponible()) return NextResponse.json({ respuesta: reglas, fuente: "reglas" });

  // 2) Límite diario por persona (controla el costo de la IA)
  const desde = new Date(); desde.setHours(0, 0, 0, 0);
  const { count } = await supabase.from("usos_ia").select("id", { count: "exact", head: true }).gte("creado_en", desde.toISOString());
  if ((count ?? 0) >= LIMITE_DIARIO) {
    return NextResponse.json({ respuesta: { ...reglas, pasos: [...reglas.pasos, `Llegaste al límite de ${LIMITE_DIARIO} consultas de hoy. Mañana se renueva.`] }, fuente: "reglas" });
  }

  // 3) Contexto del perro (solo lo necesario: nada de datos personales de la persona)
  let contexto = "Perro sin datos adicionales.";
  if (perroId) {
    const { data: p } = await supabase.from("perros").select("nombre,origen,edad,preocupaciones").eq("id", perroId).maybeSingle();
    if (p) contexto = `Perro: ${p.nombre || "sin nombre"}, ${etiquetaOrigen(p.origen as Origen | null)}, ${etiquetaEdad(p.edad as Edad | null)}. Preocupaciones de la persona: ${(p.preocupaciones as string[]).join(", ") || "ninguna"}.`;
  }

  try {
    const r = await consultarConsejero(pregunta, contexto);
    await supabase.from("usos_ia").insert({ tipo: "consejero" });
    if (!r) return NextResponse.json({ respuesta: reglas, fuente: "reglas" });
    return NextResponse.json({ respuesta: r, fuente: "ia" });
  } catch (error) {
    console.error("consejero", error);
    return NextResponse.json({ respuesta: { ...reglas, pasos: [mensajeErrorIA(error), ...reglas.pasos] }, fuente: "reglas" });
  }
}
