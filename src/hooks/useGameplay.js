import { useCallback, useEffect, useRef, useState } from "react";
import { playApplause } from "../lib/audio";
import { getYouTubeVideoId } from "../lib/media";
import {
  formatCollectibleLabel,
  getCharacterCollectibleName,
  getCharacterCollectibleImage,
  getCharacterAvatarImage,
  getCollectibleSingular,
  countCollectiblesForTour,
  countCollectedCollectiblesForLocation,
  isLocationFullyCollected,
  makeCollectibleId,
} from "../lib/collectibles";
import { useCesiumTour } from "./useCesiumTour";
import { useGameplayTutorial } from "./useGameplayTutorial";
import { useSlideshow } from "./useSlideshow";

export function useGameplay({ character, active, onFinalize, onExit }) {
  const locationUiRef = useRef(null);
  const tutorialRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visitedLocations, setVisitedLocations] = useState(() => new Set());
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);
  const [introActive, setIntroActive] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapReadyRef = useRef(false);

  const locations = character?.locations || [];
  const isFinalLocation = currentIndex === locations.length - 1;
  const isFirstLocation = currentIndex === 0;

  const cesium = useCesiumTour({
    active,
    locations,
    currentIndex,
    visitedLocations,
    themeColor: character?.themeColor,
    locationUiRef,
  });

  const slideshow = useSlideshow({
    character,
    cesium,
    getTutorial: () => tutorialRef.current,
  });

  const tutorial = useGameplayTutorial({
    active,
    character,
    currentIndex,
    pinPanelOpen: cesium.pinPanelOpen,
    detailsVisible: slideshow.detailsVisible,
    slideshowLocation: slideshow.slideshowLocation,
    slideshowIndex: slideshow.slideshowIndex,
  });

  tutorialRef.current = tutorial;

  const handleArrival = useCallback(
    (loc, index) => {
      const nextVisited = loc ? new Set(visitedLocations).add(loc.name) : visitedLocations;

      setCurrentIndex(index);
      if (loc) {
        setVisitedLocations((prev) => new Set(prev).add(loc.name));
      }

      cesium.showPinPanel({
        currentIndex: index,
        visitedLocations: nextVisited,
      });
    },
    [visitedLocations, cesium]
  );

  const flyToLocation = useCallback(
    (index, { instant = false } = {}) => {
      slideshow.closeIfOpen();
      cesium.flyToLocation(index, { instant, onArrive: handleArrival });
    },
    [slideshow, cesium, handleArrival]
  );

  const buildFinalizeSummary = useCallback(
    () => ({
      score: slideshow.score,
      maxScore: countCollectiblesForTour(locations),
      character,
      collectibleName: getCharacterCollectibleName(character),
    }),
    [slideshow.score, locations, character]
  );

  const goNext = useCallback(() => {
    if (!active || cesium.isFlying) return;

    if (currentIndex === locations.length - 1) {
      playApplause();
      onFinalize(buildFinalizeSummary());
      return;
    }

    tutorial.notifyLeftFirstStop();
    flyToLocation(currentIndex + 1);
  }, [
    active,
    cesium.isFlying,
    currentIndex,
    locations.length,
    onFinalize,
    buildFinalizeSummary,
    tutorial,
    flyToLocation,
  ]);

  const goPrev = useCallback(() => {
    if (!active || cesium.isFlying || currentIndex === 0) return;
    flyToLocation(currentIndex - 1);
  }, [active, cesium.isFlying, currentIndex, flyToLocation]);

  const showExitConfirm = useCallback(() => {
    slideshow.hideDetailsPopup({ restoreCamera: false });
    setExitConfirmVisible(true);
  }, [slideshow]);

  const hideExitConfirm = useCallback(() => {
    setExitConfirmVisible(false);
  }, []);

  const confirmExit = useCallback(() => {
    hideExitConfirm();
    onExit();
  }, [hideExitConfirm, onExit]);

  const resetGameplay = useCallback(() => {
    setCurrentIndex(0);
    setVisitedLocations(new Set());
    setExitConfirmVisible(false);
    setIntroActive(false);
    setMapReady(false);
    mapReadyRef.current = false;
    slideshow.resetSlideshow();
    cesium.resetTour();
    tutorial.resetTutorial();
  }, [slideshow, cesium, tutorial]);

  const dismissIntro = useCallback(() => {
    if (!mapReadyRef.current) return;

    setIntroActive(false);
    flyToLocation(0);
  }, [flyToLocation]);

  const handleIntroEnded = useCallback(() => {
    if (mapReadyRef.current) {
      dismissIntro();
    }
  }, [dismissIntro]);

  const start = useCallback(() => {
    resetGameplay();
    cesium.ensureViewer();
    tutorial.startTutorial();
    setIntroActive(true);
    setMapReady(false);
    mapReadyRef.current = false;
    cesium.whenMapReady(() => {
      mapReadyRef.current = true;
      setMapReady(true);
    });
  }, [resetGameplay, cesium, tutorial]);

  const cleanup = useCallback(() => {
    setIntroActive(false);
    setMapReady(false);
    mapReadyRef.current = false;
    cesium.cleanup();
    hideExitConfirm();
    slideshow.hideDetailsPopup({ restoreCamera: false });
    slideshow.hideAchievementToast();
    tutorial.endTutorial();
  }, [cesium, hideExitConfirm, slideshow, tutorial]);

  useEffect(() => {
    if (!active) return;
    start();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, character?.id]);

  useEffect(() => {
    if (!introActive || !mapReady) return;
    if (!getYouTubeVideoId(character)) {
      dismissIntro();
    }
  }, [introActive, mapReady, character, dismissIntro]);

  const currentLoc = locations[currentIndex];

  return {
    character,
    locations,
    currentIndex,
    currentLoc,
    isFlying: cesium.isFlying,
    score: slideshow.score,
    collectedItems: slideshow.collectedItems,
    visitedLocations,
    scorePulse: slideshow.scorePulse,
    collectFeedback: slideshow.collectFeedback,
    pinPanelOpen: cesium.pinPanelOpen,
    locationUiRef,
    locationUiStyle: cesium.locationUiStyle,
    detailsVisible: slideshow.detailsVisible,
    exitConfirmVisible,
    slideshowLocation: slideshow.slideshowLocation,
    slideshowIndex: slideshow.slideshowIndex,
    mapLoading: introActive,
    mapReady,
    mapReadyRef,
    dismissIntro,
    handleIntroEnded,
    achievementToast: slideshow.achievementToast,
    tutorialActive: tutorial.tutorialActive,
    tutorialConfig: tutorial.tutorialConfig,
    tutorialStep: tutorial.tutorialStep,
    tutorialSpotlightSelector: tutorial.tutorialSpotlightSelector,
    removingCollectibleIds: slideshow.removingCollectibleIds,
    isFirstLocation,
    isFinalLocation,
    scoreLabel: formatCollectibleLabel(character?.collectibleName),
    avatarSrc: getCharacterAvatarImage(character),
    collectibleImage: getCharacterCollectibleImage(character),
    guideAccent: character?.themeColor,
    goNext,
    goPrev,
    changeSlide: slideshow.changeSlide,
    setSlideshowIndex: slideshow.setSlideshowIndex,
    showDetailsPopup: slideshow.showDetailsPopup,
    hideDetailsPopup: slideshow.hideDetailsPopup,
    showExitConfirm,
    hideExitConfirm,
    confirmExit,
    skipTutorial: tutorial.skipTutorial,
    collectItem: slideshow.collectItem,
    getCollectiblesForSlide: slideshow.getCollectiblesForSlide,
    getCollectibleSingular: () => getCollectibleSingular(getCharacterCollectibleName(character)),
    countCollectedForLocation: (loc) =>
      countCollectedCollectiblesForLocation(loc, slideshow.collectedItems),
    isLocationFullyCollected: (loc) =>
      isLocationFullyCollected(loc, slideshow.collectedItems),
    slideAllCollected: slideshow.slideAllCollected,
    makeCollectibleId,
  };
}
