import { describe, expect, it, vi } from "vitest";
import { flightDuration, prefersReducedMotion } from "./motion";

describe("motion helpers", () => {
  it("reads reduced motion preference from matchMedia", () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true });
    window.matchMedia = matchMedia;

    expect(prefersReducedMotion()).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });

  it("returns zero duration when reduced motion is enabled", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    expect(flightDuration(2)).toBe(0);
  });

  it("returns the base duration when reduced motion is disabled", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    expect(flightDuration(2)).toBe(2);
  });
});
