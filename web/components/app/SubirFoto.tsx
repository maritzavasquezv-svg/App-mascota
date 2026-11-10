"use client";
import { useState } from "react";
import { Camera } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { reducirFoto } from "@/lib/onboarding";

/** Sube (o cambia) la foto de un perro ya guardado. */
export default function SubirFoto({ perroId, nombre, alSubir, texto = "Subir su foto" }: { perroId: string; nombre: string; alSubir: () => void; texto?: string }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function elegir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null); setSubiendo(true);
    try {
      if (!f.type.startsWith("image/")) throw new Error("Ese archivo no es una foto. Elige una imagen JPG o PNG.");
      const s = crearCliente();
      const { data: { user } } = await s.auth.getUser();
      if (!user) throw new Error("Tu sesión se cerró. Vuelve a entrar.");
      const blob = await (await fetch(await reducirFoto(f))).blob();
      const ruta = `${user.id}/${crypto.randomUUID()}.jpg`;
      const up = await s.storage.from("fotos-perros").upload(ruta, blob, { contentType: "image/jpeg" });
      if (up.error) throw new Error("No pudimos subir la foto. Intenta de nuevo.");
      const { data: antes } = await s.from("perros").select("foto_ruta").eq("id", perroId).maybeSingle();
      const { error: e2 } = await s.from("perros").update({ foto_ruta: ruta, estimacion: null }).eq("id", perroId);
      if (e2) throw new Error("No pudimos guardar la foto. Intenta de nuevo.");
      if (antes?.foto_ruta) await s.storage.from("fotos-perros").remove([antes.foto_ruta]);
      alSubir();
    } catch (err) { setError((err as Error).message); }
    finally { setSubiendo(false); e.target.value = ""; }
  }

  return (
    <>
      <label className="btn-foto">
        <Camera size={16} /> {subiendo ? "Subiendo…" : texto}
        <input type="file" accept="image/*" onChange={elegir} disabled={subiendo} aria-label={`Foto de ${nombre}`} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
    </>
  );
}
