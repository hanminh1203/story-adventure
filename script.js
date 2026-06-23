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
const TARGET_SCREEN_POSITION_FROM_BOTTOM = 0.3;
const DUCK_IMAGE_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeDropShadow dx='0' dy='5' stdDeviation='4' flood-color='%23000' flood-opacity='.35'/%3E%3C/filter%3E%3Cg filter='url(%23s)'%3E%3Cellipse cx='48' cy='62' rx='31' ry='22' fill='%23ffd84d'/%3E%3Ccircle cx='62' cy='38' r='18' fill='%23ffe36b'/%3E%3Cpath d='M75 39h18L76 50z' fill='%23f58b1f'/%3E%3Ccircle cx='66' cy='33' r='3.5' fill='%23121a24'/%3E%3Cpath d='M22 55c9 9 20 10 30 5-11-1-19-6-24-15z' fill='%23f3bd2e' opacity='.8'/%3E%3Cpath d='M25 76h46' stroke='%23f58b1f' stroke-width='6' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E";

/**
 * Clones a <template> by id and returns its single root element.
 * @param {string} id - The id of the <template> element.
 * @returns {HTMLElement}
 */
function cloneTemplate(id) {
  return document.getElementById(id).content.cloneNode(true).firstElementChild;
}

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

/**
 * AbstractScreen - Base class for all screens
 */
class AbstractScreen {
  constructor(screenElementId) {
    this.screenElement = document.getElementById(screenElementId);
    this.isActive = false;
  }

  /**
   * Show the screen
   * @abstract
   */
  show() {
    this.isActive = true;
    this.screenElement.classList.remove("hidden");
    this.screenElement.setAttribute("aria-hidden", "false");
  }

  /**
   * Hide the screen
   * @abstract
   */
  hide() {
    this.isActive = false;
    this.screenElement.classList.add("hidden");
    this.screenElement.setAttribute("aria-hidden", "true");
  }
}

class StartScreen extends AbstractScreen {
  constructor(onStart) {
    super("start-screen");
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
    super.show();
    this.startBtn.focus();
  }

  hide() {
    super.hide();
    if (document.activeElement === this.startBtn) {
      document.activeElement.blur();
    }
  }
}

class FinalScreen extends AbstractScreen {
  constructor(onRestart) {
    super("final-screen");
    this.finalScore = document.getElementById("final-score");
    this.restartBtn = document.getElementById("restart-btn");
    this.onRestart = onRestart;

    this.restartBtn.addEventListener("click", () => {
      this.onRestart();
    });
    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (!this.isActive) return;

      if (e.key === "Enter") this.onRestart();
    });
  }

  show(score) {
    super.show();
    this.finalScore.textContent = String(score);
    this.restartBtn.focus();
  }

  hide() {
    super.hide();
    if (document.activeElement === this.restartBtn) {
      document.activeElement.blur();
    }
  }
}

class CharacterSelectScreen extends AbstractScreen {
  constructor(characters, onCharacterSelected, onGoBack) {
    super("character-select-screen");
    this.characterGrid = document.getElementById("character-grid");
    this.characters = characters;
    this.onCharacterSelected = onCharacterSelected;
    this.selectedCharacter = null;
    this.selectButtons = [];
    this.goBackButton = document.getElementById('character-select-go-back-btn');
    this.goBackButton.addEventListener('click', (event) => {
      onGoBack();
    })

    // Carousel arrows: only visible/needed below the row-of-4 breakpoint
    // (see .carousel-arrow / max-width: 899px in style.css), but wiring the
    // listeners unconditionally is harmless since scrollBy is a no-op when
    // the grid has no horizontal overflow (row-of-4 mode).
    this.prevButton = document.getElementById('character-prev-btn');
    this.nextButton = document.getElementById('character-next-btn');
    this.prevButton.addEventListener('click', () => this.scrollCharacters(-1));
    this.nextButton.addEventListener('click', () => this.scrollCharacters(1));

    this.renderCharacters();
  }

  scrollCharacters(direction) {
    this.characterGrid.scrollBy({
      left: direction * this.characterGrid.clientWidth,
      behavior: 'smooth',
    });
  }

