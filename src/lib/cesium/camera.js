import * as Cesium from "cesium";
import {
  FLIGHT_DURATION_SECONDS,
  DETAIL_FLIGHT_DURATION_SECONDS,
  MAX_FLIGHT_HEIGHT_METERS,
  TARGET_SCREEN_POSITION_FROM_BOTTOM,
} from "../../constants";
import { flightDuration } from "../motion";

function getCameraOffset(loc) {
  return new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-50), loc.height);
}

function applyTargetVerticalOffset(viewer, range) {
  const fovy = viewer.camera.frustum.fovy;
  const delta = (1 - 2 * TARGET_SCREEN_POSITION_FROM_BOTTOM) * Math.tan(fovy / 2) * range;
  viewer.camera.moveUp(delta);
}

export function flyToLocationCamera(
  viewer,
  loc,
  { duration = FLIGHT_DURATION_SECONDS, instant = false, onComplete, onCancel } = {}
) {
  const target = Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, 0);
  const boundingSphere = new Cesium.BoundingSphere(target, 1);
  const cameraOffset = getCameraOffset(loc);

  viewer.camera.cancelFlight();

  if (instant) {
    viewer.camera.viewBoundingSphere(boundingSphere, cameraOffset);
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    applyTargetVerticalOffset(viewer, loc.height);
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
      applyTargetVerticalOffset(viewer, loc.height);
      if (onComplete) onComplete();
    },
    cancel: () => {
      if (onCancel) onCancel();
    },
  });
}

export function flyToDetailView(viewer, loc, savedCamera, { onComplete, onCancel } = {}) {
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
      heading: savedCamera.heading,
      pitch: savedCamera.pitch,
      roll: savedCamera.roll,
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
}

export function restoreOverviewCamera(viewer, savedCamera, { onComplete, onCancel } = {}) {
  const overviewHeight = Cesium.Cartographic.fromCartesian(savedCamera.position).height;

  viewer.camera.cancelFlight();
  viewer.camera.flyTo({
    destination: savedCamera.position,
    orientation: {
      heading: savedCamera.heading,
      pitch: savedCamera.pitch,
      roll: savedCamera.roll,
    },
    duration: flightDuration(DETAIL_FLIGHT_DURATION_SECONDS),
    maximumHeight: overviewHeight,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    complete: () => {
      if (onComplete) onComplete();
    },
    cancel: () => {
      if (onCancel) onCancel();
    },
  });
}

export function saveOverviewCameraState(viewer) {
  const camera = viewer.camera;
  return {
    position: camera.position.clone(),
    heading: camera.heading,
    pitch: camera.pitch,
    roll: camera.roll,
  };
}
