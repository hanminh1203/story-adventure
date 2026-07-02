import { useCallback, useEffect, useRef, useState } from "react";
import {
  FLIGHT_DURATION_SECONDS,
  DETAIL_FLIGHT_DURATION_SECONDS,
  MAX_FLIGHT_HEIGHT_METERS,
  TARGET_SCREEN_POSITION_FROM_BOTTOM,
  DEBUG_COORDS,
} from "../constants";
import { UI_TEXT } from "../uiText";
import { formatTemplate } from "../lib/format";
import { flightDuration } from "../lib/motion";
import {
  generateBalancedPositions,
  formatCollectibleLabel,
  getCharacterCollectibleName,
  getCharacterCollectibleImage,
  getCharacterAvatarImage,
  getCollectibleSingular,
  countCollectiblesForTour,
  countCollectedCollectiblesForLocation,
  isLocationFullyCollected,
  areAllCollectiblesCollectedForSlide,
  makeCollectibleId,
  getTutorialSteps,
} from "../lib/collectibles";

/* global Cesium */

export function useGameplay({ character, active, onFinalize, onExit }) {
  const viewerRef = useRef(null);
  const imageryProviderPromiseRef = useRef(null);
  const pinRef = useRef(null);
  const overviewCameraStateRef = useRef(null);
  const collectiblePositionsRef = useRef(new Map());
  const achievementToastTimerRef = useRef(null);
  const locationUiRef = useRef(null);
  const pinPanelBodyRef = useRef(null);
  const detailsSlideshowRef = useRef(null);
  const postRenderRemoverRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlying, setIsFlying] = useState(false);
  const [score, setScore] = useState(0);
  const [collectedItems, setCollectedItems] = useState(() => new Set());
  const [clearedLocations, setClearedLocations] = useState(() => new Set());
  const [visitedLocations, setVisitedLocations] = useState(() => new Set());
  const [collectFeedback, setCollectFeedback] = useState(null);
  const [scorePulse, setScorePulse] = useState(false);
  const [pinPanelOpen, setPinPanelOpen] = useState(false);
  const [locationUiStyle, setLocationUiStyle] = useState({
    display: "none",
    visibility: "hidden",
    left: "0px",
    top: "0px",
  });
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);
  const [slideshowLocation, setSlideshowLocation] = useState(null);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isDetailViewActive, setIsDetailViewActive] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [achievementToast, setAchievementToast] = useState({ visible: false, message: "" });
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialSteps, setTutorialSteps] = useState([]);
  const [tutorialSpotlightSelector, setTutorialSpotlightSelector] = useState(null);
  const [removingCollectibleIds, setRemovingCollectibleIds] = useState(() => new Set());

  const locations = character?.locations || [];
  const isFinalLocation = currentIndex === locations.length - 1;
  const isFirstLocation = currentIndex === 0;

  const ensureViewer = useCallback(() => {
    if (viewerRef.current) return viewerRef.current;

    const imageryProviderPromise = Cesium.ArcGisMapServerImageryProvider.fromUrl(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    );
    imageryProviderPromiseRef.current = imageryProviderPromise;

    const viewer = new Cesium.Viewer("cesiumContainer", {
      baseLayer: Cesium.ImageryLayer.fromProviderAsync(imageryProviderPromise),
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
    });

    viewer.scene.globe.enableLighting = true;
    viewerRef.current = viewer;

    if (DEBUG_COORDS) {
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click) => {
        const cartesian = viewer.scene.pickPosition(click.position);
        if (Cesium.defined(cartesian)) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);
          console.log(
            `Clicked Coordinates: Longitude: ${longitude.toFixed(4)}, Latitude: ${latitude.toFixed(4)}`
          );
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    return viewer;
  }, []);

  const positionPinPanel = useCallback(() => {
    const viewer = viewerRef.current;
    const pin = pinRef.current;
    if (!pinPanelOpen || !pin || !viewer || !locationUiRef.current) return;

    const position = pin.position.getValue(viewer.clock.currentTime);
    const canvasPosition = Cesium.SceneTransforms.worldToWindowCoordinates(
      viewer.scene,
      position
    );

    if (!canvasPosition) {
      setLocationUiStyle((prev) => ({ ...prev, visibility: "hidden" }));
      return;
    }

    const canvasRect = viewer.scene.canvas.getBoundingClientRect();
    const uiRect = locationUiRef.current.offsetParent
      ? locationUiRef.current.offsetParent.getBoundingClientRect()
      : { left: 0, top: 0 };
    const x = canvasPosition.x + canvasRect.left - uiRect.left;
    const y = canvasPosition.y + canvasRect.top - uiRect.top;
    const width = locationUiRef.current.offsetWidth;

    setLocationUiStyle({
      display: "flex",
      visibility: "visible",
      left: `${x - width / 2}px`,
      top: `${y - locationUiRef.current.offsetHeight - 20}px`,
    });
  }, [pinPanelOpen]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !active || !pinPanelOpen) return;

    const removeListener = viewer.scene.postRender.addEventListener(positionPinPanel);
    postRenderRemoverRef.current = removeListener;
    requestAnimationFrame(positionPinPanel);

    return () => {
      if (postRenderRemoverRef.current) {
        postRenderRemoverRef.current();
        postRenderRemoverRef.current = null;
      }
    };
  }, [active, pinPanelOpen, positionPinPanel, currentIndex]);

  const whenMapReady = useCallback((onReady) => {
    const viewer = viewerRef.current;
    if (!viewer) {
      onReady();
      return;
    }

    const globe = viewer.scene.globe;
    let done = false;
    let removeListener = null;

    const finish = () => {
      if (done) return;
      done = true;
      if (removeListener) removeListener();
      window.clearTimeout(timer);
      onReady();
    };

    const timer = window.setTimeout(finish, 15000);

    Promise.resolve(imageryProviderPromiseRef.current)
      .catch(() => {})
      .then(() => {
        if (done) return;
        if (globe.tilesLoaded) {
          finish();
          return;
        }
        removeListener = globe.tileLoadProgressEvent.addEventListener((queued) => {
          if (queued === 0 && globe.tilesLoaded) finish();
        });
      });
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

  const hidePinPanel = useCallback(() => {
    setPinPanelOpen(false);
    setLocationUiStyle({ display: "none", visibility: "hidden", left: "0px", top: "0px" });
  }, []);

  const setPin = useCallback((loc, index) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (pinRef.current) {
      viewer.entities.remove(pinRef.current);
    }

    pinRef.current = viewer.entities.add({
      name: loc.name,
      index,
      position: Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, 0),
    });
  }, []);

  const getCameraOffset = useCallback((loc) => {
    return new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-50), loc.height);
  }, []);

  const applyTargetVerticalOffset = useCallback((range) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const fovy = viewer.camera.frustum.fovy;
    const delta = (1 - 2 * TARGET_SCREEN_POSITION_FROM_BOTTOM) * Math.tan(fovy / 2) * range;
    viewer.camera.moveUp(delta);
  }, []);

  const flyToLocationCamera = useCallback(
    (loc, { duration = FLIGHT_DURATION_SECONDS, instant = false, onComplete, onCancel } = {}) => {
      const viewer = viewerRef.current;
      if (!viewer) return;

      const target = Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, 0);
      const boundingSphere = new Cesium.BoundingSphere(target, 1);
      const cameraOffset = getCameraOffset(loc);

      viewer.camera.cancelFlight();

      if (instant) {
        viewer.camera.viewBoundingSphere(boundingSphere, cameraOffset);
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        applyTargetVerticalOffset(loc.height);
        if (onComplete) onComplete();
        return;
      }

      viewer.camera.flyToBoundingSphere(boundingSphere, {
        duration: flightDuration(duration),
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
        offset: cameraOffset,
        maximumHeight: MAX_FLIGHT_HEIGHT_METERS,
        pitchAdjustHeight: 10,
        complete: () => {
          applyTargetVerticalOffset(loc.height);
          if (onComplete) onComplete();
        },
        cancel: () => {
          if (onCancel) onCancel();
        },
      });
    },
    [applyTargetVerticalOffset, getCameraOffset]
  );

  const showPinPanel = useCallback(() => {
    if (!pinRef.current) return;
    setPinPanelOpen(true);
    setLocationUiStyle((prev) => ({ ...prev, display: "flex", visibility: "visible" }));
    requestAnimationFrame(() => {
      positionPinPanel();
    });
  }, [positionPinPanel]);

  const finishLocationArrival = useCallback(
    (loc, index) => {
      setCurrentIndex(index);
      if (loc) {
        setVisitedLocations((prev) => new Set(prev).add(loc.name));
      }
      showPinPanel();
    },
    [showPinPanel]
  );

  const clearOverviewCamera = useCallback(() => {
    overviewCameraStateRef.current = null;
    setIsDetailViewActive(false);
  }, []);

  const flyToLocation = useCallback(
    (index, { instant = false } = {}) => {
      const loc = locations[index];
      if (!loc) return;

      if (isDetailViewActive || detailsVisible) {
        setDetailsVisible(false);
        setSlideshowLocation(null);
        setSlideshowIndex(0);
        clearOverviewCamera();
      }

      setPin(loc, index);

      if (instant) {
        flyToLocationCamera(loc, {
          instant: true,
          onComplete: () => finishLocationArrival(loc, index),
        });
        return;
      }

      setIsFlying(true);
      hidePinPanel();

      flyToLocationCamera(loc, {
        onComplete: () => {
          setIsFlying(false);
          finishLocationArrival(loc, index);
        },
        onCancel: () => {
          setIsFlying(false);
        },
      });
    },
    [
      locations,
      isDetailViewActive,
      detailsVisible,
      clearOverviewCamera,
      setPin,
      flyToLocationCamera,
      hidePinPanel,
      finishLocationArrival,
    ]
  );

  const saveOverviewCamera = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const camera = viewer.camera;
    overviewCameraStateRef.current = {
      position: camera.position.clone(),
      heading: camera.heading,
      pitch: camera.pitch,
      roll: camera.roll,
    };
  }, []);

  const finishDetailFlyBack = useCallback(() => {
    clearOverviewCamera();
    setIsFlying(false);
    showPinPanel();
  }, [clearOverviewCamera, showPinPanel]);

  const flyToDetailView = useCallback(
    (loc, { onComplete, onCancel } = {}) => {
      const viewer = viewerRef.current;
      const saved = overviewCameraStateRef.current;
      if (!viewer || !saved) return;

      const camera = viewer.camera;
      const target = Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, 0);
      const currentDistance = Cesium.Cartesian3.distance(camera.position, target);
      const detailRange = 10;
      const clampedRange = Math.min(detailRange, currentDistance * 0.95);

      const direction = Cesium.Cartesian3.subtract(
        camera.position,
        target,
        new Cesium.Cartesian3()
      );
      Cesium.Cartesian3.normalize(direction, direction);
      const endPosition = Cesium.Cartesian3.add(
        target,
        Cesium.Cartesian3.multiplyByScalar(direction, clampedRange, new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      );

      camera.cancelFlight();
      camera.flyTo({
        destination: endPosition,
        orientation: {
          heading: saved.heading,
          pitch: saved.pitch,
          roll: saved.roll,
        },
        duration: flightDuration(DETAIL_FLIGHT_DURATION_SECONDS),
        maximumHeight: camera.positionCartographic.height,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
        complete: () => {
          if (onComplete) onComplete();
        },
        cancel: () => {
          if (onCancel) onCancel();
        },
      });
    },
    []
  );

  const openDetailsModal = useCallback((loc) => {
    setSlideshowLocation(loc);
    setSlideshowIndex(0);
    setDetailsVisible(true);
    setIsDetailViewActive(true);
  }, []);

  const showDetailsPopup = useCallback(
    (loc) => {
      if (isFlying || isDetailViewActive || detailsVisible) return;

      if (tutorialActive && tutorialStep === 2) {
        setTutorialStep(3);
      }

      saveOverviewCamera();
      hidePinPanel();
      setIsFlying(true);

      flyToDetailView(loc, {
        onComplete: () => {
          setIsFlying(false);
          openDetailsModal(loc);
        },
        onCancel: () => {
          setIsFlying(false);
          if (!isDetailViewActive && !overviewCameraStateRef.current) {
            showPinPanel();
          }
        },
      });
    },
    [
      isFlying,
      isDetailViewActive,
      detailsVisible,
      tutorialActive,
      tutorialStep,
      saveOverviewCamera,
      hidePinPanel,
      flyToDetailView,
      openDetailsModal,
      showPinPanel,
    ]
  );

  const hideDetailsPopup = useCallback(
    ({ restoreCamera = true } = {}) => {
      setDetailsVisible(false);
      setSlideshowLocation(null);
      setSlideshowIndex(0);

      const viewer = viewerRef.current;
      if (!viewer) {
        clearOverviewCamera();
        return;
      }

      viewer.camera.cancelFlight();

      if (!restoreCamera || !overviewCameraStateRef.current) {
        clearOverviewCamera();
        return;
      }

      const saved = overviewCameraStateRef.current;
      setIsFlying(true);
      hidePinPanel();

      const overviewHeight = Cesium.Cartographic.fromCartesian(saved.position).height;

      viewer.camera.flyTo({
        destination: saved.position,
        orientation: {
          heading: saved.heading,
          pitch: saved.pitch,
          roll: saved.roll,
        },
        duration: flightDuration(DETAIL_FLIGHT_DURATION_SECONDS),
        maximumHeight: overviewHeight,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
        complete: () => finishDetailFlyBack(),
        cancel: () => finishDetailFlyBack(),
      });
    },
    [clearOverviewCamera, hidePinPanel, finishDetailFlyBack]
  );

  const buildFinalizeSummary = useCallback(
    () => ({
      score,
      maxScore: countCollectiblesForTour(locations),
      character,
      collectibleName: getCharacterCollectibleName(character),
    }),
    [score, locations, character]
  );

  const goNext = useCallback(() => {
    if (!active || isFlying) return;
    if (currentIndex === locations.length - 1) {
      onFinalize(buildFinalizeSummary());
      return;
    }

    if (currentIndex === 0 && tutorialActive) {
      endTutorial();
    }

    flyToLocation(currentIndex + 1);
  }, [
    active,
    isFlying,
    currentIndex,
    locations.length,
    onFinalize,
    buildFinalizeSummary,
    tutorialActive,
    endTutorial,
    flyToLocation,
  ]);

  const goPrev = useCallback(() => {
    if (!active || isFlying || currentIndex === 0) return;
    flyToLocation(currentIndex - 1);
  }, [active, isFlying, currentIndex, flyToLocation]);

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

      setCollectedItems((prev) => new Set(prev).add(itemId));
      setScore((prev) => {
        const newScore = prev + 1;
        const messages = UI_TEXT.COLLECT_MESSAGES;
        setCollectFeedback({
          message: messages[(newScore - 1) % messages.length],
          left: position.x,
          top: position.y,
        });
        window.setTimeout(() => setCollectFeedback(null), 600);
        return newScore;
      });
      setScorePulse(true);
      window.setTimeout(() => setScorePulse(false), 400);
      setRemovingCollectibleIds((prev) => new Set(prev).add(itemId));
      window.setTimeout(() => {
        setRemovingCollectibleIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }, 220);

      if (slideshowLocation) {
        checkLocationCompletion(slideshowLocation);
      }

      if (tutorialActive && tutorialStep === 3) {
        endTutorial();
      }
    },
    [
      collectedItems,
      slideshowLocation,
      checkLocationCompletion,
      tutorialActive,
      tutorialStep,
      endTutorial,
    ]
  );

  const showExitConfirm = useCallback(() => {
    hideDetailsPopup({ restoreCamera: false });
    setExitConfirmVisible(true);
  }, [hideDetailsPopup]);

  const hideExitConfirm = useCallback(() => {
    setExitConfirmVisible(false);
  }, []);

  const confirmExit = useCallback(() => {
    hideExitConfirm();
    onExit();
  }, [hideExitConfirm, onExit]);

  const resetGameplay = useCallback(() => {
    setCurrentIndex(0);
    setIsFlying(false);
    setScore(0);
    setCollectedItems(new Set());
    setClearedLocations(new Set());
    setVisitedLocations(new Set());
    collectiblePositionsRef.current = new Map();
    hideAchievementToast();
    setExitConfirmVisible(false);
    setDetailsVisible(false);
    setSlideshowLocation(null);
    setSlideshowIndex(0);
    clearOverviewCamera();
    hidePinPanel();
    endTutorial();
  }, [hideAchievementToast, clearOverviewCamera, hidePinPanel, endTutorial]);

  const start = useCallback(() => {
    resetGameplay();
    ensureViewer();
    startTutorial();
    setMapLoading(true);
    whenMapReady(() => {
      setMapLoading(false);
      flyToLocation(0);
    });
  }, [resetGameplay, ensureViewer, startTutorial, whenMapReady, flyToLocation]);

  const cleanup = useCallback(() => {
    setMapLoading(false);
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.camera.cancelFlight();
      viewer.camera.flyHome();
    }
    clearOverviewCamera();
    hideExitConfirm();
    hideDetailsPopup({ restoreCamera: false });
    hidePinPanel();
    hideAchievementToast();
    endTutorial();
  }, [
    clearOverviewCamera,
    hideExitConfirm,
    hideDetailsPopup,
    hidePinPanel,
    hideAchievementToast,
    endTutorial,
  ]);

  useEffect(() => {
    if (!active) return;
    start();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, character?.id]);

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

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e) => {
      if (exitConfirmVisible && e.key === "Escape") {
        hideExitConfirm();
        return;
      }
      if (exitConfirmVisible) return;

      if (detailsVisible && e.key === "ArrowRight") {
        const images = slideshowLocation ? slideshowLocation.images || [] : [];
        if (images.length > 0 && slideshowIndex === images.length - 1) {
          hideDetailsPopup({ restoreCamera: false });
          goNext();
        } else {
          changeSlide(1);
        }
        return;
      }

      if (detailsVisible && e.key === "ArrowLeft") {
        changeSlide(-1);
        return;
      }

      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") hideDetailsPopup();
      if (e.key === " " && pinPanelOpen && locations[currentIndex]) {
        e.preventDefault();
        showDetailsPopup(locations[currentIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    active,
    exitConfirmVisible,
    detailsVisible,
    slideshowLocation,
    slideshowIndex,
    pinPanelOpen,
    locations,
    currentIndex,
    hideExitConfirm,
    hideDetailsPopup,
    goNext,
    goPrev,
    changeSlide,
    showDetailsPopup,
  ]);

  const currentLoc = locations[currentIndex];
  const slideAllCollected =
    slideshowLocation &&
    areAllCollectiblesCollectedForSlide(slideshowLocation, slideshowIndex, collectedItems);

  const tutorialConfig = tutorialActive ? tutorialSteps[tutorialStep - 1] : null;

  return {
    character,
    locations,
    currentIndex,
    currentLoc,
    isFlying,
    score,
    collectedItems,
    visitedLocations,
    scorePulse,
    collectFeedback,
    pinPanelOpen,
    locationUiRef,
    pinPanelBodyRef,
    detailsSlideshowRef,
    locationUiStyle,
    detailsVisible,
    exitConfirmVisible,
    slideshowLocation,
    slideshowIndex,
    mapLoading,
    achievementToast,
    tutorialActive,
    tutorialConfig,
    tutorialStep,
    tutorialSpotlightSelector,
    removingCollectibleIds,
    isFirstLocation,
    isFinalLocation,
    scoreLabel: formatCollectibleLabel(character?.collectibleName),
    avatarSrc: getCharacterAvatarImage(character),
    collectibleImage: getCharacterCollectibleImage(character),
    guideAccent: character?.themeColor,
    goNext,
    goPrev,
    changeSlide,
    setSlideshowIndex,
    showDetailsPopup,
    hideDetailsPopup,
    showExitConfirm,
    hideExitConfirm,
    confirmExit,
    skipTutorial,
    collectItem,
    getCollectiblesForSlide,
    getCollectibleSingular: () => getCollectibleSingular(getCharacterCollectibleName(character)),
    countCollectedForLocation: (loc) =>
      countCollectedCollectiblesForLocation(loc, collectedItems),
    isLocationFullyCollected: (loc) => isLocationFullyCollected(loc, collectedItems),
    slideAllCollected,
    makeCollectibleId,
  };
}
