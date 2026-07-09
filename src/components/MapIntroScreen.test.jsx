import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MapIntroScreen from "./MapIntroScreen";
import { UI_TEXT } from "../uiText";

vi.mock("../hooks/useYouTubeIntroPlayer", () => ({
  useYouTubeIntroPlayer: () => ({ containerRef: { current: null } }),
}));

describe("MapIntroScreen", () => {
  const mapReadyRef = { current: false };

  it("shows loading text while the map is still loading", () => {
    render(
      <MapIntroScreen
        visible
        character={{ youtubeUrl: "https://youtu.be/dQw4w9WgXcQ" }}
        mapReady={false}
        mapReadyRef={mapReadyRef}
        onSkip={vi.fn()}
        onVideoEnded={vi.fn()}
      />
    );

    expect(screen.getByText(UI_TEXT.MAP_LOADING_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: UI_TEXT.MAP_INTRO_SKIP_BTN_TEXT })).not.toBeInTheDocument();
  });

  it("shows the skip button once the map is ready", () => {
    render(
      <MapIntroScreen
        visible
        character={{ youtubeUrl: "https://youtu.be/dQw4w9WgXcQ" }}
        mapReady
        mapReadyRef={mapReadyRef}
        onSkip={vi.fn()}
        onVideoEnded={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: UI_TEXT.MAP_INTRO_SKIP_BTN_TEXT })).toBeInTheDocument();
    expect(screen.queryByText(UI_TEXT.MAP_LOADING_TEXT)).not.toBeInTheDocument();
  });

  it("falls back to the loading spinner when the guide has no intro video", () => {
    render(
      <MapIntroScreen
        visible
        character={{ youtubeUrl: "" }}
        mapReady={false}
        mapReadyRef={mapReadyRef}
        onSkip={vi.fn()}
        onVideoEnded={vi.fn()}
      />
    );

    expect(screen.getByText(UI_TEXT.MAP_LOADING_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: UI_TEXT.MAP_INTRO_SKIP_BTN_TEXT })).not.toBeInTheDocument();
  });
});
