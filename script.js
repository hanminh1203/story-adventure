/**
 * Location Flythrough Map — powered by CesiumJS (Apache 2.0, no API key needed
 * for this setup). Imagery is Esri's free public World Imagery service
 * (satellite/aerial photos, no token required), terrain is the built-in
 * smooth ellipsoid — no Cesium ion account needed for any of this.
 *
 * Want real 3D terrain (mountains, valleys) instead of a smooth globe?
 * Sign up for a free Cesium ion account (cesium.com/ion), then:
 *   1. Set Cesium.Ion.defaultAccessToken = "<your token>";
 *   2. Replace terrainProvider below with: await Cesium.createWorldTerrainAsync()
 */

const FLIGHT_DURATION_SECONDS = 3.5;

const viewer = new Cesium.Viewer("cesiumContainer", {
  baseLayer: Cesium.ImageryLayer.fromProviderAsync(
    Cesium.ArcGisMapServerImageryProvider.fromUrl(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    )
  ),
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
  selectionIndicator: false
});

const pinBuilder = new Cesium.PinBuilder();

const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

// Light atmosphere/lighting touch so the globe doesn't look flat.
viewer.scene.globe.enableLighting = true;

let currentIndex = 0;
let isFlying = false;
let pin = null;

const infoPanel = document.getElementById("info-panel");
const infoCounter = document.getElementById("info-counter");
const infoTitle = document.getElementById("info-title");
const infoDescription = document.getElementById("info-description");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pinPanel = document.getElementById("pin-panel");


handler.setInputAction(function(movement) {
    // Pick an entity under the mouse position
    const pickedObject = viewer.scene.pick(movement.position);

    // Verify if the clicked object is our specific pin
    if (pin && Cesium.defined(pickedObject) && pickedObject.id === pin) {
        const loc = LOCATIONS[pin.index];
        
        console.log("Pin clicked:", loc);
        pinPanel.replaceChildren(createPinPanelContent(loc));
        pinPanel.style.display = 'block'; // Show the panel

        viewer.scene.postRender.addEventListener(function() {
            const position = pickedObject.id.position.getValue(viewer.clock.currentTime);
            const canvasPosition = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, position);
            if(canvasPosition) {
                pinPanel.style.left = (canvasPosition.x - pinPanel.offsetWidth / 2) + 'px';
                pinPanel.style.top = (canvasPosition.y - pinPanel.offsetHeight - 20) + 'px'; // Offset above the pin
            }
        });
    } else {
      pinPanel.style.display = 'none';
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

function createPinPanelContent(loc) {
  const content = document.createElement("div");
  content.appendChild(createElementWithText('strong', loc.name));
  content.appendChild(document.createElement('br'));
  content.appendChild(createElementWithText('span', loc.description || ""));
  content.appendChild(document.createElement('br')); // TODO: HTML satanized
  return content;
}

function createElementWithText(tag, text) {
  const el = document.createElement(tag);
  el.appendChild(document.createTextNode(text));
  return el;
}
function updatePanel(index) {
  const loc = LOCATIONS[index];
  infoCounter.textContent = `Location ${index + 1} of ${LOCATIONS.length}`;
  infoTitle.textContent = loc.name;
  infoDescription.textContent = loc.description || "";
}

function setButtonsEnabled(enabled) {
  prevBtn.disabled = !enabled;
  nextBtn.disabled = !enabled;
}

function locationToCamera(destination, {heading, pitch, roll}) {
  // 3. Compute the directional vector based on the camera orientation
const transform = Cesium.Transforms.eastNorthUpToFixedFrame(destination);
const orientation = Cesium.Quaternion.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(heading, pitch, roll));
const matrix = Cesium.Matrix4.fromRotationTranslation(orientation, Cesium.Cartesian3.ZERO);
console.log(transform, orientation, matrix);
// Multiply the camera's negative Z-axis (forward) by the transform matrix to get the world direction
const direction = new Cesium.Cartesian3();
Cesium.Matrix4.multiplyByVector(matrix, new Cesium.Cartesian3(0, 0, -1), direction);
console.log(direction);
Cesium.Cartesian3.normalize(direction, direction);
// 4. Calculate the camera position
const cameraPosition = new Cesium.Cartesian3();
// Camera is positioned at the target MINUS the distance scaled by the direction vector
Cesium.Cartesian3.multiplyByScalar(direction, 5000, cameraPosition);
Cesium.Cartesian3.subtract(destination, cameraPosition, cameraPosition);
console.log(cameraPosition);
return cameraPosition;
}

function setPin(loc, index) {
  if (pin) {
    viewer.entities.remove(pin);
  }
  pin = viewer.entities.add({
    name: loc.name,
    index,
    position: Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, 0),
    billboard: {
        image: pinBuilder.fromText(loc.name, Cesium.Color.RED, 48).toDataURL(),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    }
  });
  pinPanel.style.display = 'none';
}

function flyToLocation(index, { instant = false } = {}) {
  const loc = LOCATIONS[index];
  const destination = Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, loc.height);
  const orientation = {
    heading: Cesium.Math.toRadians(loc.heading || 0),
    pitch: Cesium.Math.toRadians(loc.pitch !== undefined ? loc.pitch : -45),
    roll: 0
  };
  console.log(destination, orientation);

  // Fade the panel out while flying, back in once we arrive.
  infoPanel.classList.remove("visible");
  
  if (instant) {
    viewer.camera.setView({ destination, orientation });
    updatePanel(index);
    requestAnimationFrame(() => infoPanel.classList.add("visible"));
    setPin(loc, index);
    return;
  }

  isFlying = true;
  setButtonsEnabled(false);

  viewer.camera.flyTo({
    destination,
    orientation,
    duration: FLIGHT_DURATION_SECONDS,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    complete: () => {
      isFlying = false;
      setButtonsEnabled(true);
      updatePanel(index);
      infoPanel.classList.add("visible");
    },
    cancel: () => {
      isFlying = false;
      setButtonsEnabled(true);
    }
  });
  setPin(loc, index);
}



function goNext() {
  if (isFlying) return;
  currentIndex = (currentIndex + 1) % LOCATIONS.length;
  flyToLocation(currentIndex);
}

function goPrev() {
  if (isFlying) return;
  currentIndex = (currentIndex - 1 + LOCATIONS.length) % LOCATIONS.length;
  flyToLocation(currentIndex);
}

nextBtn.addEventListener("click", goNext);
prevBtn.addEventListener("click", goPrev);

// Optional: left/right arrow keys do the same thing as the buttons.
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") goNext();
  if (e.key === "ArrowLeft") goPrev();
});

// Land on the first location immediately on load (no flight on first paint).
flyToLocation(currentIndex, { instant: true });