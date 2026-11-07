// Todo o texto do site num lugar só, para editar sem mexer nos componentes.

export const contato = {
  email: "ruibiecco@gmail.com",
  linkedin: "https://www.linkedin.com/in/ideraldorui",
  github: "https://github.com/Ideraldo",
};

export type Caso = {
  id: string;
  onde: string;
  titulo: string;
  resumo: string;
  pontos: string[];
  stack: string[];
  // Fluxo desenhado no cartão: cada item vira um nó, ligados em sequência.
  fluxo: string[];
  minhaParte: string[]; // nós em que o Ideraldo trabalhou diretamente
};

export const casos: Caso[] = [
  {
    id: "hotelaria",
    onde: "TELUS Digital · rede global de hotéis",
    titulo: "Plataforma de reservas do zero até produção",
    resumo:
      "Backend desde a arquitetura inicial: uma camada de regras e dois BFFs, web e mobile. Doze meses até produção.",
    pontos: [
      "Pagamentos com Stripe de ponta a ponta, incluindo a correção de uma falha de validação que deixava passar requisições",
      "Cache Redis nos BFFs com single-flight, TTL com jitter e stale-on-error. Preço e disponibilidade ficaram fora do cache por decisão com o cliente",
      "Causa raiz de uma falha de mTLS no DocumentDB que derrubava 5 de 16 endpoints, isolada em cerca de 30 minutos",
      "21 patches de CVE em três repositórios e filesystem somente leitura em produção",
    ],
    stack: ["Node.js", "TypeScript", "Redis", "Stripe", "AWS"],
    fluxo: ["App web e mobile", "BFFs", "Redis", "Camada de regras", "Stripe"],
    minhaParte: ["BFFs", "Redis", "Camada de regras", "Stripe"],
  },
  {
    id: "rag",
    onde: "TELUS Digital · IA aplicada",
    titulo: "Assistente de busca com RAG",
    resumo:
      "Um chatbot que substituiu uma busca feita à mão. Construí a API em .NET que liga o front ao serviço de recuperação em Python, durante um ano de projeto.",
    pontos: [
      "API .NET orquestrando o front e o serviço de IA",
      "Respostas baseadas nos documentos da empresa, com o contexto recuperado a cada pergunta",
    ],
    stack: ["C#", ".NET", "Python", "RAG", "LLM"],
    fluxo: ["Front", "API .NET", "Serviço Python", "Busca + LLM"],
    minhaParte: ["API .NET"],
  },
  {
    id: "gestora",
    onde: "GFT · gestora de investimentos dos EUA",
    titulo: "Sistemas financeiros de uma gestora americana",
    resumo:
      "Três anos em reconciliação bancária, cálculo de bônus, assinatura de documentos e gestão de fundos.",
    pontos: [
      "Uma tela que levava 2 minutos para abrir passou a abrir em 3 a 4 segundos, com a query reescrita",
      "Login unificado com MSAL na Azure no lugar de bancos de usuários separados por aplicação",
      "Mais de 50% menos chamados de suporte",
    ],
    stack: ["C#", ".NET Core", "Angular", "Azure", "Datadog"],
    fluxo: ["Angular", "API .NET", "MSAL na Azure", "Banco SQL"],
    minhaParte: ["Angular", "API .NET", "MSAL na Azure", "Banco SQL"],
  },
];

export type Projeto = {
  nome: string;
  estado: "no ar" | "em construção";
  texto: string;
  stack: string[];
  link?: string; // site no ar; o card só mostra o link quando ele existe
};

export const projetos: Projeto[] = [
  {
    nome: "Estuda10",
    estado: "no ar",
    texto:
      "SaaS que transforma PDFs e anotações de professores em provas e simulados, com RAG sobre os documentos indexados. Pergunta o que falta quando o pedido é vago. Criei para minha mãe, que é professora.",
    stack: ["React", "Supabase", "pgvector", "Gemini", "Stripe"],
    link: "https://estuda10.com.br",
  },
  {
    nome: "Ideraldinho",
    estado: "em construção",
    texto:
      "Assistente de voz cliente-servidor. O aparelho capta, transcreve e fala localmente; o gateway remoto guarda o LLM e as ferramentas que precisam de internet. Timers e alarmes rodam sempre no aparelho, mesmo offline.",
    stack: ["Python", "faster-whisper", "Piper", "LLM"],
  },
  {
    nome: "RuiFinance",
    estado: "no ar",
    texto:
      "Controle financeiro pessoal que eu uso no dia a dia, do lançamento de gastos aos relatórios. Next.js no front, Supabase no back.",
    stack: ["Next.js", "Supabase", "TypeScript"],
  },
  {
    nome: "Dragons",
    estado: "em construção",
    texto:
      "Jogo de cartas estilo Reigns num reino medieval. O motor de regras é um pacote Dart puro, testável isolado, e cerca de 278 cartas vivem como dados declarativos. Um teste automático quebra o build se uma carta cita algo que a partida não viveu.",
    stack: ["Flutter", "Dart", "Flame"],
  },
];

export type Cargo = { quando: string; cargo: string; onde: string; texto: string; atual?: boolean };

export const carreira: Cargo[] = [
  {
    quando: "out 2026 · hoje",
    cargo: "Analista de Engenharia de TI",
    onde: "Itaú Unibanco",
    texto: "Plataforma de renda fixa com microsserviços .NET e front em Angular, entre AWS e on-premise.",
    atual: true,
  },
  {
    quando: "mai 2024 · out 2026",
    cargo: "Software Engineer",
    onde: "TELUS Digital",
    texto:
      "Plataforma de uma rede global de hotéis, assistente com RAG e serviços .NET na AWS. Criei agentes de revisão de PR e ajudei o time a adotar Spec-Driven Development.",
  },
  {
    quando: "jun 2021 · mai 2024",
    cargo: "Software Developer",
    onde: "GFT Technologies",
    texto: "Alocado numa gestora de investimentos dos EUA. Entrei como estagiário e fui efetivado em dez meses.",
  },
  {
    quando: "2023 · 2024",
    cargo: "Backend, Garage Lab",
    onde: "FIAP",
    texto: "Primeira ferramenta brasileira de Breach and Attack Simulation, com C#, Angular e Python.",
  },
];
