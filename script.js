/**
 * Location Flythrough Map - powered by CesiumJS (Apache 2.0, no API key needed
 * for this setup). Imagery is Esri's free public World Imagery service
 * (satellite/aerial photos, no token required), terrain is the built-in
 * smooth ellipsoid - no Cesium ion account needed for any of this.
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
let selectedPin = null;

const infoPanel = document.getElementById("info-panel");
const infoCounter = document.getElementById("info-counter");
const infoTitle = document.getElementById("info-title");
const infoDescription = document.getElementById("info-description");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pinPanel = document.getElementById("pin-panel");
const detailsModal = document.getElementById("details-modal");
const detailsCloseBtn = document.getElementById("details-close-btn");
const detailsTitle = document.getElementById("details-title");
const detailsDescription = document.getElementById("details-description");
const detailsSlideshow = document.getElementById("details-slideshow");

let slideshowLocation = null;
let slideshowIndex = 0;

viewer.scene.postRender.addEventListener(positionPinPanel);

handler.setInputAction((movement) => {
  const pickedObject = viewer.scene.pick(movement.position);

  if (pin && Cesium.defined(pickedObject) && pickedObject.id === pin) {
    showPinPanel();
  } else {
    hidePinPanel();
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

function createPinPanelContent(loc) {
  const content = document.createElement("div");
  content.appendChild(createElementWithText("strong", loc.name));
  content.appendChild(document.createElement("br"));
  content.appendChild(createElementWithText("span", loc.description || ""));

  const detailsButton = document.createElement("button");
  detailsButton.type = "button";
  detailsButton.className = "pin-details-btn";
  detailsButton.textContent = "Show details";
  detailsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    showDetailsPopup(loc);
  });

  content.appendChild(detailsButton);
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

function showDetailsPopup(loc) {
  slideshowLocation = loc;
  slideshowIndex = 0;
  detailsTitle.textContent = loc.name;
  detailsDescription.textContent = loc.description || "";
  renderSlideshow();
  detailsModal.classList.add("visible");
  detailsModal.setAttribute("aria-hidden", "false");
  detailsCloseBtn.focus();
}

function renderSlideshow() {
  const loc = slideshowLocation;
  const images = loc ? loc.images || [] : [];

  if (images.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "details-empty";
    emptyMessage.textContent = "No images have been added for this location yet.";
    detailsSlideshow.replaceChildren(emptyMessage);
    return;
  }

  const currentImage = images[slideshowIndex];
  const frame = document.createElement("div");
  frame.className = "slideshow-frame";

  const image = document.createElement("img");
  image.src = currentImage;
  image.alt = `${loc.name} image ${slideshowIndex + 1}`;
  frame.appendChild(image);

  const prevSlideBtn = createSlideButton("previous", "&#8592;", () => changeSlide(-1));
  const nextSlideBtn = createSlideButton("next", "&#8594;", () => changeSlide(1));
  frame.append(prevSlideBtn, nextSlideBtn);

  const meta = document.createElement("div");
  meta.className = "slideshow-meta";
  meta.textContent = `${slideshowIndex + 1} / ${images.length}`;

  const thumbnails = document.createElement("div");
  thumbnails.className = "slideshow-thumbnails";

  images.forEach((url, index) => {
    const thumbnailButton = document.createElement("button");
    thumbnailButton.type = "button";
    thumbnailButton.className = index === slideshowIndex ? "active" : "";
    thumbnailButton.setAttribute("aria-label", `Show image ${index + 1}`);
    thumbnailButton.addEventListener("click", () => {
      slideshowIndex = index;
      renderSlideshow();
    });

    const thumbnail = document.createElement("img");
    thumbnail.src = url;
    thumbnail.alt = "";
    thumbnail.loading = "lazy";
    thumbnailButton.appendChild(thumbnail);
    thumbnails.appendChild(thumbnailButton);
  });

  detailsSlideshow.replaceChildren(frame, meta, thumbnails);
}

function createSlideButton(direction, text, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `slideshow-btn slideshow-btn-${direction}`;
  button.setAttribute("aria-label", `${direction} image`);
  button.innerHTML = text;
  button.addEventListener("click", onClick);
  return button;
}

function changeSlide(delta) {
  const images = slideshowLocation ? slideshowLocation.images || [] : [];
  if (images.length === 0) return;

  slideshowIndex = (slideshowIndex + delta + images.length) % images.length;
  renderSlideshow();
}

function hideDetailsPopup() {
  detailsModal.classList.remove("visible");
  detailsModal.setAttribute("aria-hidden", "true");
  slideshowLocation = null;
  slideshowIndex = 0;
}

function hidePinPanel() {
  selectedPin = null;
  pinPanel.style.display = "none";
}

function showPinPanel() {
  if (!pin) return;

  selectedPin = pin;
  pinPanel.replaceChildren(createPinPanelContent(LOCATIONS[pin.index]));
  pinPanel.style.display = "block";
  positionPinPanel();
}

function positionPinPanel() {
  if (!selectedPin || pinPanel.style.display === "none") return;

  const position = selectedPin.position.getValue(viewer.clock.currentTime);
  const canvasPosition = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, position);

  if (!canvasPosition) {
    pinPanel.style.display = "none";
    return;
  }

  pinPanel.style.left = `${canvasPosition.x - pinPanel.offsetWidth / 2}px`;
  pinPanel.style.top = `${canvasPosition.y - pinPanel.offsetHeight - 20}px`;
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
      image: pinBuilder.fromText(String(index + 1), Cesium.Color.RED, 48).toDataURL(),
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    }
  });
  showPinPanel();
}

function flyToLocation(index, { instant = false } = {}) {
  const loc = LOCATIONS[index];
  const target = Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, 0);
  const boundingSphere = new Cesium.BoundingSphere(target, 1);
  const cameraOffset = new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(loc.heading || 0),
    Cesium.Math.toRadians(loc.pitch !== undefined ? loc.pitch : -45),
    loc.height
  );

  // Fade the panel out while flying, back in once we arrive.
  infoPanel.classList.remove("visible");

  if (instant) {
    viewer.camera.viewBoundingSphere(boundingSphere, cameraOffset);
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    updatePanel(index);
    requestAnimationFrame(() => infoPanel.classList.add("visible"));
    setPin(loc, index);
    return;
  }

  isFlying = true;
  setButtonsEnabled(false);

  viewer.camera.flyToBoundingSphere(boundingSphere, {
    duration: FLIGHT_DURATION_SECONDS,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    offset: cameraOffset,
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
detailsCloseBtn.addEventListener("click", hideDetailsPopup);
detailsModal.addEventListener("click", (event) => {
  if (event.target === detailsModal) {
    hideDetailsPopup();
  }
});

// Optional: left/right arrow keys do the same thing as the buttons.
document.addEventListener("keydown", (e) => {
  const isDetailsOpen = detailsModal.classList.contains("visible");

  if (isDetailsOpen && e.key === "ArrowRight") {
    changeSlide(1);
    return;
  }

  if (isDetailsOpen && e.key === "ArrowLeft") {
    changeSlide(-1);
    return;
  }

  if (e.key === "ArrowRight") goNext();
  if (e.key === "ArrowLeft") goPrev();
  if (e.key === "Escape") hideDetailsPopup();
});

// Land on the first location immediately on load (no flight on first paint).
flyToLocation(currentIndex, { instant: true });
