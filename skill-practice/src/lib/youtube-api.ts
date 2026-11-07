export type YouTubePlayer = {
  getAvailablePlaybackRates(): number[];
  getPlaybackRate(): number;
  setPlaybackRate(rate: number): void;
  destroy(): void;
};

type PlayerEvent = { target: YouTubePlayer };

export type YouTubeApi = {
  Player: new (frame: HTMLIFrameElement, options: {
    events: {
      onReady(event: PlayerEvent): void;
      onPlaybackRateChange(event: PlayerEvent & { data: number }): void;
      onError(event: PlayerEvent & { data: number }): void;
    };
  }) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeApi> | null = null;

export function supportedPlaybackRates(available: number[]): number[] {
  return [0.5, 0.75, 1].filter((rate) => available.includes(rate));
}

export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  const pending = new Promise<YouTubeApi>((resolve, reject) => {
    const source = "https://www.youtube.com/iframe_api";
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${source}"]`);
    const script = existing ?? document.createElement("script");
    const previousReady = window.onYouTubeIframeAPIReady;

    function cleanup() {
      window.clearTimeout(timeout);
      script.removeEventListener("error", fail);
      if (window.onYouTubeIframeAPIReady === ready) {
        window.onYouTubeIframeAPIReady = previousReady;
      }
    }

    function fail() {
      cleanup();
      if (!existing) script.remove();
      reject(new Error("YouTube API non disponibile"));
    }

    function ready() {
      cleanup();
      try {
        previousReady?.();
      } finally {
        if (window.YT?.Player) resolve(window.YT);
        else reject(new Error("YouTube API non inizializzata"));
      }
    }

    const timeout = window.setTimeout(fail, 15000);
    window.onYouTubeIframeAPIReady = ready;
    script.addEventListener("error", fail, { once: true });
    if (!existing) {
      script.src = source;
      script.async = true;
      document.head.append(script);
    }
  });
  apiPromise = pending;
  void pending.catch(() => {
    if (apiPromise === pending) apiPromise = null;
  });
  return pending;
}
