import * as Cesium from "cesium";
import {
  TOUR_PATH_WIDTH,
  TOUR_PATH_UPCOMING_ALPHA,
  TOUR_PATH_VISITED_ALPHA,
  TOUR_PIN_SIZE_UPCOMING,
  TOUR_PIN_SIZE_VISITED,
  TOUR_PIN_SIZE_CURRENT,
  TOUR_DEFAULT_ACCENT,
} from "../../constants";

export function createTourGraphicsHolder() {
  return {
    pinEntities: [],
    segmentEntities: [],
    activePinEntity: null,
  };
}

export function destroyTourGraphics(viewer, holder) {
  if (!viewer || !holder) return;

  for (const entity of holder.pinEntities) {
    viewer.entities.remove(entity);
  }
  for (const entity of holder.segmentEntities) {
    viewer.entities.remove(entity);
  }

  holder.pinEntities = [];
  holder.segmentEntities = [];
  holder.activePinEntity = null;
}

function resolveAccentColor(themeColor) {
  try {
    return Cesium.Color.fromCssColorString(themeColor || TOUR_DEFAULT_ACCENT);
  } catch {
    return Cesium.Color.fromCssColorString(TOUR_DEFAULT_ACCENT);
  }
}

function isStopVisited(loc, index, currentIndex, visitedLocations) {
  if (index < currentIndex) return true;
  return visitedLocations.has(loc.name);
}

function getPinStyle(index, loc, currentIndex, visitedLocations, accent) {
  if (index === currentIndex) {
    return {
      pixelSize: TOUR_PIN_SIZE_CURRENT,
      color: accent.withAlpha(1),
      disableDepthTest: true,
    };
  }

  if (isStopVisited(loc, index, currentIndex, visitedLocations)) {
    return {
      pixelSize: TOUR_PIN_SIZE_VISITED,
      color: accent.withAlpha(0.7),
      disableDepthTest: false,
    };
  }

  return {
    pixelSize: TOUR_PIN_SIZE_UPCOMING,
    color: Cesium.Color.fromCssColorString("#cccccc").withAlpha(0.5),
    disableDepthTest: false,
  };
}

export function syncTourGraphics(
  viewer,
  holder,
  { locations, currentIndex, visitedLocations, themeColor }
) {
  if (!viewer || !holder) return;

  destroyTourGraphics(viewer, holder);

  const accent = resolveAccentColor(themeColor);
  const visitedSet =
    visitedLocations instanceof Set ? visitedLocations : new Set(visitedLocations || []);

  for (let index = 0; index < locations.length; index++) {
    const loc = locations[index];
    const style = getPinStyle(index, loc, currentIndex, visitedSet, accent);
    const depthDistance = style.disableDepthTest ? Number.POSITIVE_INFINITY : 0;

    const entity = viewer.entities.add({
      name: loc.name,
      position: Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat),
      point: {
        pixelSize: style.pixelSize,
        color: style.color,
        outlineColor: Cesium.Color.BLACK.withAlpha(0.5),
        outlineWidth: 1,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: depthDistance,
      },
      label: {
        text: String(index + 1),
        font: "bold 12px sans-serif",
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: depthDistance,
      },
    });

    holder.pinEntities.push(entity);
    if (index === currentIndex) {
      holder.activePinEntity = entity;
    }
  }

  for (let i = 0; i < locations.length - 1; i++) {
    const start = locations[i];
    const end = locations[i + 1];
    const isVisited = i < currentIndex;
    const alpha = isVisited ? TOUR_PATH_VISITED_ALPHA : TOUR_PATH_UPCOMING_ALPHA;

    const segment = viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          start.lon,
          start.lat,
          end.lon,
          end.lat,
        ]),
        width: TOUR_PATH_WIDTH,
        material: accent.withAlpha(alpha),
        clampToGround: true,
      },
    });

    holder.segmentEntities.push(segment);
  }
}
