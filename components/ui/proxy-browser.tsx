"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const WISP_URL = process.env.NEXT_PUBLIC_WISP_URL || "wss://scramjet-app-uyja.onrender.com/wisp/";
const DEFAULT_SEARCH = "https://search.brave.com/search?q=";

function normalize(value: string) {
  const input = value.trim();
  if (!input) return "";
  try {
    return new URL(input).toString();
  } catch {
    if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(input)) return `https://${input}`;
    return `${DEFAULT_SEARCH}${encodeURIComponent(input)}`;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(script);
  });
}

export default function ProxyBrowser({ query = "" }: { query?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameRef = useRef<any>(null);
  const [input, setInput] = useState(query);
  const [status, setStatus] = useState("Starting proxy…");
  const [error, setError] = useState("");

  async function start() {
    if (frameRef.current) return frameRef.current;
    setError("");
    try {
      await loadScript("/scramjet/scramjet.js");
      await loadScript("/controller/controller.api.js");
      const loadModule = new Function("path", "return import(path)") as (path: string) => Promise<any>;
      const epoxy = await loadModule("/libcurl/index.mjs");
      const w = window as any;
      if (!w.$scramjet || !w.$scramjetController) {
        throw new Error(`Proxy runtime did not load: ${[!w.$scramjet && "$scramjet", !w.$scramjetController && "$scramjetController"].filter(Boolean).join(", ")}`);
      }
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
      const Transport = (epoxy as any).default || (epoxy as any).EpoxyTransport;
      if (!Transport) throw new Error("Proxy transport did not load");
      const transport = new Transport({ wisp: WISP_URL });
      await transport.init();
      const controller = new w.$scramjetController.Controller({
        serviceworker: registration.active || navigator.serviceWorker.controller,
        transport,
        scramjetConfig: w.$scramjet.defaultConfig,
      });
      await controller.wait();
      frameRef.current = controller.createFrame(iframeRef.current);
      setStatus("Ready");
      return frameRef.current;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setStatus("Proxy unavailable");
      setError(message);
      throw cause;
    }
  }

  async function go(value: string) {
    const url = normalize(value);
    if (!url) return;
    setInput(value);
    try {
      const frame = await start();
      frame.go(url);
      setStatus("Loading…");
    } catch {
      const fallback = value.includes(".") ? normalize(value) : `${DEFAULT_SEARCH}${encodeURIComponent(value.trim())}`;
      if (iframeRef.current) iframeRef.current.src = fallback;
      setError("");
      setStatus("Direct search fallback");
    }
  }

  useEffect(() => {
    if (query) void go(query);
    else void start();
    return () => {
      frameRef.current = null;
    };
    // The proxy should boot once when the browser tab mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    void go(input);
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <form onSubmit={submit} className="flex gap-2 border-b border-white/[.06] p-3">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search with Brave or enter a URL" className="min-w-0 flex-1 rounded-full bg-white/[.06] px-4 py-2 text-sm text-white outline-none placeholder:text-[#8a91aa]" aria-label="Web search" />
        <button type="submit" className="rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[#161126]">Go</button>
      </form>
      <div className="flex items-center gap-2 px-4 py-2 text-xs text-[#9ca6bf]"><span className="size-2 rounded-full bg-[var(--primary)]" />{status}{error && <span className="text-red-300">{error}</span>}</div>
      <iframe ref={iframeRef} title="Nightfall web proxy" className="min-h-0 flex-1 border-0 bg-white" />
    </div>
  );
}
