"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowRight,
  Download,
  MapPin,
  Phone,
  Truck,
  Package,
  MessageCircle,
  Check,
  ChevronRight,
} from "lucide-react";
import { Instagram, Facebook, Linkedin } from "./social-icons";
import {
  shortName,
  pdf,
  type Product,
  normalize,
} from "@/lib/catalog";

export function MovementHero({
  products,
  query,
  onQuery,
  onProduct,
  onBrowse,
}: {
  products: Product[];
  query: string;
  onQuery: (s: string) => void;
  onProduct: (p: Product) => void;
  onBrowse: () => void;
}) {
  const ref = useRef<HTMLElement>(null),
    search = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false),
    [index, setIndex] = useState(-1);
  const wheel = products.find((p) => p.supplier === "Merkbak") || products[0],
    lever = products.find((p) => p.supplier === "Kifix") || wheel,
    foot = products.find((p) => p.supplier === "Vibra-Stop") || wheel;
  const results = products
    .filter((p) =>
      normalize(
        p.name + " " + p.variations.map((v) => v.label).join(" "),
      ).includes(normalize(query)),
    )
    .slice(0, 5);
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame = 0;
      const top = ref.current?.getBoundingClientRect().top || 0;
      ref.current?.style.setProperty(
        "--travel",
        String(Math.max(0, Math.min(1, -top / 650))),
      );
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
    };
  }, []);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!search.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  useEffect(() => {
    const image = ref.current?.querySelector<HTMLImageElement>(".wheel-image");
    if (image?.complete && image.naturalWidth)
      image.classList.add("wheel-ready");
  }, []);
  const select = (p: Product) => {
    setOpen(false);
    setIndex(-1);
    onProduct(p);
  };
  return (
    <section id="inicio" className="movement-hero" ref={ref}>
      <div className="container movement-opening">
        <div className="movement-copy">
          <h1>
            Cada peça,
            <br />
            um novo
            <br />
            movimento.
          </h1>
          <p className="movement-description">
            Da manutenção ao próximo projeto. Encontre o componente, escolha a
            medida e converse com quem entende a sua aplicação.
          </p>
          <form
            ref={search}
            className="movement-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (index >= 0 && results[index]) select(results[index]);
              else setOpen(true);
            }}
          >
            <div className="search-control">
              <Search size={21} />
              <input
                aria-label="Buscar componente"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open && !!query.trim()}
                aria-controls="quick-results"
                aria-activedescendant={
                  index >= 0 ? `quick-result-${index}` : undefined
                }
                placeholder="Qual peça move o seu projeto?"
                value={query}
                onFocus={() => setOpen(true)}
                onChange={(e) => {
                  onQuery(e.target.value);
                  setIndex(-1);
                  setOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setOpen(true);
                    setIndex((i) => Math.min(results.length - 1, i + 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setIndex((i) => Math.max(-1, i - 1));
                  }
                }}
              />
              <button aria-label="Pesquisar">
                <ArrowRight size={23} />
              </button>
            </div>
            {open && query.trim() && (
              <div
                className="quick-results"
                id="quick-results"
                role="listbox"
                aria-label="Resultados da busca"
              >
                {results.length ? (
                  results.map((p, i) => (
                    <button
                      type="button"
                      role="option"
                      id={`quick-result-${i}`}
                      aria-selected={i === index}
                      key={p.id}
                      onClick={() => select(p)}
                    >
                      <img src={p.image} alt="" />
                      <span>
                        <strong>{shortName(p)}</strong>
                        <small>
                          {p.categories[0]?.name} ·{" "}
                          {p.variations.length
                            ? `${p.variations.length} medidas`
                            : "Referência única"}
                        </small>
                      </span>
                      <ArrowUpRight size={18} />
                    </button>
                  ))
                ) : (
                  <p>
                    Nenhuma peça encontrada. Tente outro código ou uma medida.
                  </p>
                )}
                <button
                  type="button"
                  className="all-results"
                  onClick={() => {
                    setOpen(false);
                    onBrowse();
                  }}
                >
                  Ver no catálogo <ChevronRight size={17} />
                </button>
              </div>
            )}
          </form>
          <div className="movement-actions">
            <button className="button primary" onClick={onBrowse}>
              Explorar componentes <ArrowUpRight size={18} />
            </button>
            <a href={pdf} download className="text-action">
              <Download size={18} /> Catálogo técnico
            </a>
          </div>
          <p className="national-signature">
            <MapPin size={16} /> Atendimento próximo. Envio para todo o Brasil.
          </p>
        </div>
        {wheel && <div className="movement-assembly" aria-label="Componentes de máquinas">
          <div className="machining-orbit orbit-one" />
          <div className="machining-orbit orbit-two" />
          <span className="assembly-cross cross-top" />
          <span className="assembly-cross cross-bottom" />
          <button
            className="assembly-main"
            onPointerEnter={(e) => {
              e.currentTarget.style.setProperty("--hover-turn", "155deg");
            }}
            onPointerLeave={(e) => {
              e.currentTarget.style.setProperty("--hover-turn", "0deg");
            }}
            onClick={() => onProduct(wheel)}
            aria-label={`Conhecer ${shortName(wheel)}`}
          >
            <img
              onLoad={(e) => e.currentTarget.classList.add("wheel-ready")}
              className="wheel-image"
              src={wheel.image}
              alt={shortName(wheel)}
              fetchPriority="high"
            />
          </button>
          <button
            className="assembly-part assembly-lever"
            onClick={() => onProduct(lever)}
            aria-label={`Conhecer ${shortName(lever)}`}
          >
            <img src={lever.image} alt={shortName(lever)} />
            <span>
              Fixar <ArrowUpRight size={14} />
            </span>
          </button>
          <button
            className="assembly-part assembly-foot"
            onClick={() => onProduct(foot)}
            aria-label={`Conhecer ${shortName(foot)}`}
          >
            <img src={foot.image} alt={shortName(foot)} />
            <span>
              Apoiar <ArrowUpRight size={14} />
            </span>
          </button>
          <div className="assembly-reference">
            <span className="reference-line" />
            <button onClick={() => onProduct(wheel)}>
              <strong>{wheel.sku || wheel.supplier}</strong>
              <span>Controle em cada giro</span>
              <ArrowUpRight size={20} />
            </button>
          </div>
        </div>}
      </div>
      <div className="movement-bottom container">
        <span>Peças para quem mantém a indústria em movimento.</span>
        <a href="#catalogo" aria-label="Descer para o catálogo">
          <span>Continue explorando</span>
          <ArrowRight size={19} />
        </a>
      </div>
    </section>
  );
}

