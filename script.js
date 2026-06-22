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

// Shared constants
const FLIGHT_DURATION_SECONDS = 2;
const MAX_FLIGHT_HEIGHT_METERS = 3000000;
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

class StartScreen {
  constructor(onStart) {
    this.screenElement = document.getElementById("start-screen");
    this.startBtn = document.getElementById("start-btn");
    this.onStart = onStart;
    this.isActive = true;

    this.startBtn.addEventListener("click", () => {
      this.onStart();
    });
    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (!this.isActive) return;

      if (e.key === "Enter") this.onStart();
    });
  }

  show() {
    this.isActive = true;
    this.screenElement.classList.remove("hidden");
    this.screenElement.setAttribute("aria-hidden", "false");
    this.startBtn.focus();
  }

  hide() {
    this.isActive = false;
    this.screenElement.classList.add("hidden");
    this.screenElement.setAttribute("aria-hidden", "true");
    if (document.activeElement === this.startBtn) {
      document.activeElement.blur();
    }
  }
}

class FinalScreen {
  constructor(onRestart) {
    this.screenElement = document.getElementById("final-screen");
    this.finalScore = document.getElementById("final-score");
    this.restartBtn = document.getElementById("restart-btn");
    this.onRestart = onRestart;
    this.isActive = false;

    this.restartBtn.addEventListener("click", () => {
      this.onRestart();
    });
    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (!this.isActive) return;

      if (e.key === "Enter") this.onRestart();
      console.log(e.key);
    });
  }

  show(score) {
    this.isActive = true;
    this.finalScore.textContent = String(score);
    this.screenElement.classList.remove("hidden");
    this.screenElement.setAttribute("aria-hidden", "false");
    this.restartBtn.focus();
  }

  hide() {
    this.isActive = false;
    this.screenElement.classList.add("hidden");
    this.screenElement.setAttribute("aria-hidden", "true");
    if (document.activeElement === this.restartBtn) {
      document.activeElement.blur();
    }
  }
}