  renderCharacters() {
    // Clear any existing content
    this.characterGrid.innerHTML = "";

    // Create a card for each character
    this.characters.forEach((character) => {
      const card = document.createElement("div");
      card.className = "character-card";

      const videoContainer = document.createElement("div");
      videoContainer.className = "character-video";

      const iframe = document.createElement("iframe");
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.src = `https://www.youtube.com/embed/${character.youtubeId}`;
      iframe.title = character.name;
      iframe.frameBorder = "0";
      iframe.allow = "autoplay;";
      iframe.allowFullscreen = true;

      videoContainer.appendChild(iframe);

      const characterInfoDiv = document.createElement("div");
      characterInfoDiv.className = "character-info";

      const nameDiv = document.createElement("div");
      nameDiv.className = "character-name";
      nameDiv.textContent = character.name;
      characterInfoDiv.appendChild(nameDiv);

      const titleDiv = document.createElement("div");
      titleDiv.className = "character-title";
      titleDiv.textContent = character.title;
      characterInfoDiv.appendChild(titleDiv);

      const selectBtn = document.createElement("button");
      selectBtn.className = "character-select-btn";
      selectBtn.type = "button";
      selectBtn.dataset.character = character.id;
      selectBtn.textContent = "SELECT";

      selectBtn.addEventListener("click", (e) => {
        const characterId = e.target.dataset.character;
        this.selectCharacter(characterId);
      });

      this.selectButtons.push(selectBtn);

      card.appendChild(videoContainer);
      card.appendChild(characterInfoDiv);
      card.appendChild(selectBtn);

      this.characterGrid.appendChild(card);
    });
  }

  selectCharacter(characterId) {
    this.selectedCharacter = characterId;
    this.hide();
    this.onCharacterSelected(characterId);
  }

  show() {
    super.show();
    // Focus first button
    if (this.selectButtons.length > 0) {
      this.selectButtons[0].focus();
    }
  }

  hide() {
    super.hide();
  }
}

