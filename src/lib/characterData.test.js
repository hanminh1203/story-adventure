import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CHARACTERS_CACHE_KEY } from "../constants";
import { loadCharacters, loadCharactersFromCache, normalizeCharacters } from "./characterData";

describe("characterData helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes image lists, coordinates, and media urls", () => {
    const [character] = normalizeCharacters({
      characters: [
        {
          avatarUrl: " https://example.com/avatar.png ",
          collectibleImage: "javascript:bad",
          locations: [
            {
              lat: "1.2",
              lon: "3.4",
              height: "5",
              images: " https://example.com/1.jpg | javascript:bad | assets/2.jpg ",
            },
          ],
        },
      ],
    });

    expect(character.avatarUrl).toBe("https://example.com/avatar.png");
    expect(character.collectibleImage).toBe("");
    expect(character.locations[0]).toMatchObject({
      lat: 1.2,
      lon: 3.4,
      height: 5,
      images: ["https://example.com/1.jpg", "assets/2.jpg"],
    });
  });

  it("loads remote characters and caches the normalized result", async () => {
    const payload = {
      characters: [
        {
          id: "a",
          locations: [{ name: "Beach", lat: "1", lon: "2", height: "3", images: [] }],
        },
      ],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => payload,
      })
    );

    const characters = await loadCharacters();

    expect(fetch).toHaveBeenCalledOnce();
    expect(characters[0].locations[0].lat).toBe(1);
    expect(JSON.parse(localStorage.getItem(CHARACTERS_CACHE_KEY))).toEqual(characters);
  });

  it("throws when the fetch response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    );

    await expect(loadCharacters()).rejects.toThrow("Failed to load characters (500)");
  });

  it("throws when the payload contains an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ error: "bad sheet" }),
      })
    );

    await expect(loadCharacters()).rejects.toThrow("bad sheet");
  });

  it("reads valid cached characters and ignores broken cache values", () => {
    const cached = [{ id: "a" }];
    localStorage.setItem(CHARACTERS_CACHE_KEY, JSON.stringify(cached));
    expect(loadCharactersFromCache()).toEqual(cached);

    localStorage.setItem(CHARACTERS_CACHE_KEY, "{bad json");
    expect(loadCharactersFromCache()).toEqual([]);
  });
});
