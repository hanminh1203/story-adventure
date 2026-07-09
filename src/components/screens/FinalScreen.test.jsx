import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UI_TEXT } from "../../uiText";
import FinalScreen from "./FinalScreen";

const mocks = vi.hoisted(() => ({
  exportAchievementBadge: vi.fn(),
}));

vi.mock("../../lib/exportBadge", () => ({
  exportAchievementBadge: mocks.exportAchievementBadge,
}));

vi.mock("../../lib/motion", () => ({
  prefersReducedMotion: () => true,
}));

const summary = {
  score: 8,
  maxScore: 10,
  collectibleName: "stars",
  character: {
    name: "Ella",
    themeColor: "#6fa8ff",
  },
};

describe("FinalScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.exportAchievementBadge.mockResolvedValue(undefined);
  });

  it("exports a badge when the save button is pressed", async () => {
    render(<FinalScreen active summary={summary} onRestart={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: UI_TEXT.EXPORT_BADGE_BTN_ARIA_LABEL }));

    await waitFor(() => {
      expect(mocks.exportAchievementBadge).toHaveBeenCalledWith(summary);
    });
  });

  it("shows a gentle error when badge export fails", async () => {
    mocks.exportAchievementBadge.mockRejectedValueOnce(new Error("export failed"));

    render(<FinalScreen active summary={summary} onRestart={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: UI_TEXT.EXPORT_BADGE_BTN_ARIA_LABEL }));

    expect(await screen.findByRole("alert")).toHaveTextContent(UI_TEXT.EXPORT_BADGE_ERROR);
  });
});
