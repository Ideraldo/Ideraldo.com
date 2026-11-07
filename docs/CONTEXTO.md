# Contexto do projeto ideraldo.com

Documento de referência para continuar o portfólio. O `CLAUDE.md` na raiz tem o resumo rápido e o mapa do código; aqui está o porquê de cada decisão, os projetos que o site mostra e o roadmap.

## 1. Objetivo do site

Portfólio de um engenheiro de software backend (Ideraldo Rui, São Paulo, hoje no Itaú). O alvo são vagas de backend e IA aplicada, pleno para sênior, remoto nacional e internacional, e também vagas fullstack, então o front precisa ser bonito e responsivo. O site não foca em segurança ofensiva.

A tese: polimento virou barato com IA, então o que diferencia é personalidade e prova de trabalho. Em vez de um portfólio genérico, o site é desenhado como um sistema (um backend que pensa em arquitetura) e traz demos e projetos reais.

## 2. Direção visual: "diagrama vivo"

Escolhida entre quatro direções. O site inteiro usa a linguagem de um diagrama de arquitetura (papel de blueprint quadriculado, nós, conexões, pacotes em trânsito).

- Hero: diagrama "você → gateway → serviços". Cada serviço é um link para uma seção. Ao clicar ou passar o mouse, um pacote percorre o caminho.
- Paleta: cinza frio, tinta quase preta, cobalto (única cor de marca), amarelo só para pacotes. A primeira sugestão da Taste Skill foi preto com verde-limão, descartada por ser o clichê visual de IA.
- Fontes: Schibsted Grotesk e JetBrains Mono. Tema claro e escuro, seguindo o sistema e com toggle manual.

Ver `CLAUDE.md` para as regras de motion e as skills de design.

## 3. Estrutura das seções (nesta ordem)

1. **Hero** — quem é, uma frase, e o diagrama-navegação.
2. **/carreira** — timeline (Itaú, TELUS, GFT, FIAP) e stack. Dentro dela, o bloco "O que construí nas empresas": três casos (rede de hotéis, RAG, gestora de investimentos) desenhados como fluxos. Os nós em cobalto, com legenda, marcam "minha parte no sistema".
3. **/projetos** — projetos pessoais (ver seção 4 abaixo).
4. **/lab** — demos interativas (ver seção 5).
5. **/contato** — e-mail, LinkedIn, GitHub.

A ordem foi pedida assim: primeiro quem eu sou e minha carreira, depois o que construí por conta própria, depois as demos ao vivo, por último contato.

## 4. Projetos pessoais mostrados

Quatro em destaque, escolhidos por serem os mais recentes e elaborados, cobrindo frentes diferentes (IA/produto, sistemas distribuídos, fullstack, engenharia de software). Os dados estão em `src/content/site.ts` (`projetos`). Os repositórios podem ser privados; a intenção é linkar o site no ar quando houver.

| Nome no site | Repositório | O que é | Stack |
|---|---|---|---|
| **Estuda10** | `smart-text-quiz` | SaaS que gera provas e simulados a partir de PDFs e anotações, com RAG sobre documentos indexados. Billing e e-mails transacionais. Nasceu para a mãe do Ideraldo, professora. | React, Supabase (Postgres + pgvector, Auth, Storage, Edge Functions em Deno), Google Gemini (geração e embeddings), Stripe. Site: estuda10.com.br |
| **Ideraldinho** | `Self-hosted-voice-assistant` | Assistente de voz cliente-servidor para substituir uma Alexa sem perder portabilidade. Dois processos desde o primeiro commit: o aparelho capta, transcreve (faster-whisper) e fala (Piper) localmente; o gateway guarda o LLM, os segredos e as ferramentas que precisam de internet. Timers e alarmes sempre no aparelho. Hoje roda num PC; o Raspberry Pi vem depois. | Python, faster-whisper (STT), Piper (TTS), LLM via gateway, WebSocket, Spotify e busca web como tools |
| **RuiFinance** | `RuiFinance` | App pessoal de controle financeiro que o Ideraldo usa no dia a dia. | Next.js, Supabase, TypeScript, Vercel. Site: financas.ideraldo.com |
| **Dragons** | `DragonKingdom` | Jogo de cartas estilo Reigns num reino medieval. Motor de regras em Dart puro (testável isolado, reutilizável), ~278 cartas como dados declarativos, e um teste automático que quebra o build se uma carta cita algo que a partida não viveu (regra de coerência). Vale Vivo em 2D com Flame. | Flutter, Dart, Flame, Riverpod. Playtest: dragons-playtest.pages.dev |

