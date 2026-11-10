"use client";
import { useState } from "react";
import { Camera } from "lucide-react";
import { crearCliente } from "@/lib/supabase/cliente";
import { reducirFoto } from "@/lib/onboarding";
import { useT } from "@/lib/i18n";

/** Sube (o cambia) la foto de un perro ya guardado. */
export default function SubirFoto({ perroId, nombre, alSubir, texto }: { perroId: string; nombre: string; alSubir: () => void; texto?: string }) {
  const { t } = useT();
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function elegir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null); setSubiendo(true);
    try {
      if (!f.type.startsWith("image/")) throw new Error(t("Ese archivo no es una foto. Elige una imagen JPG o PNG.", "That file isn't a photo. Choose a JPG or PNG image.", "Esse arquivo não é uma foto. Escolha uma imagem JPG ou PNG."));
      const s = crearCliente();
      const { data: { user } } = await s.auth.getUser();
      if (!user) throw new Error(t("Tu sesión se cerró. Vuelve a entrar.", "Your session ended. Please sign in again.", "Sua sessão foi encerrada. Entre de novo."));
      const blob = await (await fetch(await reducirFoto(f))).blob();
      const ruta = `${user.id}/${crypto.randomUUID()}.jpg`;
      const up = await s.storage.from("fotos-perros").upload(ruta, blob, { contentType: "image/jpeg" });
      if (up.error) throw new Error(t("No pudimos subir la foto. Intenta de nuevo.", "We couldn't upload the photo. Try again.", "Não conseguimos enviar a foto. Tente de novo."));
      const { data: antes } = await s.from("perros").select("foto_ruta").eq("id", perroId).maybeSingle();
      const { error: e2 } = await s.from("perros").update({ foto_ruta: ruta, estimacion: null }).eq("id", perroId);
      if (e2) throw new Error(t("No pudimos guardar la foto. Intenta de nuevo.", "We couldn't save the photo. Try again.", "Não conseguimos salvar a foto. Tente de novo."));
      if (antes?.foto_ruta) await s.storage.from("fotos-perros").remove([antes.foto_ruta]);
      alSubir();
    } catch (err) { setError((err as Error).message); }
    finally { setSubiendo(false); e.target.value = ""; }
  }

  return (
    <>
      <label className="btn-foto">
        <Camera size={16} /> {subiendo ? t("Subiendo…", "Uploading…", "Enviando…") : texto ?? t("Subir su foto", "Upload a photo", "Enviar foto")}
        <input type="file" accept="image/*" onChange={elegir} disabled={subiendo} aria-label={t(`Foto de ${nombre}`, `Photo of ${nombre}`, `Foto de ${nombre}`)} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
    </>
  );
}
