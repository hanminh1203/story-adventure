import { useCallback, useEffect, useMemo, useState } from "react";
import { loadCharacters, loadCharactersFromCache } from "./lib/characterData";
import { UI_TEXT } from "./uiText";
import {
  attachButtonClickSounds,
  detachButtonClickSounds,
  preloadAudio,
  startBackgroundMusic,
  stopBackgroundMusic,
} from "./lib/audio";
import EmbedPrompt from "./components/EmbedPrompt";
import AudioControls from "./components/AudioControls";
import LoadingScreen from "./components/LoadingScreen";
import StartScreen from "./components/screens/StartScreen";
import HowToPlayScreen from "./components/screens/HowToPlayScreen";
import CharacterSelectScreen from "./components/screens/CharacterSelectScreen";
import GameplayScreen from "./components/screens/GameplayScreen";
import FinalScreen from "./components/screens/FinalScreen";

export default function App() {
  const [characters, setCharacters] = useState([]);
  const [startupLoading, setStartupLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [currentState, setCurrentState] = useState("start");
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [gameSummary, setGameSummary] = useState(null);

  useEffect(() => {
    let active = true;

    attachButtonClickSounds();
    preloadAudio().then(() => {
      if (active) startBackgroundMusic();
    });

    return () => {
      active = false;
      detachButtonClickSounds();
      stopBackgroundMusic();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const loaded = await loadCharacters();
        if (!cancelled) setCharacters(loaded);
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          const cached = loadCharactersFromCache();
          if (cached.length) {
            setCharacters(cached);
          } else {
            setLoadError(true);
          }
        }
      } finally {
        if (!cancelled) setStartupLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCharacter = useMemo(
    () => characters.find((c) => c.id === selectedCharacterId) || null,
    [characters, selectedCharacterId]
  );

  const transitionTo = useCallback((state) => {
    setCurrentState(state);
  }, []);

  const onStart = useCallback(() => {
    transitionTo("howToPlay");
  }, [transitionTo]);

  const onHowToContinue = useCallback(() => {
    transitionTo("characterSelect");
  }, [transitionTo]);

  const onHowToGoBack = useCallback(() => {
    transitionTo("start");
  }, [transitionTo]);

  const onGoBack = useCallback(() => {
    transitionTo("howToPlay");
  }, [transitionTo]);

  const onCharacterSelected = useCallback(
    (characterId) => {
      setSelectedCharacterId(characterId);
      transitionTo("gameplay");
    },
    [transitionTo]
  );

  const onGameFinalized = useCallback(
    (summary) => {
      setGameSummary(summary);
      transitionTo("final");
    },
    [transitionTo]
  );

  const onExit = useCallback(() => {
    transitionTo("start");
  }, [transitionTo]);

  const onRestart = useCallback(() => {
    transitionTo("start");
  }, [transitionTo]);

  if (loadError) {
    return <div dangerouslySetInnerHTML={{ __html: UI_TEXT.DATA_LOAD_ERROR_HTML }} />;
  }

  return (
    <>
      <GameplayScreen
        active={currentState === "gameplay"}
        character={selectedCharacter}
        onFinalize={onGameFinalized}
        onExit={onExit}
      />
      <StartScreen active={currentState === "start"} onStart={onStart} />
      <HowToPlayScreen
        active={currentState === "howToPlay"}
        onContinue={onHowToContinue}
        onGoBack={onHowToGoBack}
      />
      <CharacterSelectScreen
        active={currentState === "characterSelect"}
        characters={characters}
        onCharacterSelected={onCharacterSelected}
        onGoBack={onGoBack}
      />
      <FinalScreen active={currentState === "final"} summary={gameSummary} onRestart={onRestart} />
      <LoadingScreen visible={startupLoading} text={UI_TEXT.START_LOADING_TEXT} />
      <AudioControls />
      <EmbedPrompt />
    </>
  );
}
