import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ideraldo Rui · Engenheiro de software",
  description:
    "Engenheiro de software backend em São Paulo. APIs, mensageria, cache e IA aplicada, com demos que rodam no próprio site.",
  metadataBase: new URL("https://ideraldo.com"),
  openGraph: {
    title: "Ideraldo Rui · Engenheiro de software",
    description: "APIs, mensageria, cache e IA aplicada, com demos ao vivo.",
    url: "https://ideraldo.com",
    locale: "pt_BR",
    type: "website",
  },
};

// Aplica o tema salvo antes da primeira pintura, para não piscar.
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400..700&family=JetBrains+Mono:wght@400..600&display=swap"
        />
        <meta name="theme-color" content="#EEF0F3" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0B0C0E" media="(prefers-color-scheme: dark)" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip" href="#conteudo">Pular para o conteúdo</a>
        {children}
      </body>
    </html>
  );
}
