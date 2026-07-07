import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useCenteredCarousel } from "./useCenteredCarousel";

describe("useCenteredCarousel", () => {
  it("returns no items and centered index 0 without a container", () => {
    const ref = createRef();
    const { result } = renderHook(() => useCenteredCarousel(ref, ".item"));

    expect(result.current.getItems()).toEqual([]);
    expect(result.current.getCenteredIndex()).toBe(0);
  });

  it("finds the item closest to the visual center", () => {
    const ref = {
      current: {
        clientWidth: 100,
        scrollLeft: 75,
        querySelectorAll: () => [
          { offsetLeft: 0, offsetWidth: 50 },
          { offsetLeft: 100, offsetWidth: 50 },
          { offsetLeft: 200, offsetWidth: 50 },
        ],
      },
    };

    const { result } = renderHook(() => useCenteredCarousel(ref, ".item"));
    expect(result.current.getCenteredIndex()).toBe(1);
  });

  it("scrolls to an item with smooth behavior by default", () => {
    const scrollIntoView = vi.fn();
    const ref = {
      current: {
        querySelectorAll: () => [{ scrollIntoView }],
      },
    };
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    const { result } = renderHook(() => useCenteredCarousel(ref, ".item"));
    result.current.scrollToItem(0);

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  });

  it("uses auto behavior for instant scrolls or reduced motion", () => {
    const instantScroll = vi.fn();
    const reducedMotionScroll = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    const ref = {
      current: {
        querySelectorAll: () => [{ scrollIntoView: instantScroll }, { scrollIntoView: reducedMotionScroll }],
      },
    };

    const { result } = renderHook(() => useCenteredCarousel(ref, ".item"));
    result.current.scrollToItem(0, "instant");
    result.current.scrollToItem(1);

    expect(instantScroll).toHaveBeenCalledWith({
      behavior: "auto",
      inline: "center",
      block: "nearest",
    });
    expect(reducedMotionScroll).toHaveBeenCalledWith({
      behavior: "auto",
      inline: "center",
      block: "nearest",
    });
  });
});