class GameplayScreen {
  constructor(onFinalize) {
    this.gameplayScreen = document.getElementById("gameplay-screen");
    this.onFinalize = onFinalize;

    this.viewer = new Cesium.Viewer("cesiumContainer", {
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

    this.viewer.scene.globe.enableLighting = true;

    // State variables
    this.currentIndex = 0;
    this.isFlying = false;
    this.pin = null;
    this.selectedPin = null;
    this.score = 0;
    this.isActive = false;
    this.collectedItems = new Set();
    this.slideshowLocation = null;
    this.slideshowIndex = 0;

    // DOM Elements
    this.scoreValue = document.getElementById("score-value");
    this.prevBtn = document.getElementById("prev-btn");
    this.nextBtn = document.getElementById("next-btn");
    this.pinPanel = document.getElementById("pin-panel");
    this.detailsModal = document.getElementById("details-modal");
    this.detailsCloseBtn = document.getElementById("details-close-btn");
    this.detailsTitle = document.getElementById("details-title");
    this.detailsDescription = document.getElementById("details-description");
    this.detailsSlideshow = document.getElementById("details-slideshow");

    this.initEventListeners();
  }

  initEventListeners() {
    this.viewer.scene.postRender.addEventListener(this.positionPinPanel.bind(this));

    this.nextBtn.addEventListener("click", () => this.goNext());
    this.prevBtn.addEventListener("click", () => this.goPrev());
    this.detailsCloseBtn.addEventListener("click", () => this.hideDetailsPopup());

    this.detailsModal.addEventListener("click", (event) => {
      if (event.target === this.detailsModal) {
        this.hideDetailsPopup();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (!this.isActive) return;

      const isDetailsOpen = this.detailsModal.classList.contains("visible");

      if (isDetailsOpen && e.key === "ArrowRight") {
        const images = this.slideshowLocation ? this.slideshowLocation.images || [] : [];
        if (images.length > 0 && this.slideshowIndex === images.length - 1) {
          this.hideDetailsPopup();
          this.goNext();
        } else {
          this.changeSlide(1);
        }
        return;
      }

      if (isDetailsOpen && e.key === "ArrowLeft") {
        this.changeSlide(-1);
        return;
      }

      if (e.key === "ArrowRight") this.goNext();
      if (e.key === "ArrowLeft") this.goPrev();
      if (e.key === "Escape") this.hideDetailsPopup();
      if (e.key === " " && this.selectedPin) this.showDetailsPopup(LOCATIONS[this.selectedPin.index]);
    });
  }

  start() {
    this.gameplayScreen.classList.add('active');
    this.isActive = true;
    this.currentIndex = 0;
    this.score = 0;
    this.collectedItems.clear();
    this.hideDetailsPopup();
    this.hidePinPanel();
    this.updateScore();
    this.flyToLocation(this.currentIndex);
  }

  hide() {
    this.gameplayScreen.classList.remove('active');
    this.isActive = false;
    this.viewer.camera.flyHome();
    this.hideDetailsPopup();
    this.hidePinPanel();
  }

  createPinPanelContent(index) {
    const loc = LOCATIONS[index];
    const content = document.createElement("div");
    content.appendChild(this.createElementWithText("div", `Location ${index + 1} of ${LOCATIONS.length}`, "panel-label"));
    content.appendChild(this.createElementWithText("h2", loc.name, "panel-title"));
    content.appendChild(this.createElementWithText("p", loc.description || "", "panel-description"));

    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.className = "pin-details-btn";
    detailsButton.textContent = "Show details";
    detailsButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.showDetailsPopup(loc);
    });

    content.appendChild(detailsButton);
    return content;
  }

  createElementWithText(tag, text, className = "") {
    const el = document.createElement(tag);
    el.appendChild(document.createTextNode(text));
    el.className = className;
    return el;
  }

  updatePanel(index) {
    this.updateNavControls();
  }

  setButtonsEnabled(enabled) {
    this.prevBtn.disabled = !enabled || this.currentIndex === 0;
    this.nextBtn.disabled = !enabled;
  }

  updateNavControls() {
    const isFirstLocation = this.currentIndex === 0;
    const isFinalLocation = this.currentIndex === LOCATIONS.length - 1;

    this.prevBtn.classList.toggle("hidden", isFirstLocation);
    this.prevBtn.disabled = isFirstLocation || this.isFlying;

    this.nextBtn.classList.toggle("finalize-btn", isFinalLocation);
    this.nextBtn.textContent = isFinalLocation ? "Finalize" : "\u2192";
    this.nextBtn.setAttribute("aria-label", isFinalLocation ? "Finalize game" : "Next location");
    this.nextBtn.title = isFinalLocation ? "Finalize" : "Next (right arrow)";
  }

  showDetailsPopup(loc) {
    this.slideshowLocation = loc;
    this.slideshowIndex = 0;
    this.detailsTitle.textContent = loc.name;
    this.detailsDescription.textContent = loc.description || "";
    this.renderSlideshow();
    this.detailsModal.classList.add("visible");
    this.detailsModal.setAttribute("aria-hidden", "false");
    this.detailsCloseBtn.focus();
  }

  renderSlideshow() {
    const loc = this.slideshowLocation;
    const images = loc ? loc.images || [] : [];

    if (images.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "details-empty";
      emptyMessage.textContent = "No images have been added for this location yet.";
      this.detailsSlideshow.replaceChildren(emptyMessage);
      return;
    }

    const currentImage = images[this.slideshowIndex];
    const frame = document.createElement("div");
    frame.className = "slideshow-frame";

    const image = document.createElement("img");
    image.src = currentImage;
    image.alt = `${loc.name} image ${this.slideshowIndex + 1}`;
    frame.appendChild(image);
    frame.appendChild(this.createCollectiblesLayer(loc));

    const prevSlideBtn = this.createSlideButton("previous", "&#8592;", () => this.changeSlide(-1));
    const nextSlideBtn = this.createSlideButton("next", "&#8594;", () => this.changeSlide(1));
    frame.append(prevSlideBtn, nextSlideBtn);

    const meta = document.createElement("div");
    meta.className = "slideshow-meta";
    meta.textContent = `${this.slideshowIndex + 1} / ${images.length}`;

    const thumbnails = document.createElement("div");
    thumbnails.className = "slideshow-thumbnails";

    images.forEach((url, index) => {
      const thumbnailButton = document.createElement("button");
      thumbnailButton.type = "button";
      thumbnailButton.className = index === this.slideshowIndex ? "active" : "";
      thumbnailButton.setAttribute("aria-label", `Show image ${index + 1}`);
      thumbnailButton.addEventListener("click", () => {
        this.slideshowIndex = index;
        this.renderSlideshow();
      });

      const thumbnail = document.createElement("img");
      thumbnail.src = url;
      thumbnail.alt = "";
      thumbnail.loading = "lazy";
      thumbnailButton.appendChild(thumbnail);
      thumbnails.appendChild(thumbnailButton);
    });

    this.detailsSlideshow.replaceChildren(frame, meta, thumbnails);
  }

  createCollectiblesLayer(loc) {
    const layer = document.createElement("div");
    layer.className = "collectibles-layer";

    this.getCollectiblesForSlide(this.slideshowIndex).forEach((item, itemIndex) => {
      const itemId = this.getCollectibleId(loc, this.slideshowIndex, itemIndex);
      if (this.collectedItems.has(itemId)) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "collectible-item";
      button.style.left = `${item.x}%`;
      button.style.top = `${item.y}%`;
      button.setAttribute("aria-label", "Collect duck for 1 point");
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        this.collectItem(itemId, button);
      });

      const duckImage = document.createElement("img");
      duckImage.src = DUCK_IMAGE_URL;
      duckImage.alt = "";
      button.appendChild(duckImage);
      layer.appendChild(button);
    });