Outros repositórios do Ideraldo, não destacados no site: `DesdeQuinta` (app da banda, Firestore, offline-first, no ar em banda.ideraldo.com), `Analise-de-Tumores-Cerebrais` (CNN com MobileNetV2 para MRI, projeto de faculdade), `RodrigoPersonal` (site estático de personal trainer), `Sharkk` (framework de segurança ofensiva, deixado de fora por não ser o foco das vagas).

### Como os projetos se relacionam

São projetos independentes, mas contam uma história coerente: o Ideraldo pega IA aplicada (Estuda10), sistemas distribuídos e hardware (Ideraldinho), produto fullstack (RuiFinance) e engenharia de software com disciplina de testes (Dragons). No roadmap (seção 6), o próprio site vira mais um desses sistemas, com uma API real que pode inclusive indexar esses projetos para o RAG do "Pergunte ao Ideraldo".

## 5. As demos do /lab

Duas demos rodam no navegador, em código real (não vídeo, não gif):

- **Cache-aside** (`CacheDemo.tsx` + `src/lib/cache.ts`): 40 requisições simultâneas contra o cache vazio. Com single-flight, uma consulta ao banco; sem ele, 40. Mostra TTL com jitter e stale-on-error. Vem do trabalho real nos BFFs da rede de hotéis.
- **Fila de mensagens** (`QueueDemo.tsx`): consumidores concorrentes, retry com backoff exponencial e dead letter queue, como RabbitMQ ou Azure Service Bus. Sliders de volume, consumidores e taxa de falha.

Ressalva importante (decisão em aberto): o Ideraldo acha que as demos podem parecer "placeholder de documentação". O plano é substituí-las, no médio prazo, por um sistema real dele (ver roadmap), e aí a visualização passa a mostrar o tráfego de verdade.

## 6. Roadmap

1. **Fase 1 (feita):** site estático em Next.js, hero-diagrama, seções, duas demos no navegador. No ar como arquivo estático.
2. **Fase 2:** API própria em .NET 10 em `api.ideraldo.com` (o Ideraldo usa Hostinger para VPS). As demos de cache e fila passam a falar com o backend real. SignalR para sincronizar duas telas em tempo real (ex.: abrir o site no celular via QR code e ver o reflexo no desktop).
3. **Fase 3:** "Pergunte ao Ideraldo", um RAG sobre a carreira e os projetos, rodando nessa API. Diferente de respostas pré-definidas, mostra os trechos recuperados com score de similaridade antes da resposta em streaming, com citação. Precisa de rate limit e cache para não estourar custo de LLM. Esse sistema usaria de verdade o cache, a fila e o SignalR hoje simulados, e o /lab vira o painel dele.

## 7. Estado atual e decisões tomadas

- Site da fase 1 no repositório, branch `main`.
- Hero cita "o maior banco da América Latina" (Itaú), sem detalhes internos do projeto do banco.
- Nos casos das empresas, os clientes aparecem genéricos: "rede global de hotéis" (Best Western) e "gestora de investimentos dos EUA" (a alocação na HarbourVest pela GFT). Decisão em aberto: usar os nomes reais se já estiverem no LinkedIn do Ideraldo.
- Telefone fora do site (só e-mail, LinkedIn, GitHub), para evitar spam.

## 8. Pendências

- Links dos projetos pessoais: Estuda10 (estuda10.com.br), RuiFinance (financas.ideraldo.com) e Dragons (playtest em dragons-playtest.pages.dev) já estão linkados. O Ideraldinho não tem site (roda local); fica sem link até haver um vídeo de demonstração ou algo equivalente.
- Decidir se as demos do /lab ficam como estão ou viram o sistema real da fase 3.
- Evolução visual: a grade do fundo reagindo ao cursor e a trilha tracejada ligando as seções já estão implementadas (`GridGlow` em `components/ui.tsx`; `.grid-glow`, `.rail` e os nós em `.route::before` no `globals.css`). Falta o log do hero mostrar tráfego real, que depende da API da fase 2.
