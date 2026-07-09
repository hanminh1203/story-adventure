import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  audio: {
    attachButtonClickSounds: vi.fn(),
    detachButtonClickSounds: vi.fn(),
    preloadAudio: vi.fn(() => Promise.resolve()),
    startBackgroundMusic: vi.fn(),
    stopBackgroundMusic: vi.fn(),
  },
  characterData: {
    loadCharacters: vi.fn(),
    loadCharactersFromCache: vi.fn(() => []),
  },
}));

vi.mock("./lib/audio", () => mocks.audio);
vi.mock("./lib/characterData", () => mocks.characterData);
vi.mock("./components/EmbedPrompt", () => ({ default: () => <div>embed prompt</div> }));
vi.mock("./components/AudioControls", () => ({ default: () => <div>audio controls</div> }));
vi.mock("./components/LoadingScreen", () => ({
  default: ({ visible, text }) => (visible ? <div>{text}</div> : null),
}));
vi.mock("./components/screens/StartScreen", () => ({
  default: ({ active, onStart }) =>
    active ? <button onClick={onStart}>start screen</button> : null,
}));
vi.mock("./components/screens/HowToPlayScreen", () => ({
  default: ({ active, onContinue, onGoBack }) =>
    active ? (
      <div>
        <button onClick={onContinue}>continue how to</button>
        <button onClick={onGoBack}>back how to</button>
      </div>
    ) : null,
}));
vi.mock("./components/screens/CharacterSelectScreen", () => ({
  default: ({ active, characters, onCharacterSelected, onGoBack }) =>
    active ? (
      <div>
        <div>characters:{characters.length}</div>
        <button onClick={() => onCharacterSelected(characters[0]?.id)}>pick character</button>
        <button onClick={onGoBack}>back select</button>
      </div>
    ) : null,
}));
vi.mock("./components/screens/GameplayScreen", () => ({
  default: ({ active, character, onFinalize, onExit }) =>
    active ? (
      <div>
        <div>gameplay:{character?.id}</div>
        <button
          onClick={() =>
            onFinalize({
              score: 3,
              maxScore: 5,
              character,
              collectibleName: "coins",
            })
          }
        >
          finish gameplay
        </button>
        <button onClick={onExit}>exit gameplay</button>
      </div>
    ) : null,
}));
vi.mock("./components/screens/FinalScreen", () => ({
  default: ({ active, summary, onRestart }) =>
    active ? (
      <div>
        <div>final:{summary?.score}</div>
        <button onClick={onRestart}>restart</button>
      </div>
    ) : null,
}));

import App from "./App";
import { UI_TEXT } from "./uiText";

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.characterData.loadCharacters.mockResolvedValue([
      { id: "guide-1", name: "Ella", locations: [] },
    ]);
    mocks.characterData.loadCharactersFromCache.mockReturnValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preloads audio, loads characters, and walks through the main screens", async () => {
    render(<App />);

    await waitFor(() => expect(mocks.characterData.loadCharacters).toHaveBeenCalledOnce());
    await waitFor(() => expect(mocks.audio.startBackgroundMusic).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByText("start screen"));
    fireEvent.click(screen.getByText("continue how to"));
    expect(screen.getByText("characters:1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("pick character"));
    expect(screen.getByText("gameplay:guide-1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("finish gameplay"));
    expect(screen.getByText("final:3")).toBeInTheDocument();

    fireEvent.click(screen.getByText("restart"));
    expect(screen.getByText("start screen")).toBeInTheDocument();
  });

  it("falls back to cached characters after a load failure", async () => {
    mocks.characterData.loadCharacters.mockRejectedValue(new Error("network"));
    mocks.characterData.loadCharactersFromCache.mockReturnValue([{ id: "cached", locations: [] }]);

    render(<App />);

    await waitFor(() => expect(screen.getByText("start screen")).toBeInTheDocument());
    expect(screen.queryByText(UI_TEXT.DATA_LOAD_ERROR_HTML)).not.toBeInTheDocument();
  });

  it("shows the load error html when remote and cached data both fail", async () => {
    mocks.characterData.loadCharacters.mockRejectedValue(new Error("network"));
    mocks.characterData.loadCharactersFromCache.mockReturnValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/couldn't load the adventure/i)).toBeInTheDocument();
    });
  });

  it("cleans up audio listeners on unmount", async () => {
    const { unmount } = render(<App />);
    await waitFor(() => expect(mocks.characterData.loadCharacters).toHaveBeenCalledOnce());

    unmount();

    expect(mocks.audio.detachButtonClickSounds).toHaveBeenCalledOnce();
    expect(mocks.audio.stopBackgroundMusic).toHaveBeenCalledOnce();
  });
});
