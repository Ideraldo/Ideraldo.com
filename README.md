# ideraldo.com

Portfólio pessoal do Ideraldo Rui. O site é desenhado como uma arquitetura de serviços, e as demos rodam na própria página.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera o site estático em out/
```

O build é uma exportação estática (`out/`), que sobe em qualquer hospedagem: Hostinger, Vercel, Cloudflare Pages ou GitHub Pages.

## Estrutura

| Caminho | O que tem |
| --- | --- |
| `src/content/site.ts` | Todo o texto: projetos, carreira, contato |
| `src/lib/cache.ts` | Cache-aside com single-flight, TTL com jitter e stale-on-error. É o código que a demo executa |
| `src/components/CacheDemo.tsx` | Demo de 40 requisições simultâneas contra o cache |
| `src/components/QueueDemo.tsx` | Fila com consumidores concorrentes, retry com backoff e dead letter queue |
| `src/components/Topology.tsx` | Hero em forma de diagrama, que também serve de navegação |
| `src/app/globals.css` | Tokens de cor, tipografia e todo o estilo |

## Skills de design (Claude Code)

Em `.claude/skills`:

- `design-taste-frontend` (Taste Skill): estrutura e direção visual
- `emil-design-eng` e as skills de animação do Emil Kowalski: motion e micro-interações
- `impeccable`: auditoria final (`/impeccable critique`, `/impeccable polish`)

Use uma por etapa. Elas têm opiniões diferentes e brigam se carregadas juntas.

## Próximas fases

1. **API própria** em .NET 10 (`api.ideraldo.com`), com as demos de cache e fila falando com o backend real
2. **SignalR**: duas telas sincronizadas em tempo real
3. **RAG** sobre os projetos e o currículo, com rate limit e cache para controlar custo
