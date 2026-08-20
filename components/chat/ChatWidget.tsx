"use client";

import { useEffect, useId, useRef, useState, useEffectEvent } from "react";
import LocalizedLink from "@/components/i18n/LocalizedLink";
import { useLocale } from "@/lib/i18n/use-locale";
import { messages } from "@/lib/i18n/messages";
import type { ChatApiResponse, ChatMessage } from "@/lib/chat/types";

const STORAGE_KEY = "dnpec-chat-v1";

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Rend **gras**, liens markdown et retours ligne. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\n)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part === "\n") return <br key={i} />;
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link) {
          const [, label, href] = link;
          if (href.startsWith("/")) {
            return (
              <LocalizedLink key={i} href={href} className="text-green font-semibold underline underline-offset-2 hover:text-green-dark">
                {label}
              </LocalizedLink>
            );
          }
          return (
            <a key={i} href={href} className="text-green font-semibold underline underline-offset-2" target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          );
        }
        const bold = /^\*\*([^*]+)\*\*$/.exec(part);
        if (bold) return <strong key={i}>{bold[1]}</strong>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function ChatWidget() {
  const locale = useLocale();
  const t = messages[locale].chat;
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"demo" | "claude">("demo");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const persist = useEffectEvent((next: ChatMessage[], nextMode: "demo" | "claude") => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY}-${locale}`,
        JSON.stringify({ messages: next.slice(-40), mode: nextMode }),
      );
    } catch {
      /* ignore */
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}-${locale}`);
      if (!raw) {
        setChatMessages([
          { id: newId(), role: "assistant", content: t.welcome },
        ]);
        return;
      }
      const parsed = JSON.parse(raw) as { messages?: ChatMessage[]; mode?: "demo" | "claude" };
      if (parsed.messages?.length) {
        setChatMessages(parsed.messages);
        if (parsed.mode) setMode(parsed.mode);
      } else {
        setChatMessages([{ id: newId(), role: "assistant", content: t.welcome }]);
      }
    } catch {
      setChatMessages([{ id: newId(), role: "assistant", content: t.welcome }]);
    }
  }, [locale, t.welcome]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    inputRef.current?.focus();
  }, [open, chatMessages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: ChatMessage = { id: newId(), role: "user", content: trimmed };
    const next = [...chatMessages, userMsg];
    setChatMessages(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale,
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = (await res.json()) as ChatApiResponse & { error?: string };
      if (!res.ok || !data.content) {
        throw new Error(data.error || "chat failed");
      }
      const assistantMsg: ChatMessage = {
        id: newId(),
        role: "assistant",
        content: data.content,
      };
      const withAssistant = [...next, assistantMsg];
      setChatMessages(withAssistant);
      setMode(data.mode);
      persist(withAssistant, data.mode);
    } catch {
      const fallback: ChatMessage = {
        id: newId(),
        role: "assistant",
        content: t.error,
      };
      const withFallback = [...next, fallback];
      setChatMessages(withFallback);
      persist(withFallback, mode);
    } finally {
      setBusy(false);
    }
  }

  function clearChat() {
    const welcome: ChatMessage[] = [{ id: newId(), role: "assistant", content: t.welcome }];
    setChatMessages(welcome);
    persist(welcome, mode);
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? t.close : t.open}
        onClick={() => setOpen((v) => !v)}
        className={`fixed right-4 sm:right-6 bottom-6 z-[60] w-14 h-14 rounded-full bg-green text-white shadow-[0_6px_24px_rgba(15,107,60,0.45)] flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow ${
          open ? "scale-95" : "chat-fab-pulse"
        }`}
      >
        {open ? (
          <span className="text-2xl leading-none" aria-hidden>
            ×
          </span>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-4 3.5V6.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
          </svg>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={t.title}
          className="fixed z-[60] right-3 sm:right-6 bottom-[5.25rem] w-[min(100%-1.5rem,400px)] h-[min(72vh,560px)] flex flex-col rounded-2xl overflow-hidden bg-white shadow-[0_16px_48px_rgba(19,43,94,0.28)] border border-line animate-chat-panel"
        >
          <header className="shrink-0 px-4 py-3 bg-navy text-white flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green flex items-center justify-center shrink-0 text-sm font-bold">
              IA
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading font-semibold text-[15px] leading-tight">{t.title}</p>
              <p className="text-[11px] text-white/70 mt-0.5">{t.subtitle}</p>
              <p className="mt-1.5 flex items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 text-[#9dffb8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7dffa0] animate-pulse" />
                  {t.online}
                </span>
                {mode === "demo" && (
                  <span className="px-1.5 py-0.5 rounded bg-yellow/90 text-navy font-bold tracking-wide">
                    {t.demoBadge}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={clearChat}
              className="text-[11px] text-white/70 hover:text-white underline underline-offset-2 cursor-pointer shrink-0"
            >
              {t.reset}
            </button>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-paper">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-navy text-white rounded-br-md"
                      : "bg-white text-ink border border-line rounded-bl-md shadow-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <RichText text={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {chatMessages.length <= 1 && !busy && (
              <div className="flex flex-wrap gap-2 pt-1">
                {t.suggestions.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => send(label)}
                    className="text-left text-[12px] px-3 py-1.5 rounded-full border border-green/30 bg-white text-navy font-medium hover:bg-green/5 cursor-pointer transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {busy && (
              <div className="flex justify-start">
                <div className="bg-white border border-line rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <span className="inline-flex gap-1" aria-label={t.typing}>
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          <form
            className="shrink-0 border-t border-line bg-white p-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder={t.placeholder}
              disabled={busy}
              className="flex-1 resize-none rounded-xl border border-line px-3 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:outline-none focus:border-green focus:ring-1 focus:ring-green/30 max-h-28"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label={t.send}
              className="shrink-0 w-11 h-11 rounded-xl bg-green text-white font-bold disabled:opacity-40 cursor-pointer hover:bg-green-dark transition-colors"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
