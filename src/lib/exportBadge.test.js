import { beforeEach, describe, expect, it, vi } from "vitest";
import { UI_TEXT } from "../uiText";
import {
  BADGE_SIZE,
  buildBadgeFilename,
  exportAchievementBadge,
  renderAchievementBadge,
} from "./exportBadge";

function createMockContext() {
  return {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    font: "",
    textAlign: "",
    textBaseline: "",
    shadowColor: "",
    shadowBlur: 0,
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn((text) => ({ width: String(text).length * 8 })),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arcTo: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  };
}

describe("exportBadge", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";

    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: {
        load: vi.fn().mockResolvedValue([]),
      },
    });
  });

  it("builds a safe badge filename from the character name", () => {
    expect(
      buildBadgeFilename({
        character: { name: "Princess Ella!" },
      })
    ).toBe("adventure-badge-princess-ella.png");
  });

  it("renders a compact square badge from the completion summary", async () => {
    const context = createMockContext();
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
      toBlob: vi.fn((callback) => callback(new Blob(["badge"], { type: "image/png" }))),
    };

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "canvas") return canvas;
      return originalCreateElement(tagName);
    });

    const result = await renderAchievementBadge({
      score: 8,
      maxScore: 10,
      collectibleName: "stars",
      character: {
        name: "Ella",
        themeColor: "#6fa8ff",
      },
    });

    expect(result).toBe(canvas);
    expect(canvas.width).toBe(BADGE_SIZE);
    expect(canvas.height).toBe(BADGE_SIZE);
    expect(context.fillText).toHaveBeenCalledWith(UI_TEXT.BADGE_CONGRATULATIONS_TEXT, BADGE_SIZE / 2, 42);
    expect(context.fillText).toHaveBeenCalledWith("Ella", BADGE_SIZE / 2, 74);
    expect(context.fillText).toHaveBeenCalledWith("8", BADGE_SIZE / 2, 154);
    expect(context.fillText).toHaveBeenCalledWith(UI_TEXT.ACHIEVEMENT_TITLE_3_STAR, BADGE_SIZE / 2, 194);
    expect(context.fillText).toHaveBeenCalledWith(
      "8 of 10 stars",
      BADGE_SIZE / 2,
      224
    );
  });

  it("downloads the rendered badge as a png", async () => {
    const context = createMockContext();
    const canvas = {
      width: BADGE_SIZE,
      height: BADGE_SIZE,
      getContext: vi.fn(() => context),
      toBlob: vi.fn((callback) => callback(new Blob(["badge"], { type: "image/png" }))),
    };

    const originalCreateElement = document.createElement.bind(document);
    const link = { href: "", download: "", click: vi.fn() };
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "canvas") return canvas;
      if (tagName === "a") return link;
      return originalCreateElement(tagName);
    });

    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    vi.spyOn(URL, "createObjectURL").mockImplementation(createObjectURL);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(revokeObjectURL);

    await exportAchievementBadge({
      score: 4,
      maxScore: 10,
      collectibleName: "coins",
      character: { name: "Leo" },
    });

    expect(createObjectURL).toHaveBeenCalled();
    expect(link.click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });
});
