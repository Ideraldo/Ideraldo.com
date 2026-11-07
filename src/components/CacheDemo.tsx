"use client";

import { useCallback, useRef, useState } from "react";
import { createCache, SNIPPET, type Outcome } from "@/lib/cache";
import { easeOut, prefersReducedMotion, sleep, useCanvas, type Palette } from "@/lib/canvas";

const CLIENTES = 40;
const TTL = 8000;
const JITTER = 2000;

type P = {
  fx: number; fy: number; tx: number; ty: number; t0: number; dur: number;
  cor: "packet" | "ok" | "warn" | "err" | "accent"; esperando?: boolean; fase: number;
};

type Stats = { req: number; hit: number; db: number; coal: number; stale: number; err: number; p95: number };
const zero: Stats = { req: 0, hit: 0, db: 0, coal: 0, stale: 0, err: 0, p95: 0 };

export default function CacheDemo() {
  const [singleFlight, setSingleFlight] = useState(true);
  const [staleOnError, setStaleOnError] = useState(true);
  const [bancoFora, setBancoFora] = useState(false);
  const [stats, setStats] = useState<Stats>(zero);
  const [rodando, setRodando] = useState(false);

  const opts = useRef({ singleFlight, staleOnError, bancoFora });
  opts.current = { singleFlight, staleOnError, bancoFora };

  const cache = useRef(createCache<string>());
  const parts = useRef<Set<P>>(new Set());
  const clientes = useRef<(Outcome | null)[]>(Array(CLIENTES).fill(null));
  const dbAtivas = useRef(0);
  const dbPico = useRef(0);
  const geo = useRef({ w: 600, h: 340 });
  const lat = useRef<number[]>([]);

  const layout = (w: number, h: number) => {
    const narrow = w < 520;
    const gx = narrow ? 14 : 24;
    const cols = narrow ? 4 : 5;
    const cell = narrow ? 13 : 16;
    const rows = Math.ceil(CLIENTES / cols);
    const gy = (h - rows * cell) / 2 + cell / 2;
    return {
      cliente: (i: number) => ({ x: gx + (i % cols) * cell, y: gy + Math.floor(i / cols) * cell }),
      bff: { x: w * (narrow ? 0.46 : 0.42), y: h / 2 },
      redis: { x: w * (narrow ? 0.8 : 0.78), y: h * 0.26 },
      db: { x: w * (narrow ? 0.8 : 0.78), y: h * 0.74 },
      narrow,
    };
  };

  const move = (p: P, to: { x: number; y: number }, dur: number) => {
    const reduce = prefersReducedMotion();
    const now = performance.now();
    const t = Math.min(1, (now - p.t0) / Math.max(p.dur, 1));
    p.fx = p.fx + (p.tx - p.fx) * easeOut(t);
    p.fy = p.fy + (p.ty - p.fy) * easeOut(t);
    p.tx = to.x; p.ty = to.y; p.t0 = now; p.dur = reduce ? 0 : dur;
    return sleep(reduce ? 0 : dur);
  };

  const requisicao = useCallback(async (i: number) => {
    const { w, h } = geo.current;
    const L = layout(w, h);
    const c = L.cliente(i);
    const p: P = { fx: c.x, fy: c.y, tx: c.x, ty: c.y, t0: 0, dur: 0, cor: "packet", fase: Math.random() * 6.28 };
    parts.current.add(p);
    clientes.current[i] = null;
    const inicio = performance.now();

    await move(p, L.bff, 280);

    const loader = async () => {
      setStats((s) => ({ ...s, db: s.db + 1 }));
      dbAtivas.current++;
      dbPico.current = Math.max(dbPico.current, dbAtivas.current);
      try {
        await move(p, L.db, 260);
        // Contenção: quanto mais consultas simultâneas, mais lento o banco responde.
        await sleep(420 + dbAtivas.current * 22);
        if (opts.current.bancoFora) throw new Error("banco fora do ar");
        return "quarto-123";
      } finally {
        dbAtivas.current--;
        await move(p, L.bff, 260);
      }
    };

    const r = await cache.current.get("hotel:123:amenities", loader, { ...opts.current, ttlMs: TTL, jitterMs: JITTER }, (leader) => {
      if (!leader) { p.esperando = true; p.cor = "accent"; }
    });
    p.esperando = false;
    p.cor = r.outcome === "error" ? "err" : r.outcome === "stale" ? "warn" : "ok";
    await move(p, c, 280);
    parts.current.delete(p);
    clientes.current[i] = r.outcome;

    const ms = performance.now() - inicio;
    lat.current.push(ms);
    const sorted = [...lat.current].sort((a, b) => a - b);
    const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
    setStats((s) => ({
      ...s,
      req: s.req + 1,
      hit: s.hit + (r.outcome === "hit" ? 1 : 0),
      coal: s.coal + (r.outcome === "coalesced" ? 1 : 0),
      stale: s.stale + (r.outcome === "stale" ? 1 : 0),
      err: s.err + (r.outcome === "error" ? 1 : 0),
      p95: Math.round(p95),
    }));
  }, []);

  const disparar = async () => {
    setRodando(true);
    setStats(zero);
    clientes.current = Array(CLIENTES).fill(null);
    lat.current = [];
    dbPico.current = 0;
    const jobs: Promise<void>[] = [];
    for (let i = 0; i < CLIENTES; i++) {
      jobs.push(requisicao(i));
      await sleep(prefersReducedMotion() ? 0 : 12);
    }
    await Promise.all(jobs);
    setRodando(false);
  };

  const ref = useCanvas((ctx, w, h, pal, t) => {
    geo.current = { w, h };
    const L = layout(w, h);
    const cor = (k: P["cor"]) => (k === "accent" ? pal.accent : (pal as Palette)[k]);

    // Ligações
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 1;
    const line = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    };
    line({ x: L.cliente(0).x + (L.narrow ? 50 : 70), y: L.bff.y }, L.bff);
    line(L.bff, L.redis);
    line(L.bff, L.db);
    ctx.setLineDash([]);

    // Clientes
    for (let i = 0; i < CLIENTES; i++) {
      const c = L.cliente(i);
      const o = clientes.current[i];
      ctx.fillStyle =
        o === "error" ? pal.err : o === "stale" ? pal.warn : o ? pal.ok : pal.line;
      ctx.beginPath(); ctx.arc(c.x, c.y, L.narrow ? 3.5 : 4.5, 0, Math.PI * 2); ctx.fill();
    }

    // Nós
    const node = (x: number, y: number, label: string, sub: string, hl = false, bad = false) => {
      const nw = L.narrow ? 84 : 112, nh = 50;
      ctx.fillStyle = pal.raised;
      ctx.strokeStyle = bad ? pal.err : hl ? pal.accent : pal.line;
      ctx.lineWidth = hl || bad ? 1.5 : 1;
      ctx.beginPath(); ctx.rect(x - nw / 2, y - nh / 2, nw, nh); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.ink;
      ctx.font = `600 12px ${pal.mono}`;
      ctx.textAlign = "center";
      ctx.fillText(label, x, y - 4);
      ctx.fillStyle = bad ? pal.err : pal.muted;
      ctx.font = `400 10.5px ${pal.mono}`;
      ctx.fillText(sub, x, y + 12);
      return { nw, nh };
    };

    node(L.bff.x, L.bff.y, "BFF", opts.current.singleFlight ? "single-flight" : "sem coalescer", true);

    const e = cache.current.peek("hotel:123:amenities");
    const restante = e ? Math.max(0, e.expiresAt - performance.now()) : 0;
    const r = node(L.redis.x, L.redis.y, "Redis", e ? (restante > 0 ? `TTL ${(restante / 1000).toFixed(1)}s` : "expirado") : "vazio");
    if (e && restante > 0) {
      const bw = r.nw - 16;
      ctx.fillStyle = pal.line;
      ctx.fillRect(L.redis.x - bw / 2, L.redis.y + r.nh / 2 - 6, bw, 2);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(L.redis.x - bw / 2, L.redis.y + r.nh / 2 - 6, bw * Math.min(1, restante / (TTL + JITTER)), 2);
    }

    node(
      L.db.x, L.db.y, "Banco",
      opts.current.bancoFora ? "fora do ar" : `${dbAtivas.current} consulta${dbAtivas.current === 1 ? "" : "s"}`,
      false, opts.current.bancoFora,
    );

    // Pacotes
    for (const p of parts.current) {
      let x: number, y: number;
      if (p.esperando) {
        const a = t / 380 + p.fase;
        x = L.bff.x + Math.cos(a) * (L.narrow ? 54 : 82);
        y = L.bff.y + Math.sin(a) * (L.narrow ? 40 : 46);
      } else {
        const k = p.dur ? Math.min(1, (t - p.t0) / p.dur) : 1;
        const e2 = easeOut(Math.max(0, k));
        x = p.fx + (p.tx - p.fx) * e2;
        y = p.fy + (p.ty - p.fy) * e2;
      }
      ctx.fillStyle = cor(p.cor);
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
    }
  });

  const pctHit = stats.req ? Math.round((stats.hit / stats.req) * 100) : 0;

  return (
    <div className="demo">
      <div className="demo-stage">
        <canvas ref={ref} className="demo-canvas cache-canvas" aria-label="Animação de 40 requisições passando pelo BFF, pelo Redis e pelo banco de dados" role="img" />
        <div className="demo-controls">
          <button className="btn btn-primary" onClick={disparar} disabled={rodando}>
            {rodando ? "Requisições em andamento" : "Disparar 40 requisições"}
          </button>
          <button className="btn" onClick={() => cache.current.expire("hotel:123:amenities")}>Expirar cache</button>
          <label className="toggle"><input type="checkbox" checked={singleFlight} onChange={(e) => setSingleFlight(e.target.checked)} /><span>Single-flight</span></label>
          <label className="toggle"><input type="checkbox" checked={staleOnError} onChange={(e) => setStaleOnError(e.target.checked)} /><span>Stale-on-error</span></label>
          <label className="toggle toggle-bad"><input type="checkbox" checked={bancoFora} onChange={(e) => setBancoFora(e.target.checked)} /><span>Banco fora do ar</span></label>
        </div>
      </div>

      <aside className="demo-side">
        <dl className="metrics">
          <div className="metric metric-big"><dt>Consultas ao banco</dt><dd>{stats.db}</dd></div>
          <div className="metric"><dt>Requisições</dt><dd>{stats.req}</dd></div>
          <div className="metric"><dt>Hits no cache</dt><dd>{pctHit}%</dd></div>
          <div className="metric"><dt>Coalescidas</dt><dd>{stats.coal}</dd></div>
          <div className="metric"><dt>p95</dt><dd>{stats.p95} ms</dd></div>
          <div className="metric"><dt>Stale</dt><dd className={stats.stale ? "is-warn" : ""}>{stats.stale}</dd></div>
          <div className="metric"><dt>Erros</dt><dd className={stats.err ? "is-err" : ""}>{stats.err}</dd></div>
        </dl>
        <pre className="code" aria-label="Trecho do código de single-flight"><code>{SNIPPET}</code></pre>
      </aside>
    </div>
  );
}
