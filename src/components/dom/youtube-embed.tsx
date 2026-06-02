"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Extract a YouTube video id from the common URL shapes:
 * watch?v=, youtu.be/, /embed/, /shorts/, or a bare 11-char id.
 * Returns null when no id can be found so the caller can fall back.
 */
export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube(?:-nocookie)?\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m) return m[1];
  }
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

/**
 * YouTube player with two modes:
 *  - facade (default): poster + play button; loads the iframe only on click.
 *  - autoplay: starts muted when scrolled into view (IntersectionObserver),
 *    with a "Tap for sound" button that unmutes the live player via the
 *    YouTube JS API (no reload / restart).
 * Either way the heavy iframe is deferred until it's actually needed.
 */
export function YouTubeEmbed({
  url,
  title = "Demo video",
  poster,
  autoplay = false,
  className = "",
}: {
  url: string;
  title?: string;
  poster?: string | null;
  autoplay?: boolean;
  className?: string;
}) {
  const id = getYouTubeId(url);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Autoplay: mount the player only once the section is on screen.
  useEffect(() => {
    if (!autoplay) return;
    const el = containerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoplay]);

  if (!id) return null;

  const thumb = poster || `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  const onThumbError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.src.endsWith("hqdefault.jpg")) img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  };

  const unmute = () => {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      win.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), "*");
      win.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [100] }), "*");
      win.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), "*");
    }
    setMuted(false);
  };

  /* ── autoplay mode ── */
  if (autoplay) {
    return (
      <div ref={containerRef} className={`relative aspect-video w-full overflow-hidden bg-black ${className}`}>
        {active ? (
          <iframe
            ref={iframeRef}
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb} alt={title} className="h-full w-full object-cover" onError={onThumbError} />
            <span className="absolute inset-0 bg-black/25" />
            <PlayBadge />
          </>
        )}
        {active && muted && (
          <button
            type="button"
            onClick={unmute}
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-black/85"
            aria-label="Unmute video"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
            </svg>
            Tap for sound
          </button>
        )}
      </div>
    );
  }

  /* ── facade mode (click-to-play) ── */
  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-black ${className}`}>
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full cursor-pointer"
          aria-label={`Play ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            onError={onThumbError}
          />
          <span className="absolute inset-0 bg-black/25 transition-colors duration-500 group-hover:bg-black/10" />
          <PlayBadge />
        </button>
      )}
    </div>
  );
}

function PlayBadge() {
  return (
    <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-accent-400)]/95 shadow-2xl ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
      <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-[var(--color-surface-0)]" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}
