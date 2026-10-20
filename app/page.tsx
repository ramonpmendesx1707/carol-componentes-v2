"use client";

import { useEffect, useState } from "react";
import Experience from "./experience";

export default function Page() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <main className="container" aria-live="polite">
        <p>Carregando catálogo Carol Componentes…</p>
      </main>
    );
  }
  return <Experience />;
}
