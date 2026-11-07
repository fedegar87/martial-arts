import assert from "node:assert/strict";
import test from "node:test";
import { getSkillVideoVariants, localVideoThumbnailUrl, selectSkillVideo } from "./skill-video.ts";

const skill = {
  video_url: "https://youtu.be/abcdefghijk",
  video_label: " Forma Tan Tao (sciabola) ",
  secondary_video_url: "https://youtube.com/watch?v=lmnopqrstuv",
  secondary_video_label: "Forma Pang Fa (bastone corto)",
  thumbnail_url: "/video-thumbnails/tan-tao.webp",
};

test("video variants retain database labels and associate the thumbnail only with the primary", () => {
  const variants = getSkillVideoVariants(skill);
  assert.equal(variants.length, 2);
  assert.equal(variants[0].label, "Forma Tan Tao (sciabola)");
  assert.equal(variants[1].label, skill.secondary_video_label);
  assert.equal(variants[0].thumbnailUrl, skill.thumbnail_url);
  assert.equal(variants[1].thumbnailUrl, null);
  assert.equal(selectSkillVideo(variants, "2")?.videoId, "lmnopqrstuv");
});

test("video selection falls back safely for absent, invalid and repeated query parameters", () => {
  const variants = getSkillVideoVariants(skill);
  for (const value of [undefined, "1", "3", "", ["2", "1"], ["2"]]) {
    assert.equal(selectSkillVideo(variants, value)?.value, "1");
  }
});

test("missing video combinations select the first valid source without renumbering the secondary", () => {
  const primaryOnly = getSkillVideoVariants({ ...skill, secondary_video_url: null });
  assert.deepEqual(primaryOnly.map((video) => video.value), ["1"]);
  assert.equal(selectSkillVideo(primaryOnly, "2")?.value, "1");

  const secondaryOnly = getSkillVideoVariants({ ...skill, video_url: "PLACEHOLDER" });
  assert.deepEqual(secondaryOnly.map((video) => video.value), ["2"]);
  assert.equal(selectSkillVideo(secondaryOnly, undefined)?.value, "2");
  assert.equal(secondaryOnly[0].thumbnailUrl, null);

  const unavailable = getSkillVideoVariants({ ...skill, video_url: "", secondary_video_url: "invalid" });
  assert.deepEqual(unavailable, []);
  assert.equal(selectSkillVideo(unavailable, "2"), null);
});

test("video variants deduplicate equivalent YouTube URLs and supply neutral fallback labels", () => {
  const variants = getSkillVideoVariants({
    ...skill,
    video_label: " ",
    secondary_video_url: "https://youtube.com/watch?v=abcdefghijk",
  });
  assert.equal(variants.length, 1);
  assert.equal(variants[0].label, "Video principale");
  assert.equal(getSkillVideoVariants({ ...skill, secondary_video_label: null })[1].label, "Secondo video");
});

test("local thumbnails allow only dedicated static raster paths", () => {
  for (const path of ["/video-thumbnails/forma-1.webp", "/video-thumbnails/forma_2.JPG", "/video-thumbnails/forma.avif"]) {
    assert.equal(localVideoThumbnailUrl(path), path);
  }
  for (const path of [
    null, undefined, "", "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg",
    "//i.ytimg.com/image.jpg", "/api/image.jpg", "/video-thumbnails/../image.jpg",
    "/video-thumbnails/%2e%2e/image.jpg", "/video-thumbnails/sub/image.jpg",
    "/video-thumbnails/image.svg", "/video-thumbnails/image.jpg?redirect=https://example.com",
    "/video-thumbnails/image.jpg#hash", "/video-thumbnails/image\\.jpg",
  ]) assert.equal(localVideoThumbnailUrl(path), null, String(path));
});
