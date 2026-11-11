import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clienteConSesion, clientePublico } from "@/lib/supabase/servidor";

// Acciones de la administradora. Cada función de la base vuelve a comprobar que quien llama es administradora.
const Accion = z.discriminatedUnion("accion", [
  z.object({ accion: z.literal("ajustes"), impuesto: z.number().min(0).max(100), infra: z.number().min(0).max(100000), email: z.number().min(0).max(100000) }),
  z.object({ accion: z.literal("gasto"), mes: z.string().regex(/^\d{4}-\d{2}$/), canal: z.string().trim().min(1).max(30), monto: z.number().min(0).max(1000000) }),
  z.object({ accion: z.literal("borrarGasto"), id: z.string().uuid() }),
  z.object({ accion: z.literal("hottok"), valor: z.string().trim().min(8).max(200) }),
  z.object({ accion: z.literal("darAcceso"), email: z.string().trim().email(), nombre: z.string().trim().max(80).optional(),
    motivo: z.enum(["cortesia", "compro_sin_acceso"]), dias: z.number().int().min(1).max(3650).nullable(), enviar: z.boolean() }),
  z.object({ accion: z.literal("quitarAcceso"), email: z.string().trim().email() }),
  z.object({ accion: z.literal("reenviar"), email: z.string().trim().email(), nombre: z.string().trim().max(80).optional() }),
  z.object({ accion: z.literal("resolverError"), id: z.number().int() }),
  z.object({ accion: z.literal("resend"), valor: z.string().trim().min(10).max(200) }),
  z.object({ accion: z.literal("resumenPrueba") }),
  z.object({ accion: z.literal("estadoResumen") }),
]);

/** Envía un enlace para entrar sin contraseña. Si la persona no tiene cuenta, se crea al abrirlo. */
async function enviarEnlace(origen: string, email: string, nombre?: string) {
  const { error } = await clientePublico("implicit").auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origen}/auth/listo`, shouldCreateUser: true, data: { nombre: nombre || undefined, origen: "manual" } },
  });
  if (!error) return null;
  return /rate|too many|seconds/i.test(error.message)
    ? "Se enviaron muchos correos seguidos. Espera unos minutos y vuelve a intentar."
    : "No pudimos enviar el correo. Revisa que esté bien escrito.";
}

export async function POST(req: NextRequest) {
  const supabase = await clienteConSesion();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const { data: admin } = await supabase.rpc("es_admin");
  if (!admin) return NextResponse.json({ error: "no autorizado" }, { status: 403 });

  const d = Accion.safeParse(await req.json().catch(() => null));
  if (!d.success) return NextResponse.json({ error: "Revisa los datos del formulario." }, { status: 400 });
  const a = d.data;
  const origen = req.nextUrl.origin;
  let r: { error: { message: string } | null } = { error: null };
  let aviso: string | null = null;
  let datos: unknown = null;

  switch (a.accion) {
    case "ajustes": r = await supabase.rpc("admin_guardar_ajustes", { p_impuesto: a.impuesto, p_infra: a.infra, p_email: a.email }); break;
    case "gasto": r = await supabase.rpc("admin_guardar_gasto", { p_mes: `${a.mes}-01`, p_canal: a.canal, p_monto: a.monto }); break;
    case "borrarGasto": r = await supabase.rpc("admin_borrar_gasto", { p_id: a.id }); break;
    case "hottok": r = await supabase.rpc("admin_guardar_hottok", { p_valor: a.valor }); break;
    case "quitarAcceso": r = await supabase.rpc("admin_quitar_acceso", { p_email: a.email }); break;
    case "resolverError": r = await supabase.rpc("admin_resolver_error", { p_id: a.id }); break;
    case "resend": {
      r = await supabase.rpc("admin_guardar_resend", { p_valor: a.valor });
      if (r.error && /clave_invalida/.test(r.error.message)) return NextResponse.json({ error: "Esa no parece una API key de Resend. Debe empezar con «re_»." }, { status: 400 });
      break;
    }
    case "resumenPrueba": {
      r = await supabase.rpc("admin_enviar_resumen_prueba");
      if (r.error && /falta_resend/.test(r.error.message)) return NextResponse.json({ error: "Primero pega tu API key de Resend." }, { status: 400 });
      break;
    }
    case "estadoResumen": {
      const e = await supabase.rpc("admin_estado_resumen");
      r = e; datos = e.data;
      break;
    }
    case "darAcceso":
      r = await supabase.rpc("admin_dar_acceso", { p_email: a.email, p_nombre: a.nombre ?? "", p_motivo: a.motivo, p_dias: a.dias });
      if (!r.error && a.enviar) {
        aviso = await enviarEnlace(origen, a.email.toLowerCase(), a.nombre);
        if (!aviso) await supabase.rpc("admin_marcar_envio", { p_email: a.email });
      }
      break;
    case "reenviar":
      aviso = await enviarEnlace(origen, a.email.toLowerCase(), a.nombre);
      if (!aviso) await supabase.rpc("admin_marcar_envio", { p_email: a.email });
      break;
  }
  if (r.error) {
    console.error("admin accion", a.accion, r.error.message);
    return NextResponse.json({ error: "No se pudo guardar. Intenta de nuevo." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, aviso, datos });
}
