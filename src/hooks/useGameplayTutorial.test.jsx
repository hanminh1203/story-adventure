import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useGameplayTutorial } from "./useGameplayTutorial";

const character = { name: "Ella", collectibleName: "coins" };

describe("useGameplayTutorial", () => {
  it("starts with the first tutorial step and can be skipped", () => {
    const { result } = renderHook((props) => useGameplayTutorial(props), {
      initialProps: {
        active: true,
        character,
        currentIndex: 0,
        pinPanelOpen: false,
        detailsVisible: false,
        slideshowLocation: null,
        slideshowIndex: 0,
      },
    });

    act(() => result.current.startTutorial());
    expect(result.current.tutorialActive).toBe(true);
    expect(result.current.tutorialStep).toBe(1);
    expect(result.current.tutorialConfig.message).toContain("Ella");

    act(() => result.current.skipTutorial());
    expect(result.current.tutorialActive).toBe(false);
    expect(result.current.tutorialConfig).toBeNull();
  });

  it("advances when the first pin panel opens", () => {
    const { result, rerender } = renderHook((props) => useGameplayTutorial(props), {
      initialProps: {
        active: true,
        character,
        currentIndex: 0,
        pinPanelOpen: false,
        detailsVisible: false,
        slideshowLocation: null,
        slideshowIndex: 0,
      },
    });

    act(() => result.current.startTutorial());
    rerender({
      active: true,
      character,
      currentIndex: 0,
      pinPanelOpen: true,
      detailsVisible: false,
      slideshowLocation: null,
      slideshowIndex: 0,
    });

    expect(result.current.tutorialStep).toBe(2);
    expect(result.current.tutorialSpotlightSelector).toBe(".pin-details-btn");
  });

  it("moves to the collectible step when details open", () => {
    const { result } = renderHook((props) => useGameplayTutorial(props), {
      initialProps: {
        active: true,
        character,
        currentIndex: 0,
        pinPanelOpen: false,
        detailsVisible: false,
        slideshowLocation: null,
        slideshowIndex: 0,
      },
    });

    act(() => result.current.startTutorial());
    act(() => result.current.notifyDetailsOpened());
    expect(result.current.tutorialStep).toBe(1);

    act(() => {
      result.current.startTutorial();
      result.current.notifyDetailsOpened();
    });
    expect(result.current.tutorialStep).toBe(1);
  });

  it("spotlights collectibles and ends when one is collected", () => {
    const { result, rerender } = renderHook((props) => useGameplayTutorial(props), {
      initialProps: {
        active: true,
        character,
        currentIndex: 0,
        pinPanelOpen: false,
        detailsVisible: false,
        slideshowLocation: null,
        slideshowIndex: 0,
      },
    });

    act(() => result.current.startTutorial());
    rerender({
      active: true,
      character,
      currentIndex: 0,
      pinPanelOpen: true,
      detailsVisible: false,
      slideshowLocation: null,
      slideshowIndex: 0,
    });
    act(() => result.current.notifyDetailsOpened());
    rerender({
      active: true,
      character,
      currentIndex: 0,
      pinPanelOpen: true,
      detailsVisible: true,
      slideshowLocation: { images: ["1.jpg"] },
      slideshowIndex: 0,
    });

    expect(result.current.tutorialStep).toBe(3);
    expect(result.current.tutorialSpotlightSelector).toBe(".collectible-item");

    act(() => result.current.notifyItemCollected());
    expect(result.current.tutorialActive).toBe(false);
  });

  it("ends when the details step has no images or when leaving the first stop", () => {
    const { result, rerender } = renderHook((props) => useGameplayTutorial(props), {
      initialProps: {
        active: true,
        character,
        currentIndex: 0,
        pinPanelOpen: false,
        detailsVisible: false,
        slideshowLocation: null,
        slideshowIndex: 0,
      },
    });

    act(() => result.current.startTutorial());
    rerender({
      active: true,
      character,
      currentIndex: 0,
      pinPanelOpen: true,
      detailsVisible: false,
      slideshowLocation: null,
      slideshowIndex: 0,
    });
    act(() => result.current.notifyDetailsOpened());
    rerender({
      active: true,
      character,
      currentIndex: 0,
      pinPanelOpen: true,
      detailsVisible: true,
      slideshowLocation: { images: [] },
      slideshowIndex: 0,
    });
    expect(result.current.tutorialActive).toBe(false);

    act(() => result.current.startTutorial());
    act(() => result.current.notifyLeftFirstStop());
    expect(result.current.tutorialActive).toBe(false);
  });
});