    return layer;
  }

  getCollectiblesForSlide(index) {
    return COLLECTIBLE_LAYOUTS[index % COLLECTIBLE_LAYOUTS.length];
  }

  getCollectibleId(loc, imageIndex, itemIndex) {
    return `${loc.name}:${imageIndex}:${itemIndex}`;
  }

  collectItem(itemId, button) {
    if (this.collectedItems.has(itemId)) return;

    this.collectedItems.add(itemId);
    this.score += 1;
    this.updateScore();
    button.classList.add("collected");
    window.setTimeout(() => button.remove(), 220);
  }

  updateScore() {
    this.scoreValue.textContent = String(this.score);
  }

  createSlideButton(direction, text, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `slideshow-btn slideshow-btn-${direction}`;
    button.setAttribute("aria-label", `${direction} image`);
    button.innerHTML = text;
    button.addEventListener("click", onClick);
    return button;
  }

  changeSlide(delta) {
    const images = this.slideshowLocation ? this.slideshowLocation.images || [] : [];
    if (images.length === 0) return;

    this.slideshowIndex = (this.slideshowIndex + delta + images.length) % images.length;
    this.renderSlideshow();
  }

  hideDetailsPopup() {
    this.detailsModal.classList.remove("visible");
    this.detailsModal.setAttribute("aria-hidden", "true");
    if (document.activeElement === this.detailsCloseBtn) {
      document.activeElement.blur();
    }
    this.slideshowLocation = null;
    this.slideshowIndex = 0;
  }

  hidePinPanel() {
    this.selectedPin = null;
    this.pinPanel.style.display = "none";
  }

  showPinPanel() {
    if (!this.pin) return;

    this.selectedPin = this.pin;
    this.pinPanel.replaceChildren(this.createPinPanelContent(this.pin.index));
    this.pinPanel.style.display = "block";
    this.positionPinPanel();
  }

  positionPinPanel() {
    if (!this.selectedPin || this.pinPanel.style.display === "none") return;

    const position = this.selectedPin.position.getValue(this.viewer.clock.currentTime);
    const canvasPosition = Cesium.SceneTransforms.worldToWindowCoordinates(this.viewer.scene, position);

    if (!canvasPosition) {
      this.pinPanel.style.display = "none";
      return;
    }

    this.pinPanel.style.left = `${canvasPosition.x - this.pinPanel.offsetWidth / 2}px`;
    this.pinPanel.style.top = `${canvasPosition.y - this.pinPanel.offsetHeight - 20}px`;
  }

  setPin(loc, index) {
    if (this.pin) {
      this.viewer.entities.remove(this.pin);
    }

    this.pin = this.viewer.entities.add({
      name: loc.name,
      index,
      position: Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, 0)
    });
  }

  flyToLocation(index, { instant = false } = {}) {
    const loc = LOCATIONS[index];
    const target = Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, 0);
    const boundingSphere = new Cesium.BoundingSphere(target, 1);
    const cameraOffset = new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(loc.heading || 0),
      Cesium.Math.toRadians(loc.pitch !== undefined ? loc.pitch : -45),
      loc.height
    );

    if (instant) {
      this.viewer.camera.viewBoundingSphere(boundingSphere, cameraOffset);
      this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      this.updatePanel(index);
      this.setPin(loc, index);
      this.showPinPanel();
      return;
    }

    this.isFlying = true;
    this.setButtonsEnabled(false);
    this.hidePinPanel();

    this.viewer.camera.flyToBoundingSphere(boundingSphere, {
      duration: FLIGHT_DURATION_SECONDS,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      offset: cameraOffset,
      maximumHeight: MAX_FLIGHT_HEIGHT_METERS,
      pitchAdjustHeight: 10,
      complete: () => {
        this.isFlying = false;
        this.setButtonsEnabled(true);
        this.updatePanel(index);
        this.showPinPanel();
      },
      cancel: () => {
        this.isFlying = false;
        this.setButtonsEnabled(true);
      }
    });
    this.setPin(loc, index);
  }

  goNext() {
    if (!this.isActive || this.isFlying) return;
    if (this.currentIndex === LOCATIONS.length - 1) {
      this.onFinalize(this.score);
      return;
    }

    this.currentIndex += 1;
    this.flyToLocation(this.currentIndex);
  }

  goPrev() {
    if (!this.isActive || this.isFlying) return;
    if (this.currentIndex === 0) return;

    this.currentIndex -= 1;
    this.flyToLocation(this.currentIndex);
  }
}

class GameController {
  constructor() {
    this.startScreen = new StartScreen(() => this.startGame());
    this.gameplayScreen = new GameplayScreen((score) => this.finalizeGame(score));
    this.finalScreen = new FinalScreen(() => this.restartGame());
  }

  startGame() {
    this.startScreen.hide();
    this.gameplayScreen.start();
  }

  finalizeGame(score) {
    this.gameplayScreen.hide();
    this.finalScreen.show(score);
  }

  restartGame() {
    this.finalScreen.hide();
    this.gameplayScreen.start();
  }
}

// Initialize the application controller
document.addEventListener("DOMContentLoaded", () => {
  new GameController();
});
