"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const WISP_URL = "wss://new-education-for-you.onrender.com/wisp/";
const SEARCH_ENGINES = {
  Brave: "https://search.brave.com/search?q=",
  Google: "https://www.google.com/search?q=",
  DuckDuckGo: "https://duckduckgo.com/?q=",
  Ecosia: "https://www.ecosia.org/search?q=",
} as const;

function normalize(value: string, searchEngine: keyof typeof SEARCH_ENGINES = "Brave") {
  const input = value.trim();
  if (!input) return "";
  try {
    return new URL(input).toString();
  } catch {
    if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(input)) return `https://${input}`;
    return `${SEARCH_ENGINES[searchEngine]}${encodeURIComponent(input)}`;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      // Wait for existing script to define globals
      const checkGlobals = setInterval(() => {
        const w = window as any;
        // If we loaded controller, check for $scramjetController
        if (src.includes("controller") && w.$scramjetController) {
          clearInterval(checkGlobals);
          resolve();
        }
        // If we loaded scramjet, check for $scramjet
        if (src.includes("scramjet.js") && w.$scramjet) {
          clearInterval(checkGlobals);
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(checkGlobals);
        resolve();
      }, 5000);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    let loaded = false;

    script.onload = () => {
      loaded = true;
      // Wait a tick for globals to be set
      setTimeout(resolve, 100);
    };

    script.onerror = () => {
      if (!loaded) reject(new Error(`Could not load ${src}`));
    };

    document.head.appendChild(script);
  });
}

export default function ProxyBrowser({ query = "", searchEngine = "Brave" }: { query?: string; searchEngine?: keyof typeof SEARCH_ENGINES }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameRef = useRef<any>(null);
  const initRef = useRef<Promise<any> | null>(null);
  const [input, setInput] = useState(query);
  const [status, setStatus] = useState("Starting proxy…");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function start() {
    // Reuse initialization if already in progress or completed
    if (initRef.current) {
      return initRef.current;
    }

    if (frameRef.current) return frameRef.current;

    const initPromise = (async () => {
      setError("");
      try {
        // Load scramjet first, wait for $scramjet global
        await loadScript("/scramjet/scramjet.js");
        const w = window as any;
        if (!w.$scramjet) {
          throw new Error("$scramjet global not initialized after loading scramjet.js");
        }

        // Then load controller, wait for $scramjetController global
        await loadScript("/controller/controller.api.js");
        if (!w.$scramjetController) {
          throw new Error("$scramjetController global not initialized after loading controller.api.js");
        }

        // Load transport
        await loadScript("/epoxy.js");
        const Transport = (window as any).EpoxyTransport?.default || (window as any).EpoxyTransport;
        if (!Transport) throw new Error("EpoxyTransport did not load");

        // Register service worker first
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
        await registration.update();
        await navigator.serviceWorker.ready;

        // Initialize transport
        const transport = new Transport({ wisp: WISP_URL });
        await transport.init();

        // Create controller
        const controller = new w.$scramjetController.Controller({
          serviceworker: registration.active || navigator.serviceWorker.controller,
          transport,
          scramjetConfig: w.$scramjet.defaultConfig,
        });
        await controller.wait();

        // Create frame
        frameRef.current = controller.createFrame(iframeRef.current);
        setStatus("Ready");
        return frameRef.current;
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause);
        setStatus("Proxy unavailable");
        setError(message);
        throw cause;
      }
    })();

    initRef.current = initPromise;
    return initPromise;
  }

  async function go(value: string) {
    const url = normalize(value, searchEngine);
    if (!url) return;
    setInput(value);
    try {
      const frame = await start();
      setLoaded(false);
      frame.go(url);
      setStatus("Loading…");
      window.setTimeout(() => {
        if (frameRef.current === frame) {
          setStatus("Retrying connection…");
          frame.go(url);
        }
      }, 1800);
    } catch (cause) {
      setStatus("Proxy error");
      setError(cause instanceof Error ? cause.message : "Unknown error");
    }
  }

  useEffect(() => {
    if (query) void go(query);
    else void start();
    return () => {
      frameRef.current = null;
      initRef.current = null;
    };
    // The proxy should boot once when the browser tab mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    void go(input);
  }

  function navigate(action: "back" | "forward" | "reload") {
    const frame = frameRef.current;
    if (!frame) return;
    if (action === "back") frame.back?.();
    if (action === "forward") frame.forward?.();
    if (action === "reload") frame.reload?.();
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <form onSubmit={submit} className="flex gap-2 border-b border-white/[.06] p-3">
        <button type="button" onClick={() => navigate("back")} className="rounded-full px-2 text-[#a5acc1] hover:bg-white/10" aria-label="Back">‹</button>
        <button type="button" onClick={() => navigate("forward")} className="rounded-full px-2 text-[#a5acc1] hover:bg-white/10" aria-label="Forward">›</button>
        <button type="button" onClick={() => navigate("reload")} className="rounded-full px-2 text-[#a5acc1] hover:bg-white/10" aria-label="Reload">↻</button>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search with Brave or enter a URL" className="min-w-0 flex-1 rounded-full bg-white/[.06] px-4 py-2 text-sm text-white outline-none placeholder:text-[#8a91aa]" aria-label="Web search" />
        <button type="submit" className="rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[#161126]">Go</button>
      </form>
      <div className="flex items-center gap-2 px-4 py-2 text-xs text-[#9ca6bf]">{status}{error && <span className="truncate text-red-300">: {error}</span>}</div>
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#080b18]">
        {!loaded && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_50%_35%,rgba(187,169,255,.12),transparent_42%),#080b18] text-center"><div className="size-10 animate-pulse rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/10" /><p className="text-sm text-[#9ca6bf]">{error ? "The proxy could not load this page." : "Connecting to the night web…"}</p><button type="button" onClick={() => { initRef.current = null; frameRef.current = null; setError(""); setStatus("Retrying…"); void go(input) }} className="rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[#161126]">Retry</button></div>}
        <iframe ref={iframeRef} title="Nightfall web proxy" onLoad={() => { setLoaded(true); setStatus("Ready") }} className="size-full border-0 bg-transparent" />
      </div>
    </div>
  );
}
