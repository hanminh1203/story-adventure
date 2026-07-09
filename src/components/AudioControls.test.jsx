import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AudioControls from "./AudioControls";

const mocks = vi.hoisted(() => {
  const state = { sfxEnabled: true, musicEnabled: true };
  return {
    state,
    subscribeAudioSettings: vi.fn(() => () => {}),
    getAudioSettings: vi.fn(() => state),
    toggleMusicEnabled: vi.fn(),
    toggleSfxEnabled: vi.fn(),
  };
});

vi.mock("../lib/audio", () => ({
  subscribeAudioSettings: mocks.subscribeAudioSettings,
  getAudioSettings: mocks.getAudioSettings,
  toggleMusicEnabled: mocks.toggleMusicEnabled,
  toggleSfxEnabled: mocks.toggleSfxEnabled,
}));

describe("AudioControls", () => {
  beforeEach(() => {
    mocks.state.musicEnabled = true;
    mocks.state.sfxEnabled = true;
    vi.clearAllMocks();
  });

  it("renders pressed toggle buttons and calls the music/sfx handlers", () => {
    render(<AudioControls />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(mocks.toggleMusicEnabled).toHaveBeenCalledOnce();
    expect(mocks.toggleSfxEnabled).toHaveBeenCalledOnce();
  });

  it("updates labels when audio settings are muted", () => {
    mocks.state.musicEnabled = false;
    mocks.state.sfxEnabled = false;

    render(<AudioControls />);

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false");
  });
});
