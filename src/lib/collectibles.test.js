import { describe, expect, it, vi } from "vitest";
import { COLLECTIBLES_PER_SLIDE } from "../constants";
import { UI_TEXT } from "../uiText";
import {
  areAllCollectiblesCollectedForSlide,
  countCollectedCollectiblesForLocation,
  countCollectiblesForLocation,
  countCollectiblesForTour,
  formatCollectGoal,
  formatCollectibleLabel,
  generateBalancedPositions,
  getCharacterAvatarImage,
  getCharacterCollectibleImage,
  getCharacterCollectibleName,
  getCollectibleSingular,
  getStarRating,
  getTutorialSteps,
  isLocationFullyCollected,
  makeCollectibleId,
} from "./collectibles";

describe("collectibles helpers", () => {
  it("generates one balanced position per collectible slot", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const positions = generateBalancedPositions();

    expect(positions).toHaveLength(COLLECTIBLES_PER_SLIDE);
    positions.forEach((position) => {
      expect(position.x).toBeGreaterThan(0);
      expect(position.y).toBeGreaterThan(0);
    });
  });

  it("returns fallback names and images when missing", () => {
    expect(getCharacterCollectibleName(null)).toBe(UI_TEXT.DEFAULT_COLLECTIBLE_NAME);
    expect(getCharacterCollectibleImage(null)).toBe("assets/collectible-coin.svg");
    expect(getCharacterAvatarImage(null)).toBe("assets/avatar-princess.svg");
  });

  it("formats score and goal labels", () => {
    expect(formatCollectibleLabel("stars")).toContain("Stars");
    expect(formatCollectibleLabel("")).toBe(UI_TEXT.SCORE_LABEL_FALLBACK);
    expect(formatCollectGoal({ collectibleName: "stars" })).toContain("stars");
  });

  it("converts plural collectible names to singular forms", () => {
    expect(getCollectibleSingular("music notes")).toBe(UI_TEXT.COLLECTIBLE_SINGULAR_MUSIC_NOTES);
    expect(getCollectibleSingular("coins")).toBe("coin");
    expect(getCollectibleSingular("")).toBe(UI_TEXT.COLLECTIBLE_SINGULAR_FALLBACK);
  });

  it("counts collectible totals and collected status", () => {
    const location = { name: "Beach", images: ["1.jpg", "2.jpg"] };
    const itemA = makeCollectibleId(location, 0, 0);
    const itemB = makeCollectibleId(location, 1, 2);
    const collected = new Set([itemA, itemB]);

    expect(countCollectiblesForLocation(location)).toBe(COLLECTIBLES_PER_SLIDE * 2);
    expect(countCollectiblesForTour([location, { name: "Park", images: ["3.jpg"] }])).toBe(
      COLLECTIBLES_PER_SLIDE * 3
    );
    expect(countCollectedCollectiblesForLocation(location, collected)).toBe(2);
    expect(isLocationFullyCollected(location, collected)).toBe(false);
  });

  it("detects when a location and slide are fully collected", () => {
    const location = { name: "Museum", images: ["1.jpg"] };
    const collected = new Set(
      Array.from({ length: COLLECTIBLES_PER_SLIDE }, (_, index) => makeCollectibleId(location, 0, index))
    );

    expect(areAllCollectiblesCollectedForSlide(location, 0, collected)).toBe(true);
    expect(isLocationFullyCollected(location, collected)).toBe(true);
    expect(isLocationFullyCollected({ name: "Empty", images: [] }, collected)).toBe(false);
  });

  it("calculates the displayed star rating", () => {
    expect(getStarRating(0, 0)).toBe(1);
    expect(getStarRating(3, 10)).toBe(1);
    expect(getStarRating(4, 10)).toBe(2);
    expect(getStarRating(8, 10)).toBe(3);
  });

  it("builds tutorial steps using character data", () => {
    const steps = getTutorialSteps({ name: "Ella", collectibleName: "coins" });

    expect(steps).toHaveLength(3);
    expect(steps[0].message).toContain("Ella");
    expect(steps[1].target).toBe(".pin-details-btn");
    expect(steps[2].message).toContain("coins");
  });
});
