"use client";
// Recomendaciones de clientes (auditoría H4). En Hoy aparece al cumplir 1 mes de uso (si no recomendó y no la ocultó);
// en Cuenta está siempre. Se publica en la página de ventas solo con permiso explícito y después de que la dueña la apruebe.
import { useEffect, useState } from "react";
import { Camera, Heart, X } from "lucide-react";
import { reducirFoto } from "@/lib/onboarding";
import { crearCliente } from "@/lib/supabase/cliente";
import { useT } from "@/lib/i18n";

const OCULTO = "kopeet-recomendar-oculto";
const DIAS = 30;

interface Propia { nombre: string; ciudad: string; mascota: string; frase: string; estado: string; foto: string | null }

const urlFoto = (ruta: string | null) => ruta ? crearCliente().storage.from("testimonios").getPublicUrl(ruta).data.publicUrl : null;

export default function Recomendar({ modo }: { modo: "hoy" | "cuenta" }) {
  const { t, idioma } = useT();
  const [listo, setListo] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const [propia, setPropia] = useState<Propia | null>(null);
  const [f, setF] = useState({ nombre: "", ciudad: "", mascota: "", frase: "", acepta: false });
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [foto, setFoto] = useState<string | null>(null); // foto nueva (data URL) elegida en el formulario

  useEffect(() => {
    let vivo = true;
    (async () => {
      const sb = crearCliente();
      const { data: { user } } = await sb.auth.getUser();
      if (!user || !vivo) return;
      const { data } = await sb.from("testimonios").select("nombre,ciudad,mascota,frase,estado,foto").maybeSingle();
      if (!vivo) return;
      if (data) { const d = data as Propia; setPropia(d); setF({ nombre: d.nombre, ciudad: d.ciudad, mascota: d.mascota, frase: d.frase, acepta: false }); }
      let oculto = false;
      try { oculto = window.localStorage.getItem(OCULTO) === "1"; } catch { /* nada */ }
      const dias = (Date.now() - new Date(user.created_at).getTime()) / 864e5;
      setMostrar(modo === "cuenta" || (!data && !oculto && dias >= DIAS));
      setListo(true);
    })().catch(() => {});
    return () => { vivo = false; };
  }, [modo]);

  if (!listo || !mostrar) return null;

  async function enviar(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    if (!f.acepta) { setMsg({ ok: false, texto: t("Marca la casilla para darnos permiso de publicarla.", "Tick the box to give us permission to publish it.", "Marque a caixa para nos dar permissão de publicá-la.") }); return; }
    setEnviando(true);
    const sb = crearCliente();
    let ruta: string | null = null;
    if (foto) {
      const { data: { user } } = await sb.auth.getUser();
      ruta = `${user?.id}/${Date.now()}.jpg`;
      const blob = await (await fetch(foto)).blob();
      const up = await sb.storage.from("testimonios").upload(ruta, blob, { contentType: "image/jpeg", upsert: true });
      if (up.error) { setEnviando(false); setMsg({ ok: false, texto: t("No pudimos subir la foto. Prueba con otra.", "We couldn't upload the photo. Try another one.", "Não conseguimos enviar a foto. Tente outra.") }); return; }
    }
    const { error } = await sb.rpc("enviar_testimonio", { p_nombre: f.nombre, p_ciudad: f.ciudad, p_mascota: f.mascota, p_frase: f.frase, p_idioma: idioma, p_acepta: true, p_foto: ruta });
    setEnviando(false);
    if (error) { setMsg({ ok: false, texto: t("Revisa que todo esté completo (la frase, de 10 a 280 letras).", "Check everything is filled in (the comment, 10 to 280 characters).", "Confira se está tudo preenchido (a frase, de 10 a 280 letras).") }); return; }
    setPropia({ nombre: f.nombre, ciudad: f.ciudad, mascota: f.mascota, frase: f.frase, estado: "pendiente", foto: ruta ?? propia?.foto ?? null });
    setFoto(null);
    setAbierto(false);
    setMsg({ ok: true, texto: t("¡Gracias! Ganaste la medalla «Corazón de la manada» en Premios. La revisaremos y, si la aprobamos, aparecerá en nuestra página.", "Thank you! You earned the “Heart of the pack” medal in Rewards. We'll review it and, if approved, it will appear on our page.", "Obrigado! Você ganhou a medalha “Coração da matilha” em Prêmios. Vamos revisá-la e, se aprovada, aparecerá na nossa página.") });
  }

  function ocultar() {
    try { window.localStorage.setItem(OCULTO, "1"); } catch { /* nada */ }
    setMostrar(false);
  }

  const estado = propia?.estado === "aprobado" ? t("Publicada en nuestra página. ¡Gracias!", "Published on our page. Thank you!", "Publicada na nossa página. Obrigado!")
    : propia?.estado === "rechazado" ? t("No la publicamos esta vez. Puedes editarla y enviarla otra vez.", "We didn't publish it this time. You can edit it and send it again.", "Não a publicamos desta vez. Você pode editá-la e enviar de novo.")
      : t("Recibida: la estamos revisando.", "Received: we're reviewing it.", "Recebida: estamos revisando.");

  return (
    <section className="tarjeta" style={modo === "hoy" ? { marginTop: 14, border: "2px solid var(--accent, #2f6bff)", background: "linear-gradient(135deg, #fff7e6, #eef4ff)", boxShadow: "0 10px 24px -14px rgb(47 107 255 / .5)" } : { marginTop: 14 }}>
      <p className="tarjeta-tit"><span><Heart size={15} /> {modo === "hoy" ? t("¡Ya llevas un mes con Kopeet!", "You've been with Kopeet for a month!", "Você já está há um mês com o Kopeet!") : t("Recomienda Kopeet", "Recommend Kopeet", "Recomende o Kopeet")}</span>
        {modo === "hoy" && <button type="button" onClick={ocultar} aria-label={t("Ocultar", "Hide", "Ocultar")} style={{ background: "none", border: 0, cursor: "pointer" }}><X size={16} /></button>}</p>
      {propia && !abierto ? (<>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {propia.foto && <img src={urlFoto(propia.foto)!} alt="" width={56} height={56} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />}
          <p className="vacio" style={{ margin: 0 }}>“{propia.frase}” — {propia.nombre}, {propia.ciudad}</p>
        </div>
        <p className="nota">{estado}</p>
        <button type="button" className="mini-cta suave" onClick={() => setAbierto(true)}>{t("Editar", "Edit", "Editar")}</button>
      </>) : !abierto ? (<>
        <p className="vacio">{t("¿Te ha servido? Cuéntale a otras personas cómo te ayuda con tu perro. Tu opinión ayuda a que más perros estén bien cuidados.", "Has it helped you? Tell others how it helps with your dog. Your opinion helps more dogs get good care.", "Tem ajudado? Conte para outras pessoas como ajuda com seu cão. Sua opinião ajuda mais cães a serem bem cuidados.")}</p>
        <p className="nota">{t("📸 Súmale una foto de tu perro y gana la medalla «Corazón de la manada» en Premios.", "📸 Add a photo of your dog and earn the “Heart of the pack” medal in Rewards.", "📸 Adicione uma foto do seu cão e ganhe a medalha “Coração da matilha” em Prêmios.")}</p>
        <button type="button" className="mini-cta" onClick={() => setAbierto(true)}>{t("Escribir mi recomendación", "Write my recommendation", "Escrever minha recomendação")}</button>
      </>) : (
        <form onSubmit={enviar} style={{ display: "grid", gap: 8, marginTop: 6 }}>
          <input className="campo chico" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} maxLength={40} required placeholder={t("Tu nombre (como quieres que aparezca)", "Your name (as you want it shown)", "Seu nome (como quer que apareça)")} />
          <input className="campo chico" value={f.ciudad} onChange={(e) => setF({ ...f, ciudad: e.target.value })} maxLength={40} required placeholder={t("Ciudad", "City", "Cidade")} />
          <input className="campo chico" value={f.mascota} onChange={(e) => setF({ ...f, mascota: e.target.value })} maxLength={30} required placeholder={t("Nombre de tu perro", "Your dog's name", "Nome do seu cão")} />
          <textarea className="campo chico" value={f.frase} onChange={(e) => setF({ ...f, frase: e.target.value })} minLength={10} maxLength={280} required rows={3}
            placeholder={t("¿Cómo te ayudó Kopeet? (ej.: “Ahora sé cuánto darle de comer y ya no busco en Google a medianoche”)", "How did Kopeet help you? (e.g. “Now I know how much to feed him and I no longer google at midnight”)", "Como o Kopeet te ajudou? (ex.: “Agora sei quanto dar de comer e não pesquiso mais no Google à meia-noite”)")} />
          <label className="mini-cta suave" style={{ display: "inline-flex", gap: 6, alignItems: "center", cursor: "pointer", justifySelf: "start" }}>
            <Camera size={16} /> {foto || propia?.foto ? t("Cambiar la foto", "Change the photo", "Trocar a foto") : t("Agregar foto de tu perro (opcional)", "Add a photo of your dog (optional)", "Adicionar foto do seu cão (opcional)")}
            <input type="file" accept="image/*" hidden onChange={async (e) => { const a = e.target.files?.[0]; if (!a) return; try { setFoto(await reducirFoto(a, 600)); } catch (err) { setMsg({ ok: false, texto: (err as Error).message }); } }} />
          </label>
          {(foto || propia?.foto) && <img src={foto ?? urlFoto(propia!.foto)!} alt="" width={80} height={80} style={{ width: 80, height: 80, borderRadius: 14, objectFit: "cover" }} />}
          <label className="check" style={{ fontSize: 14 }}>
            <input type="checkbox" checked={f.acepta} onChange={(e) => setF({ ...f, acepta: e.target.checked })} />
            <span>{t("Acepto que Kopeet publique esta recomendación con mi nombre, ciudad, el nombre de mi perro y su foto en su página. Puedo pedir que la quiten cuando quiera.", "I agree that Kopeet may publish this recommendation with my name, city, my dog's name and photo on its page. I can ask for it to be removed at any time.", "Aceito que o Kopeet publique esta recomendação com meu nome, cidade, o nome do meu cão e sua foto na sua página. Posso pedir para removê-la quando quiser.")}</span>
          </label>
          <button className="mini-cta" disabled={enviando}>{enviando ? t("Enviando…", "Sending…", "Enviando…") : t("Enviar recomendación", "Send recommendation", "Enviar recomendação")}</button>
        </form>
      )}
      {msg && <p className={msg.ok ? "nota" : "error"} role="status">{msg.texto}</p>}
    </section>
  );
}
