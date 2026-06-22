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

const FLIGHT_DURATION_SECONDS = 2;
const DUCK_IMAGE_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeDropShadow dx='0' dy='5' stdDeviation='4' flood-color='%23000' flood-opacity='.35'/%3E%3C/filter%3E%3Cg filter='url(%23s)'%3E%3Cellipse cx='48' cy='62' rx='31' ry='22' fill='%23ffd84d'/%3E%3Ccircle cx='62' cy='38' r='18' fill='%23ffe36b'/%3E%3Cpath d='M75 39h18L76 50z' fill='%23f58b1f'/%3E%3Ccircle cx='66' cy='33' r='3.5' fill='%23121a24'/%3E%3Cpath d='M22 55c9 9 20 10 30 5-11-1-19-6-24-15z' fill='%23f3bd2e' opacity='.8'/%3E%3Cpath d='M25 76h46' stroke='%23f58b1f' stroke-width='6' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E";

const COLLECTIBLE_LAYOUTS = [
  [
    { x: 22, y: 34 },
    { x: 57, y: 52 },
    { x: 78, y: 27 }
  ],
  [
    { x: 18, y: 58 },
    { x: 46, y: 30 },
    { x: 73, y: 64 }
  ],
  [
    { x: 31, y: 24 },
    { x: 52, y: 68 },
    { x: 82, y: 45 }
  ]
];

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
let score = 0;
let gameStarted = false;
const collectedItems = new Set();

const scoreValue = document.getElementById("score-value");
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
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const finalScreen = document.getElementById("final-screen");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");

let slideshowLocation = null;
let slideshowIndex = 0;

viewer.scene.postRender.addEventListener(positionPinPanel);

// We do not need the click handler to show/hide the pin panel anymore since the pin billboard is removed
// and the panel is shown automatically after flying.
/*
handler.setInputAction((movement) => {
  const pickedObject = viewer.scene.pick(movement.position);

  if (pin && Cesium.defined(pickedObject) && pickedObject.id === pin) {
    showPinPanel();
  } else {
    hidePinPanel();
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
*/

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
  updateNavControls();
}

function setButtonsEnabled(enabled) {
  prevBtn.disabled = !enabled || currentIndex === 0;
  nextBtn.disabled = !enabled;
}

function updateNavControls() {
  const isFirstLocation = currentIndex === 0;
  const isFinalLocation = currentIndex === LOCATIONS.length - 1;

  prevBtn.classList.toggle("hidden", isFirstLocation);
  prevBtn.disabled = isFirstLocation || isFlying;

  nextBtn.classList.toggle("finalize-btn", isFinalLocation);
  nextBtn.textContent = isFinalLocation ? "Finalize" : "\u2192";
  nextBtn.setAttribute("aria-label", isFinalLocation ? "Finalize game" : "Next location");
  nextBtn.title = isFinalLocation ? "Finalize" : "Next (right arrow)";
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
  frame.appendChild(createCollectiblesLayer(loc));

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

function createCollectiblesLayer(loc) {
  const layer = document.createElement("div");
  layer.className = "collectibles-layer";

  getCollectiblesForSlide(slideshowIndex).forEach((item, itemIndex) => {
    const itemId = getCollectibleId(loc, slideshowIndex, itemIndex);
    if (collectedItems.has(itemId)) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "collectible-item";
    button.style.left = `${item.x}%`;
    button.style.top = `${item.y}%`;
    button.setAttribute("aria-label", "Collect duck for 1 point");
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      collectItem(itemId, button);
    });

    const duckImage = document.createElement("img");
    duckImage.src = DUCK_IMAGE_URL;
    duckImage.alt = "";
    button.appendChild(duckImage);
    layer.appendChild(button);
  });

  return layer;
}

function getCollectiblesForSlide(index) {
  return COLLECTIBLE_LAYOUTS[index % COLLECTIBLE_LAYOUTS.length];
}

function getCollectibleId(loc, imageIndex, itemIndex) {
  return `${loc.name}:${imageIndex}:${itemIndex}`;
}

function collectItem(itemId, button) {
  if (collectedItems.has(itemId)) return;

  collectedItems.add(itemId);
  score += 1;
  updateScore();
  button.classList.add("collected");
  window.setTimeout(() => button.remove(), 220);
}

function updateScore() {
  scoreValue.textContent = String(score);
}

function resetGame() {
  currentIndex = 0;
  score = 0;
  gameStarted = false;
  collectedItems.clear();
  hideDetailsPopup();
  hidePinPanel();
  updateScore();
  finalScreen.classList.add("hidden");
  finalScreen.setAttribute("aria-hidden", "true");
}

function startGame() {
  resetGame();
  gameStarted = true;
  startScreen.classList.add("hidden");
  startScreen.setAttribute("aria-hidden", "true");
  flyToLocation(currentIndex);
}

function finalizeGame() {
  hideDetailsPopup();
  hidePinPanel();
  finalScore.textContent = String(score);
  finalScreen.classList.remove("hidden");
  finalScreen.setAttribute("aria-hidden", "false");
  restartBtn.focus();
}

function restartGame() {
  resetGame();
  gameStarted = true;
  flyToLocation(currentIndex);
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
    position: Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, 0)
  });
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
    showPinPanel();
    return;
  }

  isFlying = true;
  setButtonsEnabled(false);
  hidePinPanel(); // Hide pin panel when flight starts

  viewer.camera.flyToBoundingSphere(boundingSphere, {
    duration: FLIGHT_DURATION_SECONDS,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    offset: cameraOffset,
    complete: () => {
      isFlying = false;
      setButtonsEnabled(true);
      updatePanel(index);
      infoPanel.classList.add("visible");
      showPinPanel(); // Show pin panel when flight finishes
    },
    cancel: () => {
      isFlying = false;
      setButtonsEnabled(true);
    }
  });
  setPin(loc, index);
}

function goNext() {
  if (!gameStarted || finalScreen.classList.contains("hidden") === false) return;
  if (isFlying) return;
  if (currentIndex === LOCATIONS.length - 1) {
    finalizeGame();
    return;
  }

  currentIndex += 1;
  flyToLocation(currentIndex);
}

function goPrev() {
  if (!gameStarted || finalScreen.classList.contains("hidden") === false) return;
  if (isFlying) return;
  if (currentIndex === 0) return;

  currentIndex -= 1;
  flyToLocation(currentIndex);
}

nextBtn.addEventListener("click", goNext);
prevBtn.addEventListener("click", goPrev);
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
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

updateScore();
updateNavControls();
