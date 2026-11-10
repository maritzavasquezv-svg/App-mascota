"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { crearCliente } from "@/lib/supabase/cliente";
import { completarRegistro } from "@/lib/registro";
import type { Perro } from "@/lib/app-datos";

const CLAVE_ACTIVO = "kopeet-perro-activo";

/** Carga la sesión, termina el registro si hace falta y trae los perros con sus fotos firmadas. */
export function usePerros() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [perros, setPerros] = useState<Perro[] | null>(null);
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const [activoId, setActivoId] = useState<string | null>(() => {
    try { return typeof window === "undefined" ? null : window.localStorage.getItem(CLAVE_ACTIVO); } catch { return null; }
  });
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const supabase = crearCliente();
    let vivo = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/entrar"); return; }
      try { await completarRegistro(supabase, user); } catch { /* se reintenta la próxima vez */ }
      const { data, error } = await supabase.from("perros").select("id,nombre,origen,edad,preocupaciones,foto_ruta,creado_en,estimacion,raza_declarada,con_pedigri").order("creado_en");
      if (!vivo) return;
      if (error) { setError("No pudimos cargar tus perros. Revisa tu conexión y recarga."); return; }
      const lista = (data ?? []) as Perro[];
      setUser(user); setPerros(lista);
      const urls: Record<string, string> = {};
      await Promise.all(lista.filter((p) => p.foto_ruta).map(async (p) => {
        const { data: f } = await supabase.storage.from("fotos-perros").createSignedUrl(p.foto_ruta!, 3600);
        if (f?.signedUrl) urls[p.id] = f.signedUrl;
      }));
      if (vivo) setFotos(urls);
    })();
    return () => { vivo = false; };
  }, [router, version]);

  const elegir = useCallback((id: string) => {
    setActivoId(id);
    try { window.localStorage.setItem(CLAVE_ACTIVO, id); } catch { /* sin almacenamiento */ }
  }, []);

  const activo = perros?.find((p) => p.id === activoId) ?? perros?.[0] ?? null;
  return { user, perros, fotos, activo, elegir, error, recargar: () => setVersion((v) => v + 1) };
}
