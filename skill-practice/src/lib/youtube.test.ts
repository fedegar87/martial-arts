import assert from "node:assert/strict";
import test from "node:test";
import { extractYouTubeId, hasPlayableVideo } from "./youtube.ts";

test("extractYouTubeId supports common YouTube URL formats", () => {
  assert.equal(
    extractYouTubeId("https://www.youtube.com/watch?v=abcdefghijk"),
    "abcdefghijk",
  );
  assert.equal(extractYouTubeId("https://youtu.be/abcdefghijk"), "abcdefghijk");
  assert.equal(
    extractYouTubeId("https://www.youtube.com/embed/abcdefghijk"),
    "abcdefghijk",
  );
  assert.equal(extractYouTubeId("abcdefghijk"), "abcdefghijk");
});

test("extractYouTubeId rejects placeholders and invalid values", () => {
  assert.equal(
    extractYouTubeId("https://www.youtube.com/watch?v=PLACEHOLDER"),
    null,
  );
  assert.equal(extractYouTubeId("not a url"), null);
});

test("hasPlayableVideo exposes video availability as a boolean marker", () => {
  assert.equal(hasPlayableVideo("https://youtu.be/abcdefghijk"), true);
  assert.equal(hasPlayableVideo("https://www.youtube.com/watch?v=PLACEHOLDER"), false);
  assert.equal(hasPlayableVideo(null), false);
});

test("extractYouTubeId validates every URL format and rejects injected parameters", () => {
  for (const value of [
    "https://www.youtube.com/watch?v=abc",
    "https://www.youtube.com/watch?v=abcdefghijkl",
    "https://www.youtube.com/watch?v=abcdefghijk%3Fautoplay%3D1",
    "https://www.youtube.com/watch?v=abcdefghijk&v=lmnopqrstuv",
    "https://youtu.be/abc",
    "https://youtube.com/embed/abc",
    "https://youtube.com/shorts/abc",
    "https://youtube.com/embed/abcdefghijk/extra",
    "https://youtube.com.evil.example/watch?v=abcdefghijk",
    "https://evil.example/youtube.com/watch?v=abcdefghijk",
    "ftp://youtube.com/watch?v=abcdefghijk",
    "https://user:password@youtube.com/watch?v=abcdefghijk",
    "https://youtube.com:8080/watch?v=abcdefghijk",
    "javascript:alert(1)",
    "https://youtube-nocookie.com/watch?v=abcdefghijk",
  ]) {
    assert.equal(extractYouTubeId(value), null, value);
    assert.equal(hasPlayableVideo(value), false, value);
  }
});

test("extractYouTubeId preserves supported formats and normalizes surrounding whitespace", () => {
  for (const value of [
    " abcdefghijk ",
    "https://m.youtube.com/watch?v=abcdefghijk&t=20",
    "https://youtube.com/shorts/abcdefghijk",
    "https://youtu.be/abcdefghijk/?t=20",
    "https://www.youtube-nocookie.com/embed/abcdefghijk",
    "http://www.youtube.com/watch?v=abcdefghijk",
  ]) assert.equal(extractYouTubeId(value), "abcdefghijk", value);
});
