"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dog, Settings } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { completarRegistro } from "@/lib/registro";
import { etiquetaEdad, etiquetaOrigen, minutosEjercicio, type Edad, type Origen } from "@/lib/onboarding";

interface Perro { id: string; nombre: string; origen: Origen | null; edad: Edad | null; preocupaciones: string[]; foto_ruta: string | null }

export default function Inicio() {
  const router = useRouter();
  const [perros, setPerros] = useState<Perro[] | null>(null);
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = crearCliente();
    let vivo = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/entrar"); return; }
      try { await completarRegistro(supabase, user); } catch { /* se reintenta en la próxima visita */ }
      const { data, error } = await supabase.from("perros").select("id,nombre,origen,edad,preocupaciones,foto_ruta").order("creado_en");
      if (!vivo) return;
      if (error) { setError("No pudimos cargar tus perros. Recarga la página."); return; }
      setPerros(data as Perro[]);
      const urls: Record<string, string> = {};
      for (const p of data as Perro[]) {
        if (p.foto_ruta) {
          const { data: f } = await supabase.storage.from("fotos-perros").createSignedUrl(p.foto_ruta, 3600);
          if (f?.signedUrl) urls[p.id] = f.signedUrl;
        }
      }
      if (vivo) setFotos(urls);
    })();
    return () => { vivo = false; };
  }, [router]);

  const perro = perros?.[0];
  const nombre = perro?.nombre || "tu perro";

  return (
    <>
      <div className="cabeza">
        <img src="/marca/isotipo-kopeet-180.png" alt="" /><b>Kopeet</b>
        <Link className="cerrar" href="/inicio/cuenta" aria-label="Mi cuenta"><Settings size={18} /></Link>
      </div>
      <div className="cuerpo entra">
        {error && <p className="error" role="alert">{error}</p>}
        {!perros && !error && <p className="sub">Cargando tu plan…</p>}
        {perro && (<>
          <p className="sub" style={{ marginTop: 0 }}>Tu plan de hoy</p>
          <h1>Hola, este es el plan de <em>{nombre}</em></h1>
          <div className="ficha-perro">
            {fotos[perro.id] ? <img src={fotos[perro.id]} alt={nombre} /> : <span className="sin-foto"><Dog size={34} /></span>}
            <div><b>{nombre}</b><span>{[etiquetaOrigen(perro.origen), etiquetaEdad(perro.edad)].filter(Boolean).join(" · ")}</span></div>
          </div>
          <div className="resumen">
            <div><span>Ejercicio de hoy</span><b>{minutosEjercicio(perro.edad)} min</b></div>
            {perro.preocupaciones[0] && <div><span>Primero en su plan</span><b>{perro.preocupaciones[0]}</b></div>}
          </div>
          <p className="aviso-prueba" style={{ marginTop: 14 }}>En construcción: el plan diario completo (vacunas, ración, baño, premios y Consejero) llega en la próxima etapa.</p>
        </>)}
        {perros && perros.length === 0 && <p className="sub">Todavía no tienes perros guardados. <Link href="/empezar">Crea su plan</Link>.</p>}
      </div>
    </>
  );
}
