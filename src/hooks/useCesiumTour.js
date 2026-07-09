import { useCallback, useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { FLIGHT_DURATION_SECONDS, DEBUG_COORDS } from "../constants";
import { playFlightWhoosh } from "../lib/audio";
import { flightDuration } from "../lib/motion";
import {
  flyToLocationCamera,
  flyToDetailView,
  restoreOverviewCamera,
  saveOverviewCameraState,
} from "../lib/cesium/camera";
import {
  createTourGraphicsHolder,
  destroyTourGraphics,
  syncTourGraphics,
} from "../lib/cesium/tourGraphics";

export function useCesiumTour({
  active,
  locations,
  currentIndex,
  visitedLocations,
  themeColor,
  locationUiRef,
}) {
  const viewerRef = useRef(null);
  const imageryProviderPromiseRef = useRef(null);
  const tourGraphicsHolderRef = useRef(null);
  const overviewCameraStateRef = useRef(null);
  const postRenderRemoverRef = useRef(null);
  const graphicsStateRef = useRef({ currentIndex, visitedLocations, themeColor, locations });

  const [isFlying, setIsFlying] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapLoadProgress, setMapLoadProgress] = useState(0);
  const [pinPanelOpen, setPinPanelOpen] = useState(false);
  const [locationUiStyle, setLocationUiStyle] = useState({
    display: "none",
    visibility: "hidden",
    left: "0px",
    top: "0px",
  });

  graphicsStateRef.current = { currentIndex, visitedLocations, themeColor, locations };

  const syncGraphics = useCallback((overrides = {}) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (!tourGraphicsHolderRef.current) {
      tourGraphicsHolderRef.current = createTourGraphicsHolder();
    }

    const state = graphicsStateRef.current;
    syncTourGraphics(viewer, tourGraphicsHolderRef.current, {
      locations: overrides.locations ?? state.locations,
      currentIndex: overrides.currentIndex ?? state.currentIndex,
      visitedLocations: overrides.visitedLocations ?? state.visitedLocations,
      themeColor: overrides.themeColor ?? state.themeColor,
    });
  }, []);

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

    if (!tourGraphicsHolderRef.current) {
      tourGraphicsHolderRef.current = createTourGraphicsHolder();
    }

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
    const pin = tourGraphicsHolderRef.current?.activePinEntity;
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
  }, [pinPanelOpen, locationUiRef]);

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

  useEffect(() => {
    if (!viewerRef.current || !active) return;
    syncGraphics();
  }, [active, locations, currentIndex, visitedLocations, themeColor, syncGraphics]);

  const whenMapReady = useCallback((onReady) => {
    const viewer = viewerRef.current;
    if (!viewer) {
      onReady();
      return;
    }

    const globe = viewer.scene.globe;
    let done = false;
    let removeListener = null;
    let maxQueued = 0;

    const updateProgress = (queued) => {
      maxQueued = Math.max(maxQueued, queued, 1);
      if (globe.tilesLoaded && queued === 0) {
        setMapLoadProgress(100);
        return;
      }

      const next = Math.round(((maxQueued - queued) / maxQueued) * 95);
      setMapLoadProgress(Math.max(5, next));
    };

    const finish = () => {
      if (done) return;
      done = true;
      if (removeListener) removeListener();
      window.clearTimeout(timer);
      setMapLoadProgress(100);
      onReady();
    };

    const timer = window.setTimeout(finish, 15000);
    setMapLoadProgress(5);

    Promise.resolve(imageryProviderPromiseRef.current)
      .catch(() => {})
      .then(() => {
        if (done) return;
        if (globe.tilesLoaded) {
          finish();
          return;
        }
        removeListener = globe.tileLoadProgressEvent.addEventListener((queued) => {
          updateProgress(queued);
          if (queued === 0 && globe.tilesLoaded) finish();
        });
      });
  }, []);

  const hidePinPanel = useCallback(() => {
    setPinPanelOpen(false);
    setLocationUiStyle({ display: "none", visibility: "hidden", left: "0px", top: "0px" });
  }, []);

  const showPinPanel = useCallback(
    (overrides = {}) => {
      if (Object.keys(overrides).length > 0) {
        syncGraphics(overrides);
      }

      if (!tourGraphicsHolderRef.current?.activePinEntity) return;

      setPinPanelOpen(true);
      setLocationUiStyle((prev) => ({ ...prev, display: "flex", visibility: "visible" }));
      requestAnimationFrame(() => {
        positionPinPanel();
      });
    },
    [positionPinPanel, syncGraphics]
  );

  const flyToLocation = useCallback(
    (index, { instant = false, onArrive } = {}) => {
      const loc = locations[index];
      if (!loc) return;

      const viewer = viewerRef.current;
      if (!viewer) return;

      if (instant) {
        flyToLocationCamera(viewer, loc, {
          instant: true,
          onComplete: () => {
            if (onArrive) onArrive(loc, index);
          },
        });
        return;
      }

      setIsFlying(true);
      hidePinPanel();

      if (flightDuration(FLIGHT_DURATION_SECONDS) > 0) {
        playFlightWhoosh();
      }

      flyToLocationCamera(viewer, loc, {
        onComplete: () => {
          setIsFlying(false);
          if (onArrive) onArrive(loc, index);
        },
        onCancel: () => {
          setIsFlying(false);
        },
      });
    },
    [locations, hidePinPanel]
  );

  const saveOverviewCamera = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    overviewCameraStateRef.current = saveOverviewCameraState(viewer);
  }, []);

  const getOverviewCamera = useCallback(() => overviewCameraStateRef.current, []);

  const clearOverviewCamera = useCallback(() => {
    overviewCameraStateRef.current = null;
  }, []);

  const flyToDetailViewCamera = useCallback(
    (loc, { onComplete, onCancel } = {}) => {
      const viewer = viewerRef.current;
      const saved = overviewCameraStateRef.current;
      if (!viewer || !saved) return;

      flyToDetailView(viewer, loc, saved, { onComplete, onCancel });
    },
    []
  );

  const restoreOverviewCameraView = useCallback(
    ({ onComplete, onCancel } = {}) => {
      const viewer = viewerRef.current;
      const saved = overviewCameraStateRef.current;
      if (!viewer || !saved) {
        if (onComplete) onComplete();
        return;
      }

      restoreOverviewCamera(viewer, saved, { onComplete, onCancel });
    },
    []
  );

  const resetTour = useCallback(() => {
    setIsFlying(false);
    setMapLoading(false);
    setMapLoadProgress(0);
    hidePinPanel();
    clearOverviewCamera();
  }, [hidePinPanel, clearOverviewCamera]);

  const cleanup = useCallback(() => {
    setMapLoading(false);
    setMapLoadProgress(0);
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.camera.cancelFlight();
      viewer.camera.flyHome();
      if (tourGraphicsHolderRef.current) {
        destroyTourGraphics(viewer, tourGraphicsHolderRef.current);
      }
    }
    clearOverviewCamera();
    hidePinPanel();
  }, [clearOverviewCamera, hidePinPanel]);

  return {
    isFlying,
    setIsFlying,
    mapLoading,
    setMapLoading,
    mapLoadProgress,
    pinPanelOpen,
    locationUiStyle,
    ensureViewer,
    whenMapReady,
    hidePinPanel,
    showPinPanel,
    flyToLocation,
    saveOverviewCamera,
    getOverviewCamera,
    clearOverviewCamera,
    flyToDetailViewCamera,
    restoreOverviewCameraView,
    syncGraphics,
    resetTour,
    cleanup,
  };
}
