import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clienteConSesion } from "@/lib/supabase/servidor";
import { LIMITE_DIARIO, estimarPerro, iaDisponible, mensajeErrorIA } from "@/lib/ia";
import { etiquetaOrigen, type Origen } from "@/lib/onboarding";
import { estadoPlan } from "@/lib/plan";
import { idiomaDePeticion, tr } from "@/lib/idiomas";

const Entrada = z.object({
  imagen: z.string().regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/).max(2_000_000),
  perroId: z.string().uuid().optional(),
  idioma: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const cuerpo = await req.json().catch(() => null);
  const i = idiomaDePeticion(req, cuerpo?.idioma);
  const supabase = await clienteConSesion();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: tr(i, "Inicia sesión para usar el escáner.", "Sign in to use the scanner.", "Entre para usar o scanner.") }, { status: 401 });
  if (!iaDisponible()) return NextResponse.json({ error: tr(i, "El escáner con IA todavía no está activado.", "The AI scanner isn't active yet.", "O scanner com IA ainda não está ativado.") }, { status: 503 });

  if (!(await estadoPlan(supabase, user)).activo) {
    return NextResponse.json({ error: tr(i, "El escáner con IA es parte del plan. Actívalo para analizar la foto.", "The AI scanner is part of the plan. Activate it to analyze the photo.", "O scanner com IA faz parte do plano. Ative-o para analisar a foto."), requierePlan: true }, { status: 402 });
  }

  const datos = Entrada.safeParse(cuerpo);
  if (!datos.success) return NextResponse.json({ error: tr(i, "Esa imagen no sirve. Usa una foto JPG o PNG de menos de 1,5 MB.", "That image won't work. Use a JPG or PNG photo under 1.5 MB.", "Essa imagem não serve. Use uma foto JPG ou PNG de menos de 1,5 MB.") }, { status: 400 });

  const desde = new Date(); desde.setHours(0, 0, 0, 0);
  const { count } = await supabase.from("usos_ia").select("id", { count: "exact", head: true }).gte("creado_en", desde.toISOString());
  if ((count ?? 0) >= LIMITE_DIARIO) return NextResponse.json({ error: tr(i, `Llegaste al límite de ${LIMITE_DIARIO} usos de hoy.`, `You reached today's limit of ${LIMITE_DIARIO} uses.`, `Você atingiu o limite de ${LIMITE_DIARIO} usos de hoje.`) }, { status: 429 });

  const [, tipo, b64] = datos.data.imagen.match(/^data:(image\/[a-z]+);base64,(.+)$/)!;
  // Lo que la dueña ya sabe de su perro (raza, pedigrí, origen y edad) ayuda a la IA y manda sobre la foto.
  let contexto = "";
  if (datos.data.perroId) {
    const { data: p } = await supabase.from("perros").select("raza_declarada,con_pedigri,origen,edad").eq("id", datos.data.perroId).maybeSingle();
    if (p) {
      const partes = [
        p.raza_declarada ? `su raza es ${p.raza_declarada}${p.con_pedigri ? " y tiene pedigrí" : ""}` : "",
        p.origen ? `origen: ${etiquetaOrigen(p.origen as Origen)}` : "",
        p.edad && p.edad !== "no-se" ? `edad indicada: ${p.edad}` : "",
      ].filter(Boolean);
      contexto = partes.join("; ");
    }
  }
  try {
    const { estimacion: est, uso } = await estimarPerro(b64, tipo as "image/jpeg" | "image/png" | "image/webp", contexto, i);
    await supabase.from("usos_ia").insert({ tipo: "escaner", ...uso });
    if (!est) return NextResponse.json({ error: tr(i, "No pudimos analizar esta foto. Prueba con otra.", "We couldn't analyze this photo. Try another one.", "Não conseguimos analisar esta foto. Tente outra.") }, { status: 422 });
    if (!est.es_perro) return NextResponse.json({ error: tr(i, "No vemos un perro con claridad en la foto. Prueba otra de frente y con buena luz.", "We can't clearly see a dog in the photo. Try another one, facing the camera in good light.", "Não vemos um cão com clareza na foto. Tente outra de frente e com boa luz.") }, { status: 422 });
    if (datos.data.perroId) await supabase.from("perros").update({ estimacion: est }).eq("id", datos.data.perroId);
    return NextResponse.json({ estimacion: est });
  } catch (error) {
    console.error("escaner", error);
    await supabase.rpc("registrar_error", { p_origen: "escaner", p_mensaje: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: mensajeErrorIA(error, i) }, { status: 502 });
  }
}
