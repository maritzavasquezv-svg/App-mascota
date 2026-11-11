import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { esIdioma, idiomaDeNavegador } from "@/lib/idiomas";

// Páginas públicas que tienen versión en /en y /pt.
const CON_VERSION = ["/", "/terminos", "/privacidad", "/reembolsos", "/cookies", "/aviso-ia", "/contacto"];

// 1) Página de ventas y legales: lleva a cada persona a su idioma (el que eligió, o el de su celular).
// 2) Mantiene viva la sesión de Supabase y protege la zona privada (/inicio).
//    Es una verificación rápida; los datos igual están protegidos por RLS en la base.
export async function proxy(request: NextRequest) {
  const ruta = request.nextUrl.pathname;

  if (CON_VERSION.includes(ruta)) {
    const cookie = request.cookies.get("idioma")?.value;
    const idioma = esIdioma(cookie) ? cookie : idiomaDeNavegador(request.headers.get("accept-language"));
    if (idioma === "es") return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = `/${idioma}${ruta === "/" ? "" : ruta}`;
    return NextResponse.redirect(url);
  }

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          cookies.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();

  if (!data.user && (ruta.startsWith("/inicio") || ruta.startsWith("/admin"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    return NextResponse.redirect(url);
  }
  if (data.user && (ruta === "/entrar" || ruta === "/crear-cuenta")) {
    const url = request.nextUrl.clone();
    url.pathname = "/inicio";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return respuesta;
}

export const config = {
  matcher: ["/", "/terminos", "/privacidad", "/reembolsos", "/cookies", "/aviso-ia", "/contacto", "/inicio/:path*", "/admin", "/entrar", "/crear-cuenta", "/auth/:path*"],
};
