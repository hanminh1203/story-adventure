import { describe, expect, it } from "vitest";
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeVideoId,
  isSafeMediaUrl,
  sanitizeMediaUrl,
  splitCell,
} from "./media";

describe("media helpers", () => {
  it("splits pipe-delimited cells and trims blanks", () => {
    expect(splitCell(" one | two || three ")).toEqual(["one", "two", "three"]);
  });

  it("accepts local asset paths and http urls", () => {
    expect(isSafeMediaUrl("assets/image.png")).toBe(true);
    expect(isSafeMediaUrl("./assets/image.png")).toBe(true);
    expect(isSafeMediaUrl("https://example.com/image.png")).toBe(true);
    expect(isSafeMediaUrl("http://example.com/image.png")).toBe(true);
  });

  it("rejects unsafe or empty urls", () => {
    expect(isSafeMediaUrl("")).toBe(false);
    expect(isSafeMediaUrl("javascript:alert(1)")).toBe(false);
    expect(sanitizeMediaUrl(" javascript:alert(1) ")).toBe("");
  });

  it("sanitizes safe urls by trimming whitespace", () => {
    expect(sanitizeMediaUrl(" https://example.com/video ")).toBe("https://example.com/video");
  });

  it("extracts youtube ids from multiple formats", () => {
    expect(extractYouTubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ?t=10")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("bad dQw4w9WgXcQ text")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("not-a-video")).toBe("not-a-video");
  });

  it("builds embed urls only when a youtube id exists", () => {
    expect(getYouTubeEmbedUrl({ youtubeUrl: "https://youtu.be/dQw4w9WgXcQ" })).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
    expect(getYouTubeEmbedUrl({ youtubeUrl: "" })).toBe("");
  });

  it("reads youtube ids from character objects", () => {
    expect(getYouTubeVideoId({ youtubeUrl: "https://youtu.be/dQw4w9WgXcQ" })).toBe("dQw4w9WgXcQ");
    expect(getYouTubeVideoId({ youtubeUrl: "" })).toBe("");
  });
});
