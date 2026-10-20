import type { Metadata } from "next";
import "./globals.css";
import "./movement.css";
import "./harvest.css";

export const metadata: Metadata = {
  title: "Carol Componentes Industriais | Joinville",
  description: "Componentes industriais, catálogo técnico e atendimento especializado em Joinville. Encontre a peça para seu próximo projeto.",
  robots: { index: false, follow: false },
  other: {
    "codex-preview": "development",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {capable:true,title:"Carol",statusBarStyle:"default"},
  icons: {
    apple: [{url:"/apple-touch-icon.png",sizes:"180x180",type:"image/png"}],
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
