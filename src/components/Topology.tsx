"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/canvas";

type Servico = { id: string; rota: string; meta: string };

const SERVICOS: Servico[] = [
  { id: "carreira", rota: "/carreira", meta: "5 anos · 3 empresas" },
  { id: "projetos", rota: "/projetos", meta: "projetos pessoais" },
  { id: "lab", rota: "/lab", meta: "demos ao vivo" },
  { id: "contato", rota: "/contato", meta: "e-mail · LinkedIn" },
];

type Geo = {
  vb: string;
  visitante: { x: number; y: number };
  gateway: { x: number; y: number };
  servico: (i: number) => { x: number; y: number };
  nw: number;
};

const LARGO: Geo = {
  vb: "0 0 560 360",
  visitante: { x: 52, y: 180 },
  gateway: { x: 210, y: 180 },
  servico: (i) => ({ x: 450, y: 48 + i * 88 }),
  nw: 168,
};

const ESTREITO: Geo = {
  vb: "0 0 340 380",
  visitante: { x: 170, y: 30 },
  gateway: { x: 170, y: 120 },
  servico: (i) => ({ x: i % 2 ? 254 : 86, y: 236 + Math.floor(i / 2) * 92 }),
  nw: 150,
};

function curva(a: { x: number; y: number }, b: { x: number; y: number }, vertical: boolean) {
  if (vertical) {
    const my = (a.y + b.y) / 2;
    return `M${a.x},${a.y} C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`;
  }
  const mx = (a.x + b.x) / 2;
  return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
}

export default function Topology() {
  const [estreito, setEstreito] = useState(false);
  const [log, setLog] = useState<string[]>(["GET / → 200"]);
  const svgRef = useRef<SVGSVGElement>(null);
  const g = estreito ? ESTREITO : LARGO;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const f = () => setEstreito(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);

  const borda = (i: number) => {
    const s = g.servico(i);
    return estreito ? { x: s.x, y: s.y - 24 } : { x: s.x - g.nw / 2, y: s.y };
  };
  const saidaGateway = estreito ? { x: g.gateway.x, y: g.gateway.y + 24 } : { x: g.gateway.x + 60, y: g.gateway.y };
  const entradaGateway = estreito ? { x: g.gateway.x, y: g.gateway.y - 24 } : { x: g.gateway.x - 60, y: g.gateway.y };
  const saidaVisitante = estreito ? { x: g.visitante.x, y: g.visitante.y + 14 } : { x: g.visitante.x + 22, y: g.visitante.y };

  // Anima um pacote ao longo dos caminhos indicados, em sequência.
  const enviar = useCallback((ids: string[], atraso = 0) => {
    const svg = svgRef.current;
    if (!svg || prefersReducedMotion()) return;
    const paths = ids.map((id) => svg.querySelector<SVGPathElement>(`[data-edge="${id}"]`)).filter(Boolean) as SVGPathElement[];
    if (!paths.length) return;
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("r", "4");
    dot.setAttribute("class", "packet");
    dot.style.opacity = "0";
    svg.appendChild(dot);
    const porTrecho = 380;
    let inicio = 0;
    const tick = (t: number) => {
      if (!inicio) inicio = t + atraso;
      const dt = t - inicio;
      if (dt < 0) return requestAnimationFrame(tick);
      const i = Math.floor(dt / porTrecho);
      if (i >= paths.length) {
        dot.remove();
        paths[paths.length - 1].closest("g")?.classList.add("is-hit");
        return;
      }
      const k = (dt % porTrecho) / porTrecho;
      const e = 1 - Math.pow(1 - k, 3);
      const p = paths[i].getPointAtLength(paths[i].getTotalLength() * e);
      dot.setAttribute("cx", String(p.x));
      dot.setAttribute("cy", String(p.y));
      dot.style.opacity = "1";
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // Entrada: uma requisição para cada serviço, uma vez só.
  useEffect(() => {
    SERVICOS.forEach((s, i) => enviar(["in", s.id], 500 + i * 140));
  }, [enviar, estreito]);

  const abrir = (s: Servico) => {
    enviar([s.id]);
    setLog((l) => [`GET ${s.rota} → 200`, ...l].slice(0, 3));
    document.getElementById(s.id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <figure className="topology">
      <svg ref={svgRef} viewBox={g.vb} role="group" aria-label="Mapa do site desenhado como uma arquitetura de serviços">
        <path data-edge="in" className="edge" d={curva(saidaVisitante, entradaGateway, estreito)} />
        {SERVICOS.map((s, i) => (
          <path key={s.id} data-edge={s.id} className="edge" d={curva(saidaGateway, borda(i), estreito)} />
        ))}

        <g className="node node-visitor" aria-hidden="true">
          <circle cx={g.visitante.x} cy={g.visitante.y} r={estreito ? 14 : 22} />
          <text x={g.visitante.x} y={g.visitante.y + (estreito ? 0 : 40)} dx={estreito ? 26 : 0} dy={estreito ? 4 : 0} textAnchor={estreito ? "start" : "middle"} className="t-muted">você</text>
        </g>

        <g className="node node-gateway" aria-hidden="true">
          <rect x={g.gateway.x - 60} y={g.gateway.y - 24} width={120} height={48} />
          <text x={g.gateway.x} y={g.gateway.y - 3} textAnchor="middle" className="t-strong">gateway</text>
          <text x={g.gateway.x} y={g.gateway.y + 13} textAnchor="middle" className="t-muted">ideraldo.com</text>
        </g>

        {SERVICOS.map((s, i) => {
          const p = g.servico(i);
          return (
            <g
              key={s.id}
              className="node node-service"
              tabIndex={0}
              role="link"
              aria-label={`Ir para ${s.rota.slice(1)}`}
              onClick={() => abrir(s)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), abrir(s))}
              onMouseEnter={() => enviar([s.id])}
            >
              <rect x={p.x - g.nw / 2} y={p.y - 24} width={g.nw} height={48} />
              <circle className="status" cx={p.x - g.nw / 2 + 14} cy={p.y - 6} r={3} />
              <text x={p.x - g.nw / 2 + 24} y={p.y - 2} className="t-strong">{s.rota}</text>
              <text x={p.x - g.nw / 2 + 14} y={p.y + 14} className="t-muted">{s.meta}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="topology-log" aria-live="polite">
        {log.map((l, i) => (
          <span key={`${l}-${i}`} className={i === 0 ? "is-new" : ""}>{l}</span>
        ))}
      </figcaption>
    </figure>
  );
}
