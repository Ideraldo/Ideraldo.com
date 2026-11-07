// Cache-aside com single-flight, TTL com jitter e stale-on-error.
// É este código que roda na demo da página: o desenho só observa o que ele faz.

export type Entry<T> = { value: T; expiresAt: number };

export type CacheOptions = {
  ttlMs: number;
  jitterMs: number;
  singleFlight: boolean;
  staleOnError: boolean;
};

export type Outcome = "hit" | "miss" | "coalesced" | "stale" | "error";

export function createCache<T>(now: () => number = () => performance.now()) {
  const store = new Map<string, Entry<T>>();
  const inflight = new Map<string, Promise<T>>();

  // Single-flight: quem chega enquanto já existe uma busca no banco espera a mesma promise.
  function load(key: string, loader: () => Promise<T>, opts: CacheOptions) {
    const running = opts.singleFlight ? inflight.get(key) : undefined;
    if (running) return { promise: running, leader: false };

    const promise = loader()
      .then((value) => {
        // Jitter espalha as expirações para as chaves não vencerem todas juntas.
        const ttl = opts.ttlMs + Math.random() * opts.jitterMs;
        store.set(key, { value, expiresAt: now() + ttl });
        return value;
      })
      .finally(() => inflight.delete(key));

    if (opts.singleFlight) inflight.set(key, promise);
    return { promise, leader: true };
  }

  async function get(
    key: string,
    loader: () => Promise<T>,
    opts: CacheOptions,
    onWait?: (leader: boolean) => void,
  ): Promise<{ value?: T; outcome: Outcome }> {
    const entry = store.get(key);
    if (entry && entry.expiresAt > now()) return { value: entry.value, outcome: "hit" };

    const { promise, leader } = load(key, loader, opts);
    onWait?.(leader);
    try {
      const value = await promise;
      return { value, outcome: leader ? "miss" : "coalesced" };
    } catch {
      // Stale-on-error: com o banco fora, devolve o último valor conhecido em vez de erro.
      if (opts.staleOnError && entry) return { value: entry.value, outcome: "stale" };
      return { outcome: "error" };
    }
  }

  return {
    get,
    peek: (key: string) => store.get(key),
    expire: (key: string) => {
      const e = store.get(key);
      if (e) e.expiresAt = 0;
    },
    clear: () => store.clear(),
  };
}

// Versão resumida exibida ao lado da demo.
export const SNIPPET = `const running = inflight.get(key);
if (running) return running;

const p = db.query(key)
  .then(v => {
    cache.set(key, v, ttl + rand(jitter));
    return v;
  })
  .finally(() => inflight.delete(key));

inflight.set(key, p);
return p;`;
