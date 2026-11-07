import assert from "node:assert/strict";
import test from "node:test";
import { loadYouTubeApi, supportedPlaybackRates } from "./youtube-api.ts";

test("playback controls use only supported review speeds", () => {
  assert.deepEqual(supportedPlaybackRates([0.25, 0.5, 0.75, 1, 1.5, 2]), [0.5, 0.75, 1]);
  assert.deepEqual(supportedPlaybackRates([1]), [1]);
  assert.deepEqual(supportedPlaybackRates([]), []);
  assert.deepEqual(supportedPlaybackRates([1, 0.5, 0.5]), [0.5, 1]);
});

test("YouTube loader shares requests, retries after errors/timeouts and preserves existing readiness callbacks", async () => {
  let activeScript: FakeScript | null = null;
  let timeout: (() => void) | null = null;
  let appended = 0;
  let previousReadyCalls = 0;
  class FakeScript {
    src = "";
    async = false;
    error: (() => void) | null = null;
    addEventListener(_event: string, callback: () => void) { this.error = callback; }
    removeEventListener() { this.error = null; }
    remove() { activeScript = null; }
  }
  const fakeWindow: {
    YT?: unknown;
    onYouTubeIframeAPIReady?: () => void;
    setTimeout(callback: () => void): number;
    clearTimeout(): void;
  } = {
    onYouTubeIframeAPIReady: () => { previousReadyCalls++; },
    setTimeout(callback) { timeout = callback; return 1; },
    clearTimeout() { timeout = null; },
  };
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    querySelector: () => activeScript,
    createElement: () => new FakeScript(),
    head: { append(script: FakeScript) { activeScript = script; appended++; } },
  } });
  try {
    assert.equal(appended, 0);
    const first = loadYouTubeApi();
    assert.equal(loadYouTubeApi(), first);
    assert.equal(appended, 1);
    assert.equal(activeScript!.src, "https://www.youtube.com/iframe_api");
    activeScript!.error!();
    await assert.rejects(first);
    assert.equal(activeScript, null);

    const timedOut = loadYouTubeApi();
    assert.equal(appended, 2);
    (timeout as unknown as () => void)();
    await assert.rejects(timedOut);

    const retried = loadYouTubeApi();
    assert.equal(appended, 3);
    fakeWindow.YT = { Player: class {} };
    fakeWindow.onYouTubeIframeAPIReady!();
    assert.equal(await retried, fakeWindow.YT);
    assert.equal(previousReadyCalls, 1);
    assert.equal(timeout, null);
    assert.equal(await loadYouTubeApi(), fakeWindow.YT);
    assert.equal(appended, 3);
  } finally {
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (oldDocument) Object.defineProperty(globalThis, "document", oldDocument);
    else Reflect.deleteProperty(globalThis, "document");
  }
});
