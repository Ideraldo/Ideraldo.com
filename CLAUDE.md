# CLAUDE.md

Contexto para agentes que forem continuar este projeto. Leia também `docs/CONTEXTO.md` (visão completa, projetos mostrados e roadmap).

## O que é

Portfólio pessoal do Ideraldo Rui, no domínio `ideraldo.com`. Engenheiro de software backend (C#/.NET, Node/TS, Python), hoje no Itaú. O site é desenhado como uma arquitetura de serviços: o hero é um diagrama "você → gateway → serviços" e cada serviço leva a uma seção.

## Stack e comandos

- Next.js 15 (App Router) com exportação estática (`output: "export"`). O build gera `out/`, que sobe em qualquer hospedagem estática (Hostinger, Vercel, GitHub Pages).
- TypeScript. Sem Tailwind no runtime: todo o estilo é CSS puro com tokens em `src/app/globals.css`.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # gera out/
npm run lint
```

## Onde as coisas estão

- `src/content/site.ts` — todo o texto editável: `casos` (projetos nas empresas), `projetos` (projetos pessoais), `carreira`, `contato`. Mexa aqui para mudar conteúdo, não nos componentes.
- `src/lib/cache.ts` — cache-aside com single-flight, TTL com jitter e stale-on-error. É o código que a demo de cache executa de verdade.
- `src/lib/canvas.ts` — helper de canvas (DPR, tema, reduced-motion) usado pelas demos.
- `src/components/CacheDemo.tsx`, `QueueDemo.tsx` — demos interativas do `/lab`.
- `src/components/Topology.tsx` — o hero em forma de diagrama, que também é a navegação.
- `src/components/ui.tsx` — toggle de tema e botão de copiar e-mail.
- `src/app/globals.css` — tokens de cor e tipografia (tema claro e escuro) e todo o layout.

## Direção visual

Conceito "diagrama vivo" / blueprint. Paleta: cinza frio, tinta quase preta, cobalto como única cor de marca, amarelo só para os "pacotes" em trânsito nas animações. Fontes: Schibsted Grotesk (texto) e JetBrains Mono (rotas, rótulos, números). Cantos retos.

Regras de motion (seguem o Emil Kowalski): entrada única no hero, interações abaixo de 200ms, só `transform` e `opacity`, nada animando ao rolar a página, respeitar `prefers-reduced-motion`.

## Skills de design (em `.claude/skills`)

- `design-taste-frontend` (Taste Skill): estrutura e direção visual.
- `emil-design-eng` e as skills de animação do Emil: motion e micro-interações.
- `impeccable`: auditoria final (`/impeccable critique`, `/impeccable polish`).

Use **uma por etapa**. Elas têm opiniões diferentes e brigam se carregadas juntas para gerar código ao mesmo tempo.

## Preferências do Ideraldo

- Escrever em pt-BR.
- Não usar travessão (em dash) nos textos.
- Quando faltar uma informação dele, perguntar em vez de deixar placeholder tipo `[PREENCHER]`.
