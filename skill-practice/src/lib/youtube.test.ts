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
