import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clienteConSesion } from "@/lib/supabase/servidor";
import { LIMITE_DIARIO, estimarPerro, iaDisponible, mensajeErrorIA } from "@/lib/ia";

const Entrada = z.object({
  imagen: z.string().regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/).max(2_000_000),
  perroId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await clienteConSesion();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión para usar el escáner." }, { status: 401 });
  if (!iaDisponible()) return NextResponse.json({ error: "El escáner con IA todavía no está activado." }, { status: 503 });

  const datos = Entrada.safeParse(await req.json().catch(() => null));
  if (!datos.success) return NextResponse.json({ error: "Esa imagen no sirve. Usa una foto JPG o PNG de menos de 1,5 MB." }, { status: 400 });

  const desde = new Date(); desde.setHours(0, 0, 0, 0);
  const { count } = await supabase.from("usos_ia").select("id", { count: "exact", head: true }).gte("creado_en", desde.toISOString());
  if ((count ?? 0) >= LIMITE_DIARIO) return NextResponse.json({ error: `Llegaste al límite de ${LIMITE_DIARIO} usos de hoy.` }, { status: 429 });

  const [, tipo, b64] = datos.data.imagen.match(/^data:(image\/[a-z]+);base64,(.+)$/)!;
  try {
    const est = await estimarPerro(b64, tipo as "image/jpeg" | "image/png" | "image/webp");
    await supabase.from("usos_ia").insert({ tipo: "escaner" });
    if (!est) return NextResponse.json({ error: "No pudimos analizar esta foto. Prueba con otra." }, { status: 422 });
    if (!est.es_perro) return NextResponse.json({ error: "No vemos un perro con claridad en la foto. Prueba otra de frente y con buena luz." }, { status: 422 });
    if (datos.data.perroId) await supabase.from("perros").update({ estimacion: est }).eq("id", datos.data.perroId);
    return NextResponse.json({ estimacion: est });
  } catch (error) {
    console.error("escaner", error);
    return NextResponse.json({ error: mensajeErrorIA(error) }, { status: 502 });
  }
}
