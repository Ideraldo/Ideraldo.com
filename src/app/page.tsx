import CacheDemo from "@/components/CacheDemo";
import QueueDemo from "@/components/QueueDemo";
import Topology from "@/components/Topology";
import { CopyEmail, ThemeToggle } from "@/components/ui";
import { carreira, casos, contato, lab } from "@/content/site";

const d = (n: number) => ({ "--d": n }) as React.CSSProperties;

export default function Home() {
  return (
    <>
      <header className="nav">
        <div className="wrap nav-inner">
          <a href="#topo" className="logo">ideraldo<span>.com</span></a>
          <nav aria-label="Seções">
            <a href="#carreira">Carreira</a>
            <a href="#projetos">Projetos</a>
            <a href="#lab">Lab</a>
            <a href="#contato">Contato</a>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="conteudo">
        <section id="topo" className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow enter" style={d(0)}>
                <span className="live-dot" aria-hidden="true" />
                São Paulo · hoje no Itaú Unibanco
              </p>
              <h1 className="enter" style={d(1)}>
                Engenheiro de software backend.
                <span> APIs, filas, cache e IA aplicada.</span>
              </h1>
              <p className="lede enter" style={d(2)}>
                Cinco anos construindo sistemas para uma gestora de investimentos dos EUA, uma rede
                global de hotéis e, hoje, para o maior banco da América Latina. Este site também é um
                sistema: cada serviço do diagrama leva a uma parte dele.
              </p>
              <div className="hero-actions enter" style={d(3)}>
                <a className="btn btn-primary" href="#carreira">Ver minha carreira</a>
                <a className="btn" href="#contato">Falar comigo</a>
              </div>
            </div>
            <div className="hero-visual enter" style={d(2)}>
              <Topology />
            </div>
          </div>
        </section>

        <section id="carreira" className="section">
          <div className="wrap">
            <div className="career-grid">
              <header className="section-head">
                <p className="route">GET /carreira</p>
                <h2>Carreira</h2>
                <p className="section-lede">
                  Bacharel em Sistemas de Informação e pós-graduado em Inteligência Artificial pela FIAP.
                  Inglês avançado.
                </p>
                <dl className="stack-list">
                  <div><dt>Linguagens</dt><dd>C# e .NET, TypeScript e Node.js, Python, SQL</dd></div>
                  <div><dt>Backend</dt><dd>REST, GraphQL, NestJS, Redis, Service Bus, RabbitMQ</dd></div>
                  <div><dt>Cloud</dt><dd>AWS (ECS, EKS), Azure, CI/CD, Datadog</dd></div>
                  <div><dt>Front</dt><dd>Angular, React, Next.js</dd></div>
                  <div><dt>IA</dt><dd>RAG, LLMs, agentes, Claude Code, Spec-Driven Development</dd></div>
                </dl>
              </header>
              <ol className="timeline">
                {carreira.map((c) => (
                  <li key={c.onde + c.quando} className={c.atual ? "is-now" : ""}>
                    <p className="when">{c.quando}</p>
                    <div>
                      <h3>{c.cargo} <span>· {c.onde}</span></h3>
                      <p>{c.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="cases-head">
              <h3 className="sub-head">O que construí nas empresas</h3>
              <p className="legend"><span className="legend-key" aria-hidden="true" /> minha parte no sistema</p>
            </div>
            <div className="cases">
              {casos.map((c) => (
                <article key={c.id} className="case">
                  <div className="case-body">
                    <p className="case-where">{c.onde}</p>
                    <h3>{c.titulo}</h3>
                    <p className="case-summary">{c.resumo}</p>
                    <ul className="case-points">
                      {c.pontos.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                    <p className="case-stack">{c.stack.join(" · ")}</p>
                  </div>
                  <ol className="flow" aria-label={`Arquitetura: ${c.fluxo.join(", ")}. Minha parte: ${c.minhaParte.join(", ")}.`}>
                    {c.fluxo.map((f, i) => (
                      <li key={f} className={c.minhaParte.includes(f) ? "is-mine" : ""} style={{ "--i": i } as React.CSSProperties}>{f}</li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="projetos" className="section">
          <div className="wrap">
            <header className="section-head">
              <p className="route">GET /projetos</p>
              <h2>Projetos pessoais</h2>
              <p className="section-lede">O que construo fora do trabalho, quase sempre com IA no meio.</p>
            </header>
            <div className="side-projects">
              {lab.map((l) => (
                <article key={l.nome} className="side">
                  <p className={`state ${l.estado === "no ar" ? "is-live" : ""}`}>{l.estado}</p>
                  <h3>{l.nome}</h3>
                  <p>{l.texto}</p>
                  {l.link && <a className="text-link" href={l.link} target="_blank" rel="noopener">{l.link.replace("https://", "")} ↗</a>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="lab" className="section">
          <div className="wrap">
            <header className="section-head">
              <p className="route">GET /lab</p>
              <h2>Demos ao vivo</h2>
              <p className="section-lede">
                Dois problemas que já resolvi em produção, em versão que dá para mexer. O código que
                decide cada passo é o mesmo que está no repositório.
              </p>
            </header>

            <article className="lab-item">
              <div className="lab-text">
                <p className="lab-index">01 · cache-aside</p>
                <h3>Quarenta pedidos, uma consulta ao banco</h3>
                <p>
                  O cache está vazio e quarenta pedidos chegam juntos. Sem single-flight, cada um vai ao
                  banco. Com ele, um pedido busca e os outros esperam a mesma resposta. Desligue o banco
                  para ver o stale-on-error devolver o último valor bom. Implementei esse padrão nos BFFs
                  de uma rede global de hotéis.
                </p>
              </div>
              <CacheDemo />
            </article>

            <article className="lab-item">
              <div className="lab-text">
                <p className="lab-index">02 · mensageria</p>
                <h3>Fila com retentativa e dead letter</h3>
                <p>
                  Consumidores concorrentes tirando mensagens de uma fila, como no RabbitMQ ou no Azure
                  Service Bus. Aumente a taxa de falha e veja as retentativas com backoff; aumente o
                  volume e veja a fila acumular até você colocar mais consumidores.
                </p>
              </div>
              <QueueDemo />
            </article>
          </div>
        </section>

        <section id="contato" className="section section-close">
          <div className="wrap close-grid">
            <div>
              <p className="route">POST /contato</p>
              <h2 className="close-title">Tem um sistema para construir? Vamos conversar.</h2>
            </div>
            <div className="contact">
              <CopyEmail email={contato.email} />
              <a className="contact-row" href={contato.linkedin} target="_blank" rel="noopener">
                <span className="contact-label">LinkedIn</span>
                <span className="contact-value">in/ideraldorui</span>
                <span aria-hidden="true">↗</span>
              </a>
              <a className="contact-row" href={contato.github} target="_blank" rel="noopener">
                <span className="contact-label">GitHub</span>
                <span className="contact-value">Ideraldo</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="wrap footer">
        <span>© 2026 Ideraldo Rui</span>
        <span>Next.js, exportação estática · código no GitHub</span>
      </footer>
    </>
  );
}
