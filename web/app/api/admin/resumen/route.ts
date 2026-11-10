import { NextResponse } from "next/server";
import { clienteAdmin, clienteConSesion } from "@/lib/supabase/servidor";
import { esAdmin } from "@/lib/plan";

// Resumen para el panel de administración. Solo para los correos de ADMIN_EMAILS.
export async function GET() {
  const supabase = await clienteConSesion();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !esAdmin(user.email)) return NextResponse.json({ error: "no autorizado" }, { status: 403 });

  let admin;
  try { admin = clienteAdmin(); } catch { return NextResponse.json({ error: "Falta configurar SUPABASE_SECRET_KEY en Vercel." }, { status: 503 }); }

  const { data: usuarios, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) return NextResponse.json({ error: "No pudimos leer los usuarios." }, { status: 500 });
  const [{ count: perros }, { data: subs }, { count: usosHoy }] = await Promise.all([
    admin.from("perros").select("id", { count: "exact", head: true }),
    admin.from("suscripciones").select("email,estado,plan,actualizado_en"),
    admin.from("usos_ia").select("id", { count: "exact", head: true }).gte("creado_en", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);
  const porEmail = new Map((subs ?? []).map((s) => [s.email.toLowerCase(), s]));
  const lista = usuarios.users
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((u) => {
      const s = porEmail.get((u.email ?? "").toLowerCase());
      return { email: u.email, creado: u.created_at, confirmado: Boolean(u.email_confirmed_at), ultimoIngreso: u.last_sign_in_at ?? null, estado: s?.estado ?? "sin plan", plan: s?.plan ?? null };
    });
  const cuenta = (e: string) => (subs ?? []).filter((s) => s.estado === e).length;
  return NextResponse.json({
    totales: { cuentas: lista.length, confirmadas: lista.filter((u) => u.confirmado).length, perros: perros ?? 0, usosIaHoy: usosHoy ?? 0 },
    planes: { activa: cuenta("activa"), cancelada: cuenta("cancelada"), reembolsada: cuenta("reembolsada"), vencida: cuenta("vencida") },
    usuarios: lista,
  });
}
