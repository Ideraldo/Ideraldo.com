"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [tema, setTema] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const atual = document.documentElement.dataset.theme;
    if (atual === "light" || atual === "dark") return setTema(atual);
    setTema(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  const trocar = () => {
    const novo = tema === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = novo;
    try { localStorage.setItem("theme", novo); } catch {}
    setTema(novo);
  };

  return (
    <button className="theme-toggle" onClick={trocar} aria-label={tema === "dark" ? "Usar tema claro" : "Usar tema escuro"}>
      <span aria-hidden="true" className={`theme-dot ${tema === "dark" ? "is-dark" : ""}`} />
      <span className="theme-label">{tema === "dark" ? "escuro" : "claro"}</span>
    </button>
  );
}

export function CopyEmail({ email }: { email: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      const el = document.getElementById("email-text");
      if (el) {
        const r = document.createRange();
        r.selectNodeContents(el);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }
    }
  };

  return (
    <div className="contact-row">
      <span className="contact-label">E-mail</span>
      <span id="email-text" className="contact-value select-all">{email}</span>
      <button className="btn btn-small" onClick={copiar}>{copiado ? "Copiado" : "Copiar"}</button>
    </div>
  );
}