export function MotionStory({ onContact }: { onContact: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame = 0;
      const rect = ref.current
        ?.querySelector(".history-journey")
        ?.getBoundingClientRect();
      if (!rect) return;
      const progress = Math.max(
        0,
        Math.min(
          1,
          (window.innerHeight * 0.78 - rect.top) /
            (window.innerWidth > 560
              ? window.innerHeight * 0.6
              : rect.height * 0.85),
        ),
      );
      ref.current?.style.setProperty("--journey", String(progress));
      setActive(Math.min(3, Math.floor(progress * 3 + 0.02)));
    };
    const run = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    run();
    window.addEventListener("scroll", run, { passive: true });
    window.addEventListener("resize", run);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", run);
      window.removeEventListener("resize", run);
    };
  }, []);
  const milestones = [
    {
      year: "1984",
      title: "Começa uma relação de confiança.",
      text: "A origem de uma trajetória dedicada a aproximar a indústria dos componentes de que precisa.",
    },
    {
      year: "2000",
      title: "Mais soluções, novas conexões.",
      text: "O portfólio se amplia com componentes nacionais e importados e parcerias que atravessam fronteiras.",
    },
    {
      year: "2014",
      title: "Experiência encontra tecnologia.",
      text: "O conhecimento técnico se conecta ao atendimento digital, tornando a escolha de peças mais ágil.",
    },
    {
      year: "2026",
      title: "Um novo nome. A mesma essência.",
      text: "Carol Componentes: a continuidade da equipe de Joinville, com atendimento próximo e envio para todo o Brasil.",
    },
  ];
  return (
    <section
      id="empresa"
      className="motion-story history-story section"
      ref={ref}
    >
      <div className="container">
        <div className="story-heading">
          <h2>
            Décadas de confiança.
            <br />
            Novos movimentos
            <br />
            para a indústria.
          </h2>
          <div>
            <p>
              Uma trajetória de conhecimento técnico, evolução do portfólio e
              parcerias duradouras. A tecnologia aproxima possibilidades; nossa
              experiência ajuda a transformá-las em soluções.
            </p>
            <p className="story-values">
              Ética, qualidade e agilidade acompanham cada capítulo. Uma nova
              marca, a mesma direção e o compromisso de ser sua aliada em uma
              indústria mais dinâmica, sustentável e inovadora.
            </p>
            <button className="text-action" onClick={onContact}>
              Converse com quem faz parte dessa história{" "}
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
        <div className="journey history-journey">
          <div className="journey-track" aria-hidden="true">
            <span />
          </div>
          {milestones.map((m, i) => (
            <article
              className="journey-step"
              data-active={active >= i}
              key={m.year}
            >
              <div className="journey-dot" aria-hidden="true">
                <span />
              </div>
              <span className="milestone-year">{m.year}</span>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NationalPresence({ onContact }: { onContact: () => void }) {
  return (
    <section id="localizacao" className="national-presence section">
      <div className="container presence-layout">
        <div className="presence-copy">
          <h2>
            Perto de você
            <br />
            em Joinville.
            <br />
            Presente em
            <br />
            todo o Brasil.
          </h2>
          <p>
            A proximidade está no atendimento. O destino pode ser a sua
            indústria, em qualquer lugar do país.
          </p>
          <div className="presence-nav">
            <div className="presence-selected">
              <span>SC</span>
              <strong>Nosso ponto de encontro</strong>
              <MapPin size={21} />
            </div>
          </div>
          <a className="presence-phone" href="tel:+554734350101">
            <Phone size={18} />
            (47) 3435-0101
          </a>
          <button className="text-action presence-contact" onClick={onContact}>
            Converse sobre sua entrega
          </button>
        </div>
        <div className="presence-panel">
          <div className="presence-information">
            <MapPin size={29} className="presence-pin" />
            <span className="presence-watermark" aria-hidden="true">
              SC
            </span>
            <p>Nossa base, sua conexão</p>
            <h3>Joinville, Santa Catarina</h3>
            <address>
              Rua Carlos Willy Boehm, 537 — Santo Antônio
              <br />
              Joinville — SC
              <br />
              CEP 89218-301
            </address>
            <div className="presence-buttons">
              <a
                className="button primary"
                href="https://www.google.com/maps/dir/?api=1&destination=Rua%20Carlos%20Willy%20Boehm%20537%20Joinville%20SC"
                target="_blank"
                rel="noreferrer"
              >
                Como chegar <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
          <div className="presence-map">
            <iframe
              title="Mapa da Carol Componentes em Joinville"
              src="https://maps.google.com/maps?q=Rua%20Carlos%20Willy%20Boehm%20537%20Joinville%20SC&z=15&output=embed&hl=pt-BR"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a
              className="map-route"
              href="https://www.google.com/maps/search/?api=1&query=Rua%20Carlos%20Willy%20Boehm%20537%20Joinville%20SC"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={15} /> Abrir mapa completo{" "}
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SocialConnections() {
  const channels = [
    {
      name: "Instagram",
      icon: Instagram,
      title: "A Carol no seu dia a dia.",
      text: "Conheça nosso canal de imagens e publicações. Salve o que interessa e acompanhe a equipe.",
      url: "https://www.instagram.com/carolfixbrasil/",
      action: "Explorar Instagram",
    },
    {
      name: "Facebook",
      icon: Facebook,
      title: "Mantenha a conversa por perto.",
      text: "Acesse a página já utilizada pela equipe para consultar publicações e acompanhar as novidades.",
      url: "https://www.facebook.com/carolrolamentos.joinville.9",
      action: "Ver página no Facebook",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      title: "Conexões que movem a indústria.",
      text: "Conheça a trajetória e a presença da equipe de Joinville na rede profissional.",
      url: "https://www.linkedin.com/company/carol-rolamentos-joinville/",
      action: "Conhecer no LinkedIn",
    },
  ];
  return (
    <section id="conexoes" className="social-connections section">
      <div className="container">
        <div className="social-heading">
          <h2>
            A conversa continua.
            <br />
            Além das peças.
          </h2>
          <p>
            Encontre a Carol também nas redes. Escolha seu canal e acompanhe as
            publicações diretamente na plataforma.
          </p>
        </div>
        <div className="social-channels">
          {channels.map((c) => (
            <a
              key={c.name}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="social-channel"
            >
              <div className="social-platform">
                <span className="social-logo">
                  <c.icon width={42} height={42} />
                </span>
                <span>{c.name}</span>
                <ExternalSocial />
              </div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <span className="social-action">{c.action}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
function ExternalSocial() {
  return <ArrowUpRight size={18} aria-hidden="true" />;
}
