"use client";

import { useEffect, useState } from "react";
import LocalizedLink from "@/components/i18n/LocalizedLink";
import { useMessages } from "@/lib/i18n/use-locale";
import type { NewsArticle } from "@/lib/types";

const AUTOPLAY_MS = 5500;
const EFFECTS = ["fade", "down", "zoom", "wipe", "appear", "up"] as const;
type Effect = (typeof EFFECTS)[number];

type NewsBannerProps = {
  articles: NewsArticle[];
};

function bannerFocal(article: NewsArticle): "top" | "center" | "bottom" {
  const url = article.coverImage ?? "";
  if (/simandou/i.test(url)) return "bottom";
  if (/afritac|maps-ii|atelier-maps/i.test(url)) return "top";
  if (article.coverWidth && article.coverHeight && article.coverWidth / article.coverHeight < 1.35) {
    return "top";
  }
  return "center";
}

export default function NewsBanner({ articles }: NewsBannerProps) {
  const t = useMessages();
  const slides = articles.filter((article) => article.coverImage).slice(0, 8);
  const [index, setIndex] = useState(0);
  const [effect, setEffect] = useState<Effect>("fade");
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setEffect(EFFECTS[Math.floor(Math.random() * EFFECTS.length)]);
      setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  function go(step: number) {
    if (count <= 1) return;
    setEffect(EFFECTS[Math.floor(Math.random() * EFFECTS.length)]);
    setIndex((current) => (current + step + count) % count);
  }

  const current = slides[index];

  return (
    <section
      className="news-banner relative w-full overflow-hidden bg-navy-dark min-h-[265px] sm:min-h-[385px] lg:min-h-[500px]"
      aria-label={t.home.newsBanner}
    >
      {slides.map((article, i) => {
        const active = i === index;
        return (
          <LocalizedLink
            key={article.id}
            href={`/actualites/${article.slug}`}
            className={`news-banner-slide ${active ? `is-active fx-${effect}` : ""}`}
            aria-hidden={!active}
            {...(!active ? { tabIndex: -1 } : {})}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage}
              alt=""
              className="news-banner-img"
              data-focal={bannerFocal(article)}
              decoding="async"
              fetchPriority={i === 0 ? "high" : "low"}
            />
            <div className="news-banner-veil" />
            <div className="news-banner-caption">
              <span className="inline-block bg-green text-white text-[10.5px] font-bold px-2.5 py-1 rounded uppercase tracking-wide mb-2">
                {article.category}
              </span>
              <h2 className="text-white text-lg sm:text-2xl lg:text-[1.75rem] font-heading font-semibold leading-snug max-w-3xl line-clamp-2">
                {article.title}
              </h2>
            </div>
          </LocalizedLink>
        );
      })}

      {count > 1 && (
        <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          <button
            type="button"
            aria-label={t.home.prevNews}
            onClick={(event) => {
              event.preventDefault();
              go(-1);
            }}
            className="news-banner-nav"
          >
            ←
          </button>
          <button
            type="button"
            aria-label={t.home.nextNews}
            onClick={(event) => {
              event.preventDefault();
              go(1);
            }}
            className="news-banner-nav"
          >
            →
          </button>
        </div>
      )}

      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {slides.map((article, i) => (
            <button
              key={article.id}
              type="button"
              aria-label={t.ui.goToNews.replace("{title}", article.title)}
              aria-current={i === index}
              onClick={() => {
                setEffect("fade");
                setIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-yellow" : "w-1.5 bg-white/55 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}

      <span className="sr-only">
        {t.ui.slideOf
          .replace("{title}", current.title)
          .replace("{n}", String(index + 1))
          .replace("{count}", String(count))}
      </span>
    </section>
  );
}
