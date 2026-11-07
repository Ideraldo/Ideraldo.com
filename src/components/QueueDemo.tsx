"use client";

import { useEffect, useRef, useState } from "react";
import { easeOut, prefersReducedMotion, useCanvas } from "@/lib/canvas";

// Fila de trabalho com consumidores concorrentes, retry com backoff exponencial e dead letter queue.
// Mesmo modelo de uma fila no RabbitMQ ou no Azure Service Bus.

const MAX_TENTATIVAS = 3;
const PROCESSAMENTO_MS = 900;

type Msg = { id: number; tentativas: number; prontaEm: number };
type Consumidor = { msg?: Msg; inicio: number; fim: number; falha: boolean };
type Voo = { fx: number; fy: number; tx: number; ty: number; t0: number; dur: number; cor: "packet" | "ok" | "warn" | "err" };

export default function QueueDemo() {
  const [taxa, setTaxa] = useState(3);
  const [nCons, setNCons] = useState(2);
  const [falha, setFalha] = useState(15);
  const [rodando, setRodando] = useState(true);
  const [m, setM] = useState({ fila: 0, ok: 0, retries: 0, dlq: 0, vazao: 0 });

  const cfg = useRef({ taxa, nCons, falha, rodando });
  cfg.current = { taxa, nCons, falha, rodando };

  const sim = useRef({
    fila: [] as Msg[],
    cons: [] as Consumidor[],
    voos: new Set<Voo>(),
    acks: [] as number[],
    seq: 0, acumulado: 0, ok: 0, retries: 0, dlq: 0,
    ultimo: 0, relogio: 0, ultimoSet: 0,
  });

  useEffect(() => {
    if (prefersReducedMotion()) setRodando(false);
  }, []);

  const limpar = () => {
    const s = sim.current;
    s.fila = []; s.cons = []; s.voos.clear(); s.acks = [];
    s.ok = 0; s.retries = 0; s.dlq = 0; s.acumulado = 0;
    setM({ fila: 0, ok: 0, retries: 0, dlq: 0, vazao: 0 });
  };

  const ref = useCanvas((ctx, w, h, pal, t) => {
    const s = sim.current;
    const narrow = w < 520;
    const dt = s.ultimo ? Math.min(100, t - s.ultimo) : 16;
    s.ultimo = t;
    const { taxa, nCons, falha, rodando } = cfg.current;

    // Geometria
    const prod = { x: narrow ? 34 : 60, y: h * 0.42 };
    const lane = { x0: narrow ? 70 : 118, x1: w * (narrow ? 0.62 : 0.6), y: h * 0.42 };
    const consX = w * (narrow ? 0.84 : 0.82);
    const consY = (i: number) => h * 0.12 + (i + 0.5) * ((h * 0.6) / nCons);
    const dlq = { x: (lane.x0 + lane.x1) / 2, y: h * 0.85 };
    const fim = { x: w - 10 };

    const voar = (fx: number, fy: number, tx: number, ty: number, cor: Voo["cor"], dur = 260) =>
      s.voos.add({ fx, fy, tx, ty, t0: t, dur: prefersReducedMotion() ? 0 : dur, cor });

    // Simulação
    if (rodando) {
      s.relogio += dt;
      const agora = s.relogio;
      while (s.cons.length < nCons) s.cons.push({ inicio: 0, fim: 0, falha: false });
      if (s.cons.length > nCons) {
        // Consumidor desligado devolve a mensagem para a fila, como um nack.
        for (const c of s.cons.splice(nCons)) if (c.msg) s.fila.unshift(c.msg);
      }

      s.acumulado += (dt / 1000) * taxa;
      while (s.acumulado >= 1) {
        s.acumulado -= 1;
        s.fila.push({ id: ++s.seq, tentativas: 0, prontaEm: 0 });
        voar(prod.x, prod.y, lane.x0, lane.y, "packet", 180);
      }

      s.cons.forEach((c, i) => {
        if (c.msg && agora >= c.fim) {
          const msg = c.msg;
          c.msg = undefined;
          if (c.falha) {
            msg.tentativas++;
            if (msg.tentativas >= MAX_TENTATIVAS) {
              s.dlq++;
              voar(consX, consY(i), dlq.x, dlq.y, "err", 420);
            } else {
              s.retries++;
              // Backoff exponencial: 400ms, 800ms...
              msg.prontaEm = agora + 400 * 2 ** (msg.tentativas - 1);
              s.fila.push(msg);
              voar(consX, consY(i), lane.x0, lane.y, "warn", 420);
            }
          } else {
            s.ok++;
            s.acks.push(agora);
            voar(consX, consY(i), fim.x, consY(i), "ok", 240);
          }
        }
        if (!c.msg) {
          const idx = s.fila.findIndex((q) => q.prontaEm <= agora);
          if (idx >= 0) {
            const [msg] = s.fila.splice(idx, 1);
            c.msg = msg;
            c.inicio = agora;
            c.fim = agora + PROCESSAMENTO_MS * (0.8 + Math.random() * 0.4);
            c.falha = Math.random() * 100 < falha;
            voar(lane.x1, lane.y, consX, consY(i), msg.tentativas ? "warn" : "packet", 220);
          }
        }
      });

      s.acks = s.acks.filter((a) => agora - a < 5000);
      if (t - s.ultimoSet > 250) {
        s.ultimoSet = t;
        setM({ fila: s.fila.length, ok: s.ok, retries: s.retries, dlq: s.dlq, vazao: s.acks.length / 5 });
      }
    }

    // Desenho
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(prod.x, prod.y); ctx.lineTo(lane.x0, lane.y); ctx.stroke();
    for (let i = 0; i < nCons; i++) {
      ctx.beginPath(); ctx.moveTo(lane.x1, lane.y); ctx.lineTo(consX - 22, consY(i)); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(dlq.x, lane.y + 18); ctx.lineTo(dlq.x, dlq.y - 16); ctx.stroke();
    ctx.setLineDash([]);

    const label = (txt: string, x: number, y: number, cor = pal.muted, peso = 400) => {
      ctx.fillStyle = cor; ctx.font = `${peso} 10.5px ${pal.mono}`; ctx.textAlign = "center"; ctx.fillText(txt, x, y);
    };

    // Produtor
    ctx.fillStyle = pal.raised; ctx.strokeStyle = pal.line;
    ctx.beginPath(); ctx.arc(prod.x, prod.y, narrow ? 16 : 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    label(`${taxa}/s`, prod.x, prod.y + 4, pal.ink, 600);
    label("produtor", prod.x, prod.y + (narrow ? 32 : 38));

    // Fila
    const laneW = lane.x1 - lane.x0;
    ctx.fillStyle = pal.raised; ctx.strokeStyle = s.fila.length > 20 ? pal.warn : pal.line;
    ctx.lineWidth = s.fila.length > 20 ? 1.5 : 1;
    ctx.beginPath(); ctx.rect(lane.x0, lane.y - 16, laneW, 32); ctx.fill(); ctx.stroke();
    const passo = 12;
    const cabem = Math.floor((laneW - 12) / passo);
    s.fila.slice(0, cabem).forEach((q, i) => {
      const x = lane.x1 - 10 - i * passo;
      ctx.globalAlpha = q.prontaEm > s.relogio ? 0.35 : 1;
      ctx.fillStyle = q.tentativas ? pal.warn : pal.accent;
      ctx.fillRect(x - 4, lane.y - 4, 8, 8);
    });
    ctx.globalAlpha = 1;
    if (s.fila.length > cabem) label(`+${s.fila.length - cabem}`, lane.x0 + 16, lane.y + 4, pal.warn, 600);
    label(`fila · ${s.fila.length} msg`, (lane.x0 + lane.x1) / 2, lane.y - 26);

    // Consumidores
    s.cons.slice(0, nCons).forEach((c, i) => {
      const y = consY(i);
      ctx.fillStyle = pal.raised; ctx.strokeStyle = c.msg ? pal.accent : pal.line; ctx.lineWidth = c.msg ? 1.5 : 1;
      ctx.beginPath(); ctx.rect(consX - 22, y - 14, 44, 28); ctx.fill(); ctx.stroke();
      if (c.msg) {
        const k = Math.min(1, (s.relogio - c.inicio) / (c.fim - c.inicio));
        ctx.fillStyle = c.msg.tentativas ? pal.warn : pal.accent;
        ctx.fillRect(consX - 18, y + 8, 36 * k, 2);
        label(`#${c.msg.id}`, consX, y + 3, pal.ink, 600);
      } else {
        label("livre", consX, y + 3);
      }
    });
    label("consumidores", consX, h * 0.08);

    // DLQ
    ctx.fillStyle = pal.raised; ctx.strokeStyle = s.dlq ? pal.err : pal.line; ctx.lineWidth = s.dlq ? 1.5 : 1;
    ctx.beginPath(); ctx.rect(dlq.x - 46, dlq.y - 15, 92, 30); ctx.fill(); ctx.stroke();
    label(`DLQ · ${s.dlq}`, dlq.x, dlq.y + 4, s.dlq ? pal.err : pal.muted, 600);

    // Mensagens em trânsito
    for (const v of s.voos) {
      const k = v.dur ? Math.min(1, (t - v.t0) / v.dur) : 1;
      const e = easeOut(k);
      ctx.fillStyle = pal[v.cor];
      ctx.fillRect(v.fx + (v.tx - v.fx) * e - 3.5, v.fy + (v.ty - v.fy) * e - 3.5, 7, 7);
      if (k >= 1) s.voos.delete(v);
    }
  });

  // Capacidade: cada consumidor processa ~1/0,9 msg/s; falhas voltam para a fila e consomem capacidade de novo.
  const capacidade = nCons / (PROCESSAMENTO_MS / 1000);
  const carga = taxa / Math.max(0.05, 1 - falha / 100);
  const crescendo = carga > capacidade;
  const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

  return (
    <div className="demo">
      <div className="demo-stage">
        <canvas ref={ref} className="demo-canvas queue-canvas" role="img" aria-label="Animação de mensagens saindo do produtor, passando pela fila e chegando aos consumidores, com retentativas e dead letter queue" />
        <div className="demo-controls demo-sliders">
          <label className="slider">
            <span>Mensagens por segundo <b>{taxa}</b></span>
            <input type="range" min={1} max={12} step={1} value={taxa} onChange={(e) => setTaxa(+e.target.value)} />
          </label>
          <label className="slider">
            <span>Consumidores <b>{nCons}</b></span>
            <input type="range" min={1} max={6} step={1} value={nCons} onChange={(e) => setNCons(+e.target.value)} />
          </label>
          <label className="slider">
            <span>Taxa de falha <b>{falha}%</b></span>
            <input type="range" min={0} max={60} step={5} value={falha} onChange={(e) => setFalha(+e.target.value)} />
          </label>
          <div className="demo-buttons">
            <button className="btn btn-primary" onClick={() => setRodando((r) => !r)}>{rodando ? "Pausar" : "Retomar"}</button>
            <button className="btn" onClick={limpar}>Limpar</button>
          </div>
        </div>
      </div>

      <aside className="demo-side">
        <dl className="metrics">
          <div className="metric metric-big"><dt>Na fila</dt><dd className={m.fila > 20 ? "is-warn" : ""}>{m.fila}</dd></div>
          <div className="metric"><dt>Processadas</dt><dd>{m.ok}</dd></div>
          <div className="metric"><dt>Vazão</dt><dd>{fmt(m.vazao)} msg/s</dd></div>
          <div className="metric"><dt>Retentativas</dt><dd>{m.retries}</dd></div>
          <div className="metric"><dt>Dead letter</dt><dd className={m.dlq ? "is-err" : ""}>{m.dlq}</dd></div>
        </dl>
        <p className={`diagnose ${crescendo ? "is-warn" : "is-ok"}`} aria-live="polite">
          {crescendo
            ? `A fila vai crescer. Chegam cerca de ${fmt(carga)} msg/s contando as retentativas, e ${nCons} consumidor${nCons > 1 ? "es dão" : " dá"} conta de ${fmt(capacidade)} msg/s. Adicione consumidores.`
            : `Estável. Chegam cerca de ${fmt(carga)} msg/s contando as retentativas, e a capacidade é de ${fmt(capacidade)} msg/s.`}
        </p>
        <p className="demo-note">Depois de {MAX_TENTATIVAS} falhas, a mensagem vai para a dead letter queue em vez de travar a fila. Entre uma tentativa e outra, o backoff dobra a espera.</p>
      </aside>
    </div>
  );
}