class GameplayScreen extends AbstractScreen {
  constructor(onFinalize) {
    super("gameplay-screen");
    this.onFinalize = onFinalize;
    this.selectedCharacterId = null;

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
    this.locations = [];

    // DOM Elements
    this.scoreValue = document.getElementById("score-value");
    this.avatar = document.getElementById("avatar");
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

  /**
   * Resevered for DEBUG location when the coordinate is not working (do not remove this function)
   */
  onCanvasClicked() {
    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    // Set the input action for left-click
    handler.setInputAction((click) =>{
        // Pick the position in 3D space
        const cartesian = this.viewer.scene.pickPosition(click.position);
        
        if (Cesium.defined(cartesian)) {
            // Convert Cartesian3 world coordinates to Cartographic (longitude, latitude, height)
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            
            // Convert radians to degrees
            const longitude = Cesium.Math.toDegrees(cartographic.longitude);
            const latitude = Cesium.Math.toDegrees(cartographic.latitude);
            
            console.log('Clicked Coordinates: Longitude: ' + longitude.toFixed(4) + ', Latitude: ' + latitude.toFixed(4));
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  initEventListeners() {
    this.viewer.scene.postRender.addEventListener(this.positionPinPanel.bind(this));
    this.onCanvasClicked();

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
      if (e.key === " " && this.selectedPin) this.showDetailsPopup(this.locations[this.selectedPin.index]);
    });
  }

  start() {
    this.screenElement.classList.add('active');
    this.isActive = true;
    this.currentIndex = 0;
    this.score = 0;
    this.collectedItems.clear();
    this.hideDetailsPopup();
    this.hidePinPanel();
    // Get locations from the selected character
    this.character = CHARACTERS.find(c => c.id === this.selectedCharacterId);
    this.locations = this.character ? this.character.locations : [];
    this.updateScore();
    this.flyToLocation(this.currentIndex);
  }

  hide() {
    this.screenElement.classList.remove('active');
    this.viewer.camera.flyHome();
    this.hideDetailsPopup();
    this.hidePinPanel();
    super.hide();
  }

  createPinPanelContent(index) {
    const loc = this.locations[index];
    const content = cloneTemplate("tpl-pin-panel");
    content.querySelector(".panel-label").textContent = `Location ${index + 1} of ${this.locations.length}`;
    content.querySelector(".panel-title").textContent = loc.name;
    content.querySelector(".panel-description").textContent = loc.description || "";
    content.querySelector(".pin-details-btn").addEventListener("click", (event) => {
      event.stopPropagation();
      this.showDetailsPopup(loc);
    });
    return content;
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
    const isFinalLocation = this.currentIndex === this.locations.length - 1;

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
      this.detailsSlideshow.replaceChildren(cloneTemplate("tpl-slideshow-empty"));
      return;
    }

    // Frame: image + collectibles + prev/next buttons (all in template)
    const frame = cloneTemplate("tpl-slideshow-frame");
    const img = frame.querySelector("img");
    img.src = images[this.slideshowIndex];
    img.alt = `${loc.name} image ${this.slideshowIndex + 1}`;
    frame.querySelector(".collectibles-layer").append(...this.buildCollectibles(loc));
    frame.querySelector(".slideshow-btn-previous").addEventListener("click", () => this.changeSlide(-1));
    frame.querySelector(".slideshow-btn-next").addEventListener("click", () => this.changeSlide(1));

    // Counter: "1 / 3"
    const meta = cloneTemplate("tpl-slideshow-meta");
    meta.textContent = `${this.slideshowIndex + 1} / ${images.length}`;

    // Thumbnail strip
    const thumbnails = cloneTemplate("tpl-slideshow-thumbnails");
    images.forEach((url, index) => {
      const btn = cloneTemplate("tpl-thumbnail-btn");
      if (index === this.slideshowIndex) btn.classList.add("active");
      btn.setAttribute("aria-label", `Show image ${index + 1}`);
      btn.querySelector("img").src = url;
      btn.addEventListener("click", () => {
        this.slideshowIndex = index;
        this.renderSlideshow();
      });
      thumbnails.appendChild(btn);
    });

    this.detailsSlideshow.replaceChildren(frame, meta, thumbnails);
  }

  /** Returns an array of collectible button elements for the current slide. */
  buildCollectibles(loc) {
    const buttons = [];
    this.getCollectiblesForSlide(this.slideshowIndex).forEach((item, itemIndex) => {
      const itemId = this.getCollectibleId(loc, this.slideshowIndex, itemIndex);
      if (this.collectedItems.has(itemId)) return;

      const btn = cloneTemplate("tpl-collectible");
      btn.style.left = `${item.x}%`;
      btn.style.top = `${item.y}%`;
      btn.querySelector("img").src = DUCK_IMAGE_URL;
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        this.collectItem(itemId, btn);
      });
      buttons.push(btn);
    });
    return buttons;
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
    this.avatar.src = this.character ? this.character.avatarUrl : "";
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
    const loc = this.locations[index];
    const target = Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, 0);
    const boundingSphere = new Cesium.BoundingSphere(target, 1);
    const cameraOffset = new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(loc.heading || 0),
      Cesium.Math.toRadians(-50),
      loc.height
    );

    if (instant) {
      this.viewer.camera.viewBoundingSphere(boundingSphere, cameraOffset);
      this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      this.applyTargetVerticalOffset(loc.height);
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
        this.applyTargetVerticalOffset(loc.height);
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

  /**
   * flyToBoundingSphere/viewBoundingSphere always center the target on
   * screen. This nudges the camera along its own up-vector, after the
   * camera has settled, so the target lands at horizontal center but
   * TARGET_SCREEN_POSITION_FROM_BOTTOM of the way up from the bottom edge
   * instead of dead center.
   *
   * Moving the camera by `delta` along its local up vector (orientation
   * unchanged) shifts a previously-centered point's normalized screen Y by
   * approximately -delta / (range * tan(fovy / 2)). Solving that for the
   * delta that lands the point at the desired screen position gives the
   * formula below. `range` is the camera distance to the target (loc.height).
   */
  applyTargetVerticalOffset(range) {
    const fovy = this.viewer.camera.frustum.fovy;
    const delta = (1 - 2 * TARGET_SCREEN_POSITION_FROM_BOTTOM) * Math.tan(fovy / 2) * range;
    this.viewer.camera.moveUp(delta);
  }

  goNext() {
    if (!this.isActive || this.isFlying) return;
    if (this.currentIndex === this.locations.length - 1) {
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
  score = 0;
  selectedCharacter = null;
  currentState = "start";
  constructor() {
    // Initialize screens
    this.startScreen = new StartScreen(() => this.transitionTo("characterSelect"));
    this.characterSelectScreen = new CharacterSelectScreen(
      CHARACTERS,
      (character) => this.onCharacterSelected(character),
      () => this.transitionTo("start")
    );
    this.gameplayScreen = new GameplayScreen((score) => this.onGameFinalized(score));
    this.finalScreen = new FinalScreen(() => this.transitionTo("start"));

    // Start with the initial screen
    this.transitionTo("start");
  }

  /**
   * Transition to a new screen state
   */
  transitionTo(state) {
    // Hide current screen
    switch (this.currentState) {
      case "start":
        this.startScreen.hide();
        break;
      case "characterSelect":
        this.characterSelectScreen.hide();
        break;
      case "gameplay":
        this.gameplayScreen.hide();
        break;
      case "final":
        this.finalScreen.hide();
        break;
    }

    // Show new screen
    this.currentState = state;
    switch (this.currentState) {
      case "start":
        this.startScreen.show();
        break;
      case "characterSelect":
        this.characterSelectScreen.show();
        break;
      case "gameplay":
        this.gameplayScreen.selectedCharacterId = this.selectedCharacter;
        this.gameplayScreen.start();
        break;
      case "final":
        this.finalScreen.show(this.score);
        break;
    }
  }

  /**
   * Handle character selection
   */
  onCharacterSelected(characterId) {
    this.selectedCharacter = characterId;
    this.transitionTo("gameplay");
  }

  /**
   * Handle game finalization
   */
  onGameFinalized(score) {
    this.score = score;
    this.transitionTo("final");
  }
}

// Initialize the application controller
document.addEventListener("DOMContentLoaded", () => {
  new GameController();
});