import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/audio", () => ({
  playCollectPickup: vi.fn(),
}));

vi.mock("../lib/collectibles", async () => {
  const actual = await vi.importActual("../lib/collectibles");
  return {
    ...actual,
    generateBalancedPositions: vi.fn(() => [
      { x: 10, y: 20 },
      { x: 50, y: 40 },
      { x: 80, y: 60 },
    ]),
  };
});

import { playCollectPickup } from "../lib/audio";
import { COLLECTIBLES_PER_SLIDE, COLLECTIBLE_IDLE_HINT_DELAY_MS } from "../constants";
import { useSlideshow } from "./useSlideshow";

function createCesium() {
  return {
    isFlying: false,
    saveOverviewCamera: vi.fn(),
    hidePinPanel: vi.fn(),
    setIsFlying: vi.fn(),
    flyToDetailViewCamera: vi.fn((loc, callbacks) => callbacks.onComplete()),
    getOverviewCamera: vi.fn(() => ({ id: "overview" })),
    showPinPanel: vi.fn(),
    clearOverviewCamera: vi.fn(),
    restoreOverviewCameraView: vi.fn((callbacks) => callbacks.onComplete()),
  };
}

const character = { collectibleName: "coins" };
const location = { name: "Beach", images: ["a.jpg", "b.jpg"] };

describe("useSlideshow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("opens and closes details through Cesium camera callbacks", () => {
    const cesium = createCesium();
    const tutorial = { notifyDetailsOpened: vi.fn() };
    const { result } = renderHook(() =>
      useSlideshow({ character, cesium, getTutorial: () => tutorial })
    );

    act(() => result.current.showDetailsPopup(location));

    expect(cesium.saveOverviewCamera).toHaveBeenCalledOnce();
    expect(result.current.detailsVisible).toBe(true);
    expect(result.current.slideshowLocation).toEqual(location);
    expect(result.current.slideshowIndex).toBe(0);
    expect(tutorial.notifyDetailsOpened).toHaveBeenCalledOnce();

    act(() => result.current.hideDetailsPopup());
    expect(cesium.restoreOverviewCameraView).toHaveBeenCalledOnce();
    expect(result.current.detailsVisible).toBe(false);
    expect(cesium.showPinPanel).toHaveBeenCalled();
  });

  it("does not reopen details when already busy", () => {
    const cesium = createCesium();
    cesium.isFlying = true;
    const { result } = renderHook(() =>
      useSlideshow({ character, cesium, getTutorial: () => null })
    );

    act(() => result.current.showDetailsPopup(location));
    expect(cesium.flyToDetailViewCamera).not.toHaveBeenCalled();
  });

  it("changes slides cyclically and memoizes collectible positions per slide", () => {
    const cesium = createCesium();
    const { result } = renderHook(() =>
      useSlideshow({ character, cesium, getTutorial: () => null })
    );

    act(() => result.current.showDetailsPopup(location));
    expect(result.current.getCollectiblesForSlide(location, 0)).toEqual([
      { x: 10, y: 20 },
      { x: 50, y: 40 },
      { x: 80, y: 60 },
    ]);
    expect(result.current.getCollectiblesForSlide(location, 0)).toBe(
      result.current.getCollectiblesForSlide(location, 0)
    );

    act(() => result.current.changeSlide(1));
    expect(result.current.slideshowIndex).toBe(1);

    act(() => result.current.changeSlide(1));
    expect(result.current.slideshowIndex).toBe(0);
  });

  it("collects items, plays feedback, and marks slides/locations complete", () => {
    const cesium = createCesium();
    const tutorial = { notifyItemCollected: vi.fn() };
    const { result } = renderHook(() =>
      useSlideshow({ character, cesium, getTutorial: () => tutorial })
    );

    act(() => result.current.showDetailsPopup({ name: "Beach", images: ["a.jpg"] }));

    for (let index = 0; index < COLLECTIBLES_PER_SLIDE; index++) {
      act(() => result.current.collectItem(`Beach:0:${index}`, { x: 10 + index, y: 20 }));
    }

    expect(playCollectPickup).toHaveBeenCalledTimes(COLLECTIBLES_PER_SLIDE);
    expect(result.current.score).toBe(COLLECTIBLES_PER_SLIDE);
    expect(result.current.slideAllCollected).toBe(true);
    expect(tutorial.notifyItemCollected).toHaveBeenCalledTimes(COLLECTIBLES_PER_SLIDE);

    act(() => vi.advanceTimersByTime(220));
    expect(result.current.removingCollectibleIds.size).toBe(0);

    act(() => vi.advanceTimersByTime(600));
    expect(result.current.collectFeedback).toBeNull();

    act(() => result.current.hideAchievementToast());
    expect(result.current.achievementToast.visible).toBe(false);
  });

  it("ignores duplicate item collection and can fully reset state", () => {
    const cesium = createCesium();
    const { result } = renderHook(() =>
      useSlideshow({ character, cesium, getTutorial: () => null })
    );

    act(() => result.current.showDetailsPopup(location));
    act(() => result.current.collectItem("Beach:0:0", { x: 1, y: 2 }));
    act(() => result.current.collectItem("Beach:0:0", { x: 1, y: 2 }));

    expect(result.current.score).toBe(1);

    act(() => result.current.resetSlideshow());
    expect(result.current.score).toBe(0);
    expect(result.current.collectedItems.size).toBe(0);
    expect(result.current.detailsVisible).toBe(false);
    expect(cesium.clearOverviewCamera).toHaveBeenCalled();
  });

  it("can close immediately without restoring the camera", () => {
    const cesium = createCesium();
    const { result } = renderHook(() =>
      useSlideshow({ character, cesium, getTutorial: () => null })
    );

    act(() => result.current.showDetailsPopup(location));
    act(() => result.current.hideDetailsPopup({ restoreCamera: false }));

    expect(cesium.restoreOverviewCameraView).not.toHaveBeenCalled();
    expect(cesium.clearOverviewCamera).toHaveBeenCalled();
  });

  it("shows a collectible hint after idle time on an uncollected slide", () => {
    const cesium = createCesium();
    const { result } = renderHook(() =>
      useSlideshow({ character, cesium, getTutorial: () => null })
    );

    act(() => result.current.showDetailsPopup(location));
    expect(result.current.collectibleHintActive).toBe(false);

    act(() => vi.advanceTimersByTime(COLLECTIBLE_IDLE_HINT_DELAY_MS - 1));
    expect(result.current.collectibleHintActive).toBe(false);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.collectibleHintActive).toBe(true);

    act(() => result.current.collectItem("Beach:0:0", { x: 1, y: 2 }));
    expect(result.current.collectibleHintActive).toBe(false);
  });

  it("does not show collectible hints while the tutorial is active", () => {
    const cesium = createCesium();
    const { result } = renderHook(() =>
      useSlideshow({
        character,
        cesium,
        getTutorial: () => ({ tutorialActive: true }),
      })
    );

    act(() => result.current.showDetailsPopup(location));
    act(() => vi.advanceTimersByTime(COLLECTIBLE_IDLE_HINT_DELAY_MS));

    expect(result.current.collectibleHintActive).toBe(false);
  });
});
