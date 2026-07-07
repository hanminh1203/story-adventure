import { useCallback, useEffect, useRef, useState } from "react";
import { UI_TEXT } from "../uiText";
import { formatTemplate } from "../lib/format";
import { playCollectPickup } from "../lib/audio";
import {
  generateBalancedPositions,
  getCharacterCollectibleName,
  isLocationFullyCollected,
  areAllCollectiblesCollectedForSlide,
} from "../lib/collectibles";

export function useSlideshow({ character, cesium, getTutorial }) {
  const collectiblePositionsRef = useRef(new Map());
  const achievementToastTimerRef = useRef(null);
  const collectFeedbackTimerRef = useRef(null);
  const scorePulseTimerRef = useRef(null);
  const removalTimerRefs = useRef(new Map());

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [slideshowLocation, setSlideshowLocation] = useState(null);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isDetailViewActive, setIsDetailViewActive] = useState(false);
  const [collectedItems, setCollectedItems] = useState(() => new Set());
  const [clearedLocations, setClearedLocations] = useState(() => new Set());
  const [score, setScore] = useState(0);
  const [scorePulse, setScorePulse] = useState(false);
  const [collectFeedback, setCollectFeedback] = useState(null);
  const [removingCollectibleIds, setRemovingCollectibleIds] = useState(() => new Set());
  const [achievementToast, setAchievementToast] = useState({ visible: false, message: "" });

  const clearTransientTimers = useCallback(() => {
    if (collectFeedbackTimerRef.current) {
      window.clearTimeout(collectFeedbackTimerRef.current);
      collectFeedbackTimerRef.current = null;
    }

    if (scorePulseTimerRef.current) {
      window.clearTimeout(scorePulseTimerRef.current);
      scorePulseTimerRef.current = null;
    }

    removalTimerRefs.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    removalTimerRefs.current.clear();
  }, []);

  const hideAchievementToast = useCallback(() => {
    if (achievementToastTimerRef.current) {
      window.clearTimeout(achievementToastTimerRef.current);
      achievementToastTimerRef.current = null;
    }
    setAchievementToast({ visible: false, message: "" });
  }, []);

  const showAchievementToast = useCallback(
    (message) => {
      setAchievementToast({ visible: true, message });
      if (achievementToastTimerRef.current) {
        window.clearTimeout(achievementToastTimerRef.current);
      }
      achievementToastTimerRef.current = window.setTimeout(() => {
        hideAchievementToast();
      }, 3000);
    },
    [hideAchievementToast]
  );

  const openDetailsModal = useCallback((loc) => {
    setSlideshowLocation(loc);
    setSlideshowIndex(0);
    setDetailsVisible(true);
    setIsDetailViewActive(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setDetailsVisible(false);
    setSlideshowLocation(null);
    setSlideshowIndex(0);
    setIsDetailViewActive(false);
  }, []);

  const showDetailsPopup = useCallback(
    (loc) => {
      if (cesium.isFlying || isDetailViewActive || detailsVisible) return;

      getTutorial()?.notifyDetailsOpened?.();
      cesium.saveOverviewCamera();
      cesium.hidePinPanel();
      cesium.setIsFlying(true);

      cesium.flyToDetailViewCamera(loc, {
        onComplete: () => {
          cesium.setIsFlying(false);
          openDetailsModal(loc);
        },
        onCancel: () => {
          cesium.setIsFlying(false);
          if (!isDetailViewActive && !cesium.getOverviewCamera()) {
            cesium.showPinPanel();
          }
        },
      });
    },
    [cesium, isDetailViewActive, detailsVisible, getTutorial, openDetailsModal]
  );

  const hideDetailsPopup = useCallback(
    ({ restoreCamera = true } = {}) => {
      closeDetailsModal();

      const saved = cesium.getOverviewCamera();
      if (!restoreCamera || !saved) {
        cesium.clearOverviewCamera();
        return;
      }

      cesium.setIsFlying(true);
      cesium.hidePinPanel();

      cesium.restoreOverviewCameraView({
        onComplete: () => {
          cesium.clearOverviewCamera();
          cesium.setIsFlying(false);
          cesium.showPinPanel();
        },
        onCancel: () => {
          cesium.clearOverviewCamera();
          cesium.setIsFlying(false);
          cesium.showPinPanel();
        },
      });
    },
    [cesium, closeDetailsModal]
  );

  const closeIfOpen = useCallback(() => {
    if (!detailsVisible && !isDetailViewActive) return;
    closeDetailsModal();
    cesium.clearOverviewCamera();
  }, [detailsVisible, isDetailViewActive, closeDetailsModal, cesium]);

  const changeSlide = useCallback(
    (delta) => {
      if (!slideshowLocation) return;
      const images = slideshowLocation.images || [];
      if (images.length === 0) return;
      setSlideshowIndex((prev) => (prev + delta + images.length) % images.length);
    },
    [slideshowLocation]
  );

  const getCollectiblesForSlide = useCallback((loc, slideIndex) => {
    const key = `${loc.name}:${slideIndex}`;
    if (!collectiblePositionsRef.current.has(key)) {
      collectiblePositionsRef.current.set(key, generateBalancedPositions());
    }
    return collectiblePositionsRef.current.get(key);
  }, []);

  const checkLocationCompletion = useCallback(
    (loc) => {
      if (!loc || !isLocationFullyCollected(loc, collectedItems)) return;
      if (clearedLocations.has(loc.name)) return;

      setClearedLocations((prev) => new Set(prev).add(loc.name));
      const itemsName = getCharacterCollectibleName(character);
      showAchievementToast(
        formatTemplate(UI_TEXT.ACHIEVEMENT_ALL_ITEMS_AT_LOCATION, {
          itemsName,
          locationName: loc.name,
        })
      );
    },
    [collectedItems, clearedLocations, character, showAchievementToast]
  );

  const collectItem = useCallback(
    (itemId, position) => {
      if (collectedItems.has(itemId)) return;

      playCollectPickup();
      setCollectedItems((prev) => new Set(prev).add(itemId));
      setScore((prev) => {
        const newScore = prev + 1;
        const messages = UI_TEXT.COLLECT_MESSAGES;
        setCollectFeedback({
          message: messages[(newScore - 1) % messages.length],
          left: position.x,
          top: position.y,
        });
        if (collectFeedbackTimerRef.current) {
          window.clearTimeout(collectFeedbackTimerRef.current);
        }
        collectFeedbackTimerRef.current = window.setTimeout(() => {
          collectFeedbackTimerRef.current = null;
          setCollectFeedback(null);
        }, 600);
        return newScore;
      });
      setScorePulse(true);
      if (scorePulseTimerRef.current) {
        window.clearTimeout(scorePulseTimerRef.current);
      }
      scorePulseTimerRef.current = window.setTimeout(() => {
        scorePulseTimerRef.current = null;
        setScorePulse(false);
      }, 400);
      setRemovingCollectibleIds((prev) => new Set(prev).add(itemId));
      const existingRemovalTimer = removalTimerRefs.current.get(itemId);
      if (existingRemovalTimer) {
        window.clearTimeout(existingRemovalTimer);
      }
      const removalTimerId = window.setTimeout(() => {
        removalTimerRefs.current.delete(itemId);
        setRemovingCollectibleIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }, 220);
      removalTimerRefs.current.set(itemId, removalTimerId);

      if (slideshowLocation) {
        checkLocationCompletion(slideshowLocation);
      }

      getTutorial()?.notifyItemCollected?.();
    },
    [collectedItems, slideshowLocation, checkLocationCompletion, getTutorial]
  );

  const resetSlideshow = useCallback(() => {
    clearTransientTimers();
    setScore(0);
    setCollectedItems(new Set());
    setClearedLocations(new Set());
    setScorePulse(false);
    setCollectFeedback(null);
    setRemovingCollectibleIds(new Set());
    collectiblePositionsRef.current = new Map();
    hideAchievementToast();
    closeDetailsModal();
    cesium.clearOverviewCamera();
  }, [clearTransientTimers, hideAchievementToast, closeDetailsModal, cesium]);

  useEffect(() => clearTransientTimers, [clearTransientTimers]);

  const slideAllCollected =
    slideshowLocation &&
    areAllCollectiblesCollectedForSlide(slideshowLocation, slideshowIndex, collectedItems);

  return {
    detailsVisible,
    slideshowLocation,
    slideshowIndex,
    collectedItems,
    score,
    scorePulse,
    collectFeedback,
    removingCollectibleIds,
    achievementToast,
    slideAllCollected,
    showDetailsPopup,
    hideDetailsPopup,
    closeIfOpen,
    changeSlide,
    setSlideshowIndex,
    collectItem,
    getCollectiblesForSlide,
    resetSlideshow,
    hideAchievementToast,
  };
}
