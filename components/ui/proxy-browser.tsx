"use client";

import { useEffect, useRef, useState } from "react";

const WISP_URL = process.env.NEXT_PUBLIC_WISP_URL!;
const BRAVE = "https://search.brave.com/search?q=%s";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

function toUrl(input: string, template = BRAVE) {
  try {
    return new URL(input).toString();
  } catch {}
  try {
    const url = new URL(`http://${input}`);
    if (url.hostname.includes(".")) return url.toString();
  } catch {}
  return template.replace("%s", encodeURIComponent(input));
}

let scramjetPromise: Promise<any> | null = null;

function getScramjet() {
  if (!scramjetPromise) {
    scramjetPromise = (async () => {
      await loadScript("/baremux/index.js");
      await loadScript("/scram/scramjet.all.js");
      const w = window as any;

      const { ScramjetController } = w.$scramjetLoadController();
      const scramjet = new ScramjetController({
        files: {
          wasm: "/scram/scramjet.wasm.wasm",
          all: "/scram/scramjet.all.js",
          sync: "/scram/scramjet.sync.js",
        },
      });
      await scramjet.init();

      await navigator.serviceWorker.register("/sw.js");

      const connection = new w.BareMux.BareMuxConnection("/baremux/worker.js");
      if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
        await connection.setTransport("/libcurl/index.mjs", [
          { websocket: WISP_URL },
        ]);
      }
      return scramjet;
    })();
    scramjetPromise.catch(() => (scramjetPromise = null));
  }
  return scramjetPromise;
}

export default function ProxyBrowser({ query }: { query?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<any>(null);
  const [input, setInput] = useState(query ?? "");
  const [error, setError] = useState("");

  async function go(value: string) {
    if (!value.trim()) return;
    try {
      setError("");
      const scramjet = await getScramjet();
      if (!frameRef.current) {
        const frame = scramjet.createFrame();
        frame.frame.className = "h-full w-full border-0";
        hostRef.current?.appendChild(frame.frame);
        frameRef.current = frame;
      }
      frameRef.current.go(toUrl(value));
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    if (query) go(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex h-full w-full flex-col">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(input);
        }}
        className="p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search with Brave or enter URL"
          className="w-full rounded-full bg-white/5 px-4 py-2 text-sm outline-none"
        />
      </form>
      {error && <p className="px-4 text-xs text-red-400">{error}</p>}
      <div ref={hostRef} className="min-h-0 flex-1" />
    </div>
  );
}