"use client";

import { useEffect, useRef } from "react";

export type Palette = {
  bg: string; surface: string; raised: string; ink: string; muted: string; line: string;
  accent: string; packet: string; ok: string; warn: string; err: string;
  mono: string; sans: string;
};

export function readPalette(el: Element): Palette {
  const s = getComputedStyle(el);
  const v = (n: string) => s.getPropertyValue(n).trim();
  return {
    bg: v("--bg"), surface: v("--surface"), raised: v("--raised"), ink: v("--ink"),
    muted: v("--muted"), line: v("--line"), accent: v("--accent"), packet: v("--packet"),
    ok: v("--ok"), warn: v("--warn"), err: v("--err"),
    mono: v("--font-mono") || "monospace", sans: v("--font-sans") || "sans-serif",
  };
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Canvas com DPR correto, que redesenha a cada frame enquanto está visível na tela.
export function useCanvas(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, pal: Palette, t: number) => void,
) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0, visible = true;
    let pal = readPalette(canvas);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) loop(performance.now());
    });
    io.observe(canvas);

    // Troca de tema: relê as cores.
    const refresh = () => { pal = readPalette(canvas); };
    const mo = new MutationObserver(refresh);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", refresh);

    function loop(t: number) {
      cancelAnimationFrame(raf);
      if (!visible) return;
      ctx!.clearRect(0, 0, w, h);
      drawRef.current(ctx!, w, h, pal, t);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect(); mo.disconnect();
      mq.removeEventListener("change", refresh);
    };
  }, []);

  return ref;
}

export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
