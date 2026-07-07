import { useCallback, useEffect, useState } from "react";
import { getTutorialSteps } from "../lib/collectibles";

export function useGameplayTutorial({
  active,
  character,
  currentIndex,
  pinPanelOpen,
  detailsVisible,
  slideshowLocation,
  slideshowIndex,
}) {
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialSteps, setTutorialSteps] = useState([]);
  const [tutorialSpotlightSelector, setTutorialSpotlightSelector] = useState(null);

  const endTutorial = useCallback(() => {
    setTutorialActive(false);
    setTutorialStep(0);
    setTutorialSteps([]);
    setTutorialSpotlightSelector(null);
  }, []);

  const showTutorialStep = useCallback(
    (step, steps) => {
      const config = steps[step - 1];
      if (!config) {
        endTutorial();
        return;
      }
      setTutorialStep(step);
      setTutorialSpotlightSelector(config.target || null);
    },
    [endTutorial]
  );

  const startTutorial = useCallback(() => {
    const steps = getTutorialSteps(character);
    setTutorialSteps(steps);
    setTutorialActive(true);
    showTutorialStep(1, steps);
  }, [character, showTutorialStep]);

  const advanceTutorial = useCallback(() => {
    if (!tutorialActive) return;
    if (tutorialStep >= tutorialSteps.length) {
      endTutorial();
      return;
    }
    showTutorialStep(tutorialStep + 1, tutorialSteps);
  }, [tutorialActive, tutorialStep, tutorialSteps, endTutorial, showTutorialStep]);

  const skipTutorial = useCallback(() => {
    endTutorial();
  }, [endTutorial]);

  const notifyDetailsOpened = useCallback(() => {
    if (tutorialActive && tutorialStep === 2) {
      setTutorialStep(3);
    }
  }, [tutorialActive, tutorialStep]);

  const notifyItemCollected = useCallback(() => {
    if (tutorialActive && tutorialStep === 3) {
      endTutorial();
    }
  }, [tutorialActive, tutorialStep, endTutorial]);

  const notifyLeftFirstStop = useCallback(() => {
    if (tutorialActive && currentIndex === 0) {
      endTutorial();
    }
  }, [tutorialActive, currentIndex, endTutorial]);

  const resetTutorial = useCallback(() => {
    endTutorial();
  }, [endTutorial]);

  useEffect(() => {
    if (!active) return;

    if (tutorialActive && tutorialStep === 1 && currentIndex === 0 && pinPanelOpen) {
      advanceTutorial();
    }
  }, [active, tutorialActive, tutorialStep, currentIndex, pinPanelOpen, advanceTutorial]);

  useEffect(() => {
    if (!active) return;

    if (tutorialActive && tutorialStep === 2 && pinPanelOpen) {
      setTutorialSpotlightSelector(".pin-details-btn");
    }
  }, [active, tutorialActive, tutorialStep, pinPanelOpen]);

  useEffect(() => {
    if (!active || !detailsVisible) return;

    if (tutorialActive && tutorialStep === 3) {
      const images = slideshowLocation?.images || [];
      if (images.length === 0) {
        endTutorial();
      } else {
        setTutorialSpotlightSelector(".collectible-item");
      }
    }
  }, [
    active,
    detailsVisible,
    tutorialActive,
    tutorialStep,
    slideshowLocation,
    slideshowIndex,
    endTutorial,
  ]);

  const tutorialConfig = tutorialActive ? tutorialSteps[tutorialStep - 1] : null;

  return {
    tutorialActive,
    tutorialStep,
    tutorialConfig,
    tutorialSpotlightSelector,
    startTutorial,
    skipTutorial,
    endTutorial,
    resetTutorial,
    notifyDetailsOpened,
    notifyItemCollected,
    notifyLeftFirstStop,
  };
}
