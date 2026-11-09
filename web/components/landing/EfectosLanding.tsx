"use client";
import { useEffect } from "react";

// Aparición suave al hacer scroll y carrusel automático de la sección "La app por dentro".
export default function EfectosLanding() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".rev");
    let io: IntersectionObserver | null = null;
    if (!("IntersectionObserver" in window)) els.forEach((e) => e.classList.add("ver"));
    else {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("ver"); io?.unobserve(e.target); } }), { threshold: 0.12 });
      els.forEach((e) => io!.observe(e));
    }

    const c = document.getElementById("carrusel");
    const p = document.getElementById("puntos");
    let t: ReturnType<typeof setInterval> | null = null;
    const limpiar: Array<() => void> = [];
    if (c && p) {
      const s = Array.from(c.children) as HTMLElement[];
      p.innerHTML = "";
      const ir = (i: number) => c.scrollTo({ left: s[i].offsetLeft - c.offsetLeft - (c.clientWidth - s[i].clientWidth) / 2, behavior: "smooth" });
      const marcar = () => {
        const m = c.scrollLeft + c.clientWidth / 2; let k = 0, d = Infinity;
        s.forEach((x, i) => { const cx = x.offsetLeft - c.offsetLeft + x.clientWidth / 2; if (Math.abs(cx - m) < d) { d = Math.abs(cx - m); k = i; } });
        Array.from(p.children).forEach((b, i) => b.classList.toggle("on", i === k));
        return k;
      };
      const parar = () => { if (t) clearInterval(t); t = null; };
      s.forEach((_, i) => { const b = document.createElement("button"); b.setAttribute("aria-label", "Ver pantalla " + (i + 1)); b.onclick = () => { ir(i); parar(); }; p.appendChild(b); });
      const onScroll = () => requestAnimationFrame(marcar);
      c.addEventListener("scroll", onScroll, { passive: true }); marcar();
      const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!quieto) t = setInterval(() => ir((marcar() + 1) % s.length), 3500);
      ["pointerdown", "wheel", "touchstart"].forEach((ev) => c.addEventListener(ev, parar, { passive: true }));
      limpiar.push(() => { c.removeEventListener("scroll", onScroll); ["pointerdown", "wheel", "touchstart"].forEach((ev) => c.removeEventListener(ev, parar)); });
    }
    return () => { io?.disconnect(); if (t) clearInterval(t); limpiar.forEach((f) => f()); };
  }, []);
  return null;
}
