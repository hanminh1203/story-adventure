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
const DETAIL_FLIGHT_DURATION_SECONDS = 1;
const MAX_FLIGHT_HEIGHT_METERS = 3000000;
const TARGET_SCREEN_POSITION_FROM_BOTTOM = 0.3;
const COLLECT_MESSAGES = ["Great find!", "Nice one!", "Got it!"];
const SELECT_BUTTON_LABEL = "Pick me!";
const DEFAULT_COLLECTIBLE_NAME = "treasures";
const DEFAULT_COLLECTIBLE_IMAGE = "assets/collectible-coin.svg";
const DEFAULT_AVATAR_IMAGE = "assets/avatar-princess.svg";
const DEBUG_COORDS = new URLSearchParams(location.search).has("debug");

/** Google Apps Script Web App URL — replace after deploying apps-script/Code.gs */
const CHARACTERS_DATA_URL = "https://script.google.com/macros/s/AKfycby-iKxGO8dQGPMg6rPlSzlc09dflN7uoe_CwPpyRc2j29FT6JtmZkL4D_Q4ub323BUT/exec";

/** Character guides loaded from the Google Sheet at runtime. */
let CHARACTERS = [];

const CHARACTERS_CACHE_KEY = "charactersCache";

function splitCell(value) {
  return String(value || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isSafeMediaUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("assets/") || trimmed.startsWith("./assets/")) {
    return true;
  }
  try {
    const parsed = new URL(trimmed, window.location.href);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function sanitizeMediaUrl(url) {
  return isSafeMediaUrl(url) ? url.trim() : "";
}

/**
 * Accepts a full YouTube URL (watch, youtu.be, embed, shorts) or a bare video
 * id and returns just the 11-char video id, or "" if none can be found.
 */
function extractYouTubeId(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw, window.location.href);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return url.pathname.slice(1, 12);
    }
    if (host.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const match = url.pathname.match(/\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{11})/);
      if (match) return match[1];
    }
  } catch {
    /* not a parseable URL */
  }
  const fallback = raw.match(/[A-Za-z0-9_-]{11}/);
  return fallback ? fallback[0] : "";
}

function getYouTubeEmbedUrl(character) {
  const id = extractYouTubeId(character?.youtubeUrl);
  return id ? `https://www.youtube.com/embed/${id}` : "";
}

function normalizeCharacters(data) {
  return (data.characters || []).map((character) => ({
    ...character,
    avatarUrl: sanitizeMediaUrl(character.avatarUrl),
    collectibleImage: sanitizeMediaUrl(character.collectibleImage),
    locations: (character.locations || []).map((location) => {
      const images = Array.isArray(location.images)
        ? location.images
        : splitCell(location.images);
      const normalized = {
        ...location,
        lat: Number(location.lat),
        lon: Number(location.lon),
        height: Number(location.height),
        images: images.map(sanitizeMediaUrl).filter(Boolean),
      };
      return normalized;
    }),
  }));
}

async function loadCharacters() {
  const response = await fetch(CHARACTERS_DATA_URL, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Failed to load characters (${response.status})`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  CHARACTERS = normalizeCharacters(data);
  try {
    localStorage.setItem(CHARACTERS_CACHE_KEY, JSON.stringify(CHARACTERS));
  } catch {
    // localStorage may be unavailable in some embed contexts
  }
}

function prefersReducedMotion() {
  return window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function flightDuration(base) {
  return prefersReducedMotion() ? 0 : base;
}

function getCharacterCollectibleName(character) {
  return character?.collectibleName || DEFAULT_COLLECTIBLE_NAME;
}

function getCharacterCollectibleImage(character) {
  return character?.collectibleImage || DEFAULT_COLLECTIBLE_IMAGE;
}

function getCharacterAvatarImage(character) {
  return character?.avatarUrl || DEFAULT_AVATAR_IMAGE;
}

function formatCollectibleLabel(collectibleName) {
  if (!collectibleName) return "Treasures found!";
  return `${collectibleName.charAt(0).toUpperCase()}${collectibleName.slice(1)} found!`;
}

function getCollectibleSingular(collectibleName) {
  if (!collectibleName) return "treasure";
  if (collectibleName === "music notes") return "music note";
  if (collectibleName.endsWith("s")) return collectibleName.slice(0, -1);
  return collectibleName;
}

/**
 * Clones a <template> by id and returns its single root element.
 * @param {string} id - The id of the <template> element.
 * @returns {HTMLElement}
 */
function cloneTemplate(id) {
  return document.getElementById(id).content.cloneNode(true).firstElementChild;
}

const COLLECTIBLES_PER_SLIDE = 3;
const COLLECTIBLE_X_EDGE_PAD = 6;
const COLLECTIBLE_Y_MIN = 18;
const COLLECTIBLE_Y_MAX = 78;

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function generateBalancedPositions() {
  const bandWidth = 100 / COLLECTIBLES_PER_SLIDE;
  const positions = [];
  for (let i = 0; i < COLLECTIBLES_PER_SLIDE; i++) {
    const xMin = i * bandWidth + COLLECTIBLE_X_EDGE_PAD;
    const xMax = (i + 1) * bandWidth - COLLECTIBLE_X_EDGE_PAD;
    positions.push({
      x: randomInRange(xMin, xMax),
      y: randomInRange(COLLECTIBLE_Y_MIN, COLLECTIBLE_Y_MAX)
    });
  }
  return positions;
}

function formatCollectGoal(character) {
  const name = getCharacterCollectibleName(character);
  return `Find ${COLLECTIBLES_PER_SLIDE} hidden ${name} in these pictures!`;
}

function getCollectMessages() {
  return COLLECT_MESSAGES;
}

function getCollectibleCountForSlide(slideIndex) {
  return COLLECTIBLES_PER_SLIDE;
}

function makeCollectibleId(loc, imageIndex, itemIndex) {
  return `${loc.name}:${imageIndex}:${itemIndex}`;
}

function countCollectiblesForLocation(loc) {
  const images = loc.images || [];
  let total = 0;
  for (let i = 0; i < images.length; i++) {
    total += getCollectibleCountForSlide(i);
  }
  return total;
}

function countCollectiblesForTour(locations) {
  return locations.reduce((sum, loc) => sum + countCollectiblesForLocation(loc), 0);
}

function countCollectedCollectiblesForLocation(loc, collectedItems) {
  const images = loc.images || [];
  let count = 0;
  for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
    for (let itemIndex = 0; itemIndex < COLLECTIBLES_PER_SLIDE; itemIndex++) {
      if (collectedItems.has(makeCollectibleId(loc, imageIndex, itemIndex))) {
        count++;
      }
    }
  }
  return count;
}

function isLocationFullyCollected(loc, collectedItems) {
  const total = countCollectiblesForLocation(loc);
  if (total === 0) return false;
  return countCollectedCollectiblesForLocation(loc, collectedItems) === total;
}

function areAllCollectiblesCollectedForSlide(loc, slideIndex, collectedItems) {
  for (let itemIndex = 0; itemIndex < COLLECTIBLES_PER_SLIDE; itemIndex++) {
    if (!collectedItems.has(makeCollectibleId(loc, slideIndex, itemIndex))) {
      return false;
    }
  }
  return true;
}

function getStarRating(score, maxScore) {
  if (maxScore === 0) return 1;
  const ratio = score / maxScore;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}

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
    this.finalStars = document.getElementById("final-stars");
    this.finalCollectSummary = document.getElementById("final-collect-summary");
    this.finalCharacterMessage = document.getElementById("final-character-message");
    this.confettiLayer = document.getElementById("confetti-layer");
    this.restartBtn = document.getElementById("restart-btn");
    this.onRestart = onRestart;
    this.confettiHideTimer = null;

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

  show(summary) {
    super.show();
    const { score, maxScore, character, collectibleName } = summary;
    const itemsName = collectibleName || getCharacterCollectibleName(character);

    if (character && character.themeColor) {
      this.screenElement.style.setProperty("--guide-accent", character.themeColor);
    } else {
      this.screenElement.style.removeProperty("--guide-accent");
    }

    this.renderStars(getStarRating(score, maxScore));
    this.finalScore.textContent = String(score);
    this.finalScore.classList.remove("final-score-pop");
    void this.finalScore.offsetWidth;
    this.finalScore.classList.add("final-score-pop");

    let itemsSummary = `You found ${score} of ${maxScore} ${itemsName}!`;
    if (maxScore > 0 && score === maxScore) {
      itemsSummary += " Super Explorer!";
    }
    this.finalCollectSummary.textContent = itemsSummary;

    const characterName = character ? character.name : "Your guide";
    this.finalCharacterMessage.textContent = `${characterName} is proud of your adventure!`;

    this.spawnConfetti();
    this.restartBtn.focus();
  }

  renderStars(rating) {
    this.finalStars.replaceChildren();
    for (let i = 1; i <= 3; i++) {
      const star = document.createElement("span");
      star.className = i <= rating ? "final-star filled" : "final-star";
      star.textContent = "\u2605";
      star.setAttribute("aria-hidden", "true");
      this.finalStars.appendChild(star);
    }
  }

  spawnConfetti() {
    if (prefersReducedMotion()) return;

    this.clearConfetti();
    const colors = ["#ffd84d", "#6fa8ff", "#ff9a8b", "#6dd47e", "#ffe679"];
    const pieceCount = 36;

    for (let i = 0; i < pieceCount; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.backgroundColor = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.8}s`;
      piece.style.animationDuration = `${2.2 + Math.random() * 1.2}s`;
      this.confettiLayer.appendChild(piece);
    }
  }

  clearConfetti() {
    if (this.confettiHideTimer) {
      window.clearTimeout(this.confettiHideTimer);
      this.confettiHideTimer = null;
    }
    this.confettiLayer.replaceChildren();
  }

  hide() {
    this.clearConfetti();
    this.finalScore.classList.remove("final-score-pop");
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
      if (character.themeColor) {
        card.style.setProperty("--guide-accent", character.themeColor);
      }

      const videoContainer = document.createElement("div");
      videoContainer.className = "character-video";

      const iframe = document.createElement("iframe");
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.src = getYouTubeEmbedUrl(character);
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
      selectBtn.className = "btn-accent character-select-btn";
      selectBtn.type = "button";
      selectBtn.dataset.character = character.id;
      selectBtn.textContent = SELECT_BUTTON_LABEL;

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
    if (document.activeElement) {
      document.activeElement.blur();
    }
  }
}

class GameplayScreen extends AbstractScreen {
  constructor(onFinalize, onExit) {
    super("gameplay-screen");
    this.onFinalize = onFinalize;
    this.onExit = onExit;
    this.selectedCharacterId = null;
    this.viewer = null;

    // State variables
    this.currentIndex = 0;
    this.isFlying = false;
    this.pin = null;
    this.selectedPin = null;
    this.score = 0;
    this.isActive = false;
    this.collectedItems = new Set();
    this.clearedLocations = new Set();
    this.visitedLocations = new Set();
    this.collectiblePositions = new Map();
    this.slideshowLocation = null;
    this.slideshowIndex = 0;
    this.locations = [];
    this.pinPanelOpen = false;
    this.overviewCameraState = null;
    this.isDetailViewActive = false;

    // DOM Elements
    this.scoreValue = document.getElementById("score-value");
    this.scorePanel = document.getElementById("score-panel");
    this.scoreLabel = document.getElementById("score-label");
    this.scoreCollectibleIcon = document.getElementById("score-collectible-icon");
    this.avatar = document.getElementById("avatar");
    this.gameplayUi = document.querySelector("#gameplay-screen .ui");
    this.progressTrailLabel = document.getElementById("progress-trail-label");
    this.progressTrailDots = document.getElementById("progress-trail-dots");
    this.achievementToast = document.getElementById("achievement-toast");
    this.prevBtn = document.getElementById("prev-btn");
    this.nextBtn = document.getElementById("next-btn");
    this.pinPanel = document.getElementById("pin-panel");
    this.pinPanelBody = document.getElementById("pin-panel-body");
    this.locationUi = document.getElementById("location-ui");
    this.detailsModal = document.getElementById("details-modal");
    this.detailsCloseBtn = document.getElementById("details-close-btn");
    this.detailsTitle = document.getElementById("details-title");
    this.detailsCollectGoal = document.getElementById("details-collect-goal");
    this.detailsDescription = document.getElementById("details-description");
    this.detailsSlideshow = document.getElementById("details-slideshow");
    this.exitBtn = document.getElementById("exit-btn");
    this.exitConfirmModal = document.getElementById("exit-confirm-modal");
    this.exitConfirmBtn = document.getElementById("exit-confirm-btn");
    this.exitCancelBtn = document.getElementById("exit-cancel-btn");
    this.loadingScreen = document.getElementById("loading-screen");

    this.initEventListeners();
  }

  showLoading() {
    if (!this.loadingScreen) return;
    this.loadingScreen.classList.remove("hidden");
    this.loadingScreen.setAttribute("aria-hidden", "false");
  }

  hideLoading() {
    if (!this.loadingScreen) return;
    this.loadingScreen.classList.add("hidden");
    this.loadingScreen.setAttribute("aria-hidden", "true");
  }

  whenMapReady(onReady) {
    const globe = this.viewer.scene.globe;
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

    Promise.resolve(this.imageryProviderPromise).catch(() => {}).then(() => {
      if (done) return;
      if (globe.tilesLoaded) {
        finish();
        return;
      }
      removeListener = globe.tileLoadProgressEvent.addEventListener((queued) => {
        if (queued === 0 && globe.tilesLoaded) finish();
      });
    });
  }

  ensureViewer() {
    if (this.viewer) return;

    const imageryProviderPromise = Cesium.ArcGisMapServerImageryProvider.fromUrl(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    );
    this.imageryProviderPromise = imageryProviderPromise;

    this.viewer = new Cesium.Viewer("cesiumContainer", {
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
      selectionIndicator: false
    });

    this.viewer.scene.globe.enableLighting = true;
    this.viewer.scene.postRender.addEventListener(this.positionPinPanel.bind(this));

    if (DEBUG_COORDS) {
      this.onCanvasClicked();
    }
  }

  /**
   * Reserved for DEBUG location when the coordinate is not working (do not remove this function).
   * Enabled only when the URL contains ?debug=coords or ?debug.
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
    this.nextBtn.addEventListener("click", () => this.goNext());
    this.prevBtn.addEventListener("click", () => this.goPrev());
    this.detailsCloseBtn.addEventListener("click", () => this.hideDetailsPopup());
    this.exitBtn.addEventListener("click", () => this.showExitConfirm());
    this.exitConfirmBtn.addEventListener("click", () => this.confirmExit());
    this.exitCancelBtn.addEventListener("click", () => this.hideExitConfirm());

    this.detailsModal.addEventListener("click", (event) => {
      if (event.target === this.detailsModal) {
        this.hideDetailsPopup();
      }
    });

    this.exitConfirmModal.addEventListener("click", (event) => {
      if (event.target === this.exitConfirmModal) {
        this.hideExitConfirm();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (!this.isActive) return;

      const isExitConfirmOpen = this.exitConfirmModal.classList.contains("visible");
      const isDetailsOpen = this.detailsModal.classList.contains("visible");

      if (isExitConfirmOpen && e.key === "Escape") {
        this.hideExitConfirm();
        return;
      }

      if (isExitConfirmOpen) return;

      if (isDetailsOpen && e.key === "ArrowRight") {
        const images = this.slideshowLocation ? this.slideshowLocation.images || [] : [];
        if (images.length > 0 && this.slideshowIndex === images.length - 1) {
          this.hideDetailsPopup({ restoreCamera: false });
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
    this.ensureViewer();
    this.currentIndex = 0;
    this.score = 0;
    this.collectedItems.clear();
    this.clearedLocations.clear();
    this.visitedLocations.clear();
    this.collectiblePositions.clear();
    this.hideAchievementToast();
    this.hideExitConfirm();
    this.hideDetailsPopup({ restoreCamera: false });
    this.clearOverviewCamera();
    this.hidePinPanel();
    // Get locations from the selected character
    this.character = CHARACTERS.find(c => c.id === this.selectedCharacterId);
    this.locations = this.character ? this.character.locations : [];
    this.applyCharacterTheme();
    this.updateScore();
    this.renderProgressTrail();
    this.showLoading();
    this.whenMapReady(() => {
      this.hideLoading();
      this.flyToLocation(this.currentIndex);
    });
  }

  hide() {
    this.screenElement.classList.remove('active');
    this.hideLoading();
    if (this.viewer) {
      this.viewer.camera.cancelFlight();
      this.isFlying = false;
      this.viewer.camera.flyHome();
    }
    this.clearOverviewCamera();
    this.hideExitConfirm();
    this.hideDetailsPopup({ restoreCamera: false });
    this.hidePinPanel();
    this.hideAchievementToast();
    super.hide();
  }

  showExitConfirm() {
    this.hideDetailsPopup({ restoreCamera: false });
    this.exitConfirmModal.classList.add("visible");
    this.exitConfirmModal.setAttribute("aria-hidden", "false");
    this.exitCancelBtn.focus();
  }

  hideExitConfirm() {
    this.exitConfirmModal.classList.remove("visible");
    this.exitConfirmModal.setAttribute("aria-hidden", "true");
    if (document.activeElement === this.exitCancelBtn || document.activeElement === this.exitConfirmBtn) {
      document.activeElement.blur();
    }
  }

  confirmExit() {
    this.hideExitConfirm();
    this.onExit();
  }

  applyCharacterTheme() {
    if (!this.character) return;

    const accent = this.character.themeColor || "#ffd84d";
    if (this.gameplayUi) {
      this.gameplayUi.style.setProperty("--guide-accent", accent);
    }
    if (this.loadingScreen) {
      this.loadingScreen.style.setProperty("--guide-accent", accent);
    }
    if (this.scoreLabel) {
      this.scoreLabel.textContent = formatCollectibleLabel(this.character.collectibleName);
    }
  }

  createPinPanelContent(index) {
    const loc = this.locations[index];
    const content = cloneTemplate("tpl-pin-panel");
    content.querySelector(".panel-label").textContent = `Stop ${index + 1} of ${this.locations.length}`;
    content.querySelector(".panel-title").textContent = loc.name;
    content.querySelector(".panel-description").textContent = loc.description || "";
    content.querySelector(".pin-details-btn").addEventListener("click", (event) => {
      event.stopPropagation();
      this.showDetailsPopup(loc);
    });
    return content;
  }

  updatePanel(index) {
    this.currentIndex = index;
    this.updateNavControls();
    this.renderProgressTrail();
  }

  renderProgressTrail() {
    if (!this.progressTrailLabel || !this.progressTrailDots) return;

    const total = this.locations.length;
    if (total === 0) {
      this.progressTrailLabel.textContent = "";
      this.progressTrailDots.replaceChildren();
      return;
    }

    this.progressTrailLabel.textContent = `Stop ${this.currentIndex + 1} of ${total}`;
    this.progressTrailDots.replaceChildren();

    this.locations.forEach((loc, index) => {
      const dot = document.createElement("span");
      dot.className = "progress-dot";
      if (index < this.currentIndex) {
        dot.classList.add("done");
      } else if (index === this.currentIndex) {
        dot.classList.add("current");
      } else {
        dot.classList.add("upcoming");
      }
      if (isLocationFullyCollected(loc, this.collectedItems)) {
        dot.classList.add("collected-all");
      } else if (countCollectedCollectiblesForLocation(loc, this.collectedItems) > 0) {
        dot.classList.add("collected-some");
      } else if (index === this.currentIndex) {
        dot.classList.add("visiting-empty");
      } else if (this.visitedLocations.has(loc.name)) {
        dot.classList.add("visited-empty");
      }
      dot.setAttribute("aria-label", loc.name);
      this.progressTrailDots.appendChild(dot);
    });
  }

  pulseScorePanel() {
    if (!this.scorePanel) return;
    this.scorePanel.classList.remove("score-pulse");
    void this.scorePanel.offsetWidth;
    this.scorePanel.classList.add("score-pulse");
    this.scorePanel.addEventListener(
      "animationend",
      () => this.scorePanel.classList.remove("score-pulse"),
      { once: true }
    );
  }

  showAchievementToast(message) {
    if (!this.achievementToast) return;

    this.achievementToast.textContent = message;
    this.achievementToast.hidden = false;
    this.achievementToast.classList.add("visible");

    if (this.achievementToastTimer) {
      window.clearTimeout(this.achievementToastTimer);
    }
    this.achievementToastTimer = window.setTimeout(() => {
      this.hideAchievementToast();
    }, 3000);
  }

  hideAchievementToast() {
    if (!this.achievementToast) return;

    this.achievementToast.classList.remove("visible");
    this.achievementToast.hidden = true;
    if (this.achievementToastTimer) {
      window.clearTimeout(this.achievementToastTimer);
      this.achievementToastTimer = null;
    }
  }

  checkLocationCompletion(loc) {
    if (!loc || !isLocationFullyCollected(loc, this.collectedItems)) return;
    if (this.clearedLocations.has(loc.name)) return;

    this.clearedLocations.add(loc.name);
    const itemsName = getCharacterCollectibleName(this.character);
    this.showAchievementToast(`All ${itemsName} found at ${loc.name}!`);
  }

  buildFinalizeSummary() {
    return {
      score: this.score,
      maxScore: countCollectiblesForTour(this.locations),
      character: this.character,
      collectibleName: getCharacterCollectibleName(this.character)
    };
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
    if (
      this.isFlying ||
      this.isDetailViewActive ||
      this.detailsModal.classList.contains("visible")
    ) {
      return;
    }

    this.saveOverviewCamera();
    this.hidePinPanel();
    this.isFlying = true;
    this.setButtonsEnabled(false);

    this.flyToDetailView(loc, {
      onComplete: () => {
        this.isFlying = false;
        this.openDetailsModal(loc);
        this.isDetailViewActive = true;
      },
      onCancel: () => {
        this.isFlying = false;
        this.setButtonsEnabled(true);
        if (!this.isDetailViewActive && !this.overviewCameraState) {
          this.showPinPanel();
        }
      }
    });
  }

  openDetailsModal(loc) {
    this.slideshowLocation = loc;
    this.slideshowIndex = 0;
    this.detailsTitle.textContent = loc.name;
    this.detailsDescription.textContent = loc.description || "";
    this.updateDetailsCollectGoal(loc);
    this.renderSlideshow();
    this.detailsModal.classList.add("visible");
    this.detailsModal.setAttribute("aria-hidden", "false");
    this.detailsCloseBtn.focus();
  }

  updateDetailsCollectGoal(loc) {
    if (!this.detailsCollectGoal) return;

    const images = loc ? loc.images || [] : [];
    if (images.length === 0) {
      this.detailsCollectGoal.hidden = true;
      this.detailsCollectGoal.textContent = "";
      return;
    }

    this.detailsCollectGoal.textContent = formatCollectGoal(this.character);
    this.detailsCollectGoal.hidden = false;
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
    this.renderSlideComplete(frame);
  }

  renderSlideComplete(frame) {
    if (!frame) {
      frame = this.detailsSlideshow.querySelector(".slideshow-frame");
    }
    if (!frame) return;

    const existing = frame.querySelector(".slide-complete");
    if (existing) existing.remove();

    const loc = this.slideshowLocation;
    const images = loc ? loc.images || [] : [];
    if (images.length === 0) return;
    if (!areAllCollectiblesCollectedForSlide(loc, this.slideshowIndex, this.collectedItems)) {
      return;
    }

    const overlay = cloneTemplate("tpl-slide-complete");
    const btn = overlay.querySelector(".slide-complete-btn");
    const isLastImage = this.slideshowIndex === images.length - 1;

    if (isLastImage) {
      btn.textContent = "On to the next stop!";
      btn.addEventListener("click", () => {
        this.hideDetailsPopup({ restoreCamera: false });
        this.goNext();
      });
    } else {
      btn.textContent = "See the next picture!";
      btn.addEventListener("click", () => this.changeSlide(1));
    }

    frame.appendChild(overlay);
  }

  /** Returns an array of collectible button elements for the current slide. */
  buildCollectibles(loc) {
    const buttons = [];
    const imageUrl = getCharacterCollectibleImage(this.character);
    const singular = getCollectibleSingular(getCharacterCollectibleName(this.character));
    this.getCollectiblesForSlide(loc, this.slideshowIndex).forEach((item, itemIndex) => {
      const itemId = this.getCollectibleId(loc, this.slideshowIndex, itemIndex);
      if (this.collectedItems.has(itemId)) return;

      const btn = cloneTemplate("tpl-collectible");
      btn.style.left = `${item.x}%`;
      btn.style.top = `${item.y}%`;
      btn.setAttribute("aria-label", `Collect ${singular} for 1 point`);
      btn.querySelector("img").src = imageUrl;
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        this.collectItem(itemId, btn);
      });
      buttons.push(btn);
    });
    return buttons;
  }

  getCollectiblesForSlide(loc, slideIndex) {
    const key = `${loc.name}:${slideIndex}`;
    if (!this.collectiblePositions.has(key)) {
      this.collectiblePositions.set(key, generateBalancedPositions());
    }
    return this.collectiblePositions.get(key);
  }

  getCollectibleId(loc, imageIndex, itemIndex) {
    return makeCollectibleId(loc, imageIndex, itemIndex);
  }

  collectItem(itemId, button) {
    if (this.collectedItems.has(itemId)) return;

    this.collectedItems.add(itemId);
    this.score += 1;
    this.updateScore();
    this.showCollectFeedback(button);
    this.pulseScorePanel();
    button.classList.add("collected");
    window.setTimeout(() => button.remove(), 220);

    if (this.slideshowLocation) {
      this.checkLocationCompletion(this.slideshowLocation);
      this.renderProgressTrail();
      if (areAllCollectiblesCollectedForSlide(
        this.slideshowLocation,
        this.slideshowIndex,
        this.collectedItems
      )) {
        this.renderSlideComplete();
      }
    }
  }

  showCollectFeedback(button) {
    const layer = button.parentElement;
    if (!layer) return;

    const feedback = document.createElement("span");
    feedback.className = "collect-feedback";
    const messages = getCollectMessages();
    feedback.textContent = messages[(this.score - 1) % messages.length];
    feedback.setAttribute("aria-hidden", "true");
    feedback.style.left = button.style.left;
    feedback.style.top = button.style.top;
    layer.appendChild(feedback);
    feedback.addEventListener("animationend", () => feedback.remove(), { once: true });
  }

  updateScore() {
    this.scoreValue.textContent = String(this.score);
    if (this.character) {
      this.avatar.src = getCharacterAvatarImage(this.character);
      if (this.scoreCollectibleIcon) {
        this.scoreCollectibleIcon.src = getCharacterCollectibleImage(this.character);
      }
    }
  }

  changeSlide(delta) {
    const images = this.slideshowLocation ? this.slideshowLocation.images || [] : [];
    if (images.length === 0) return;

    this.slideshowIndex = (this.slideshowIndex + delta + images.length) % images.length;
    this.renderSlideshow();
  }

  hideDetailsPopup({ restoreCamera = true } = {}) {
    this.detailsModal.classList.remove("visible");
    this.detailsModal.setAttribute("aria-hidden", "true");
    if (document.activeElement === this.detailsCloseBtn) {
      document.activeElement.blur();
    }
    this.slideshowLocation = null;
    this.slideshowIndex = 0;

    if (!this.viewer) {
      this.clearOverviewCamera();
      return;
    }

    this.viewer.camera.cancelFlight();

    if (!restoreCamera || !this.overviewCameraState) {
      this.clearOverviewCamera();
      return;
    }

    const saved = this.overviewCameraState;
    this.isFlying = true;
    this.setButtonsEnabled(false);
    this.hidePinPanel();

    const overviewHeight = Cesium.Cartographic.fromCartesian(saved.position).height;

    this.viewer.camera.flyTo({
      destination: saved.position,
      orientation: {
        heading: saved.heading,
        pitch: saved.pitch,
        roll: saved.roll
      },
      duration: flightDuration(DETAIL_FLIGHT_DURATION_SECONDS),
      maximumHeight: overviewHeight,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      complete: () => this.finishDetailFlyBack(),
      cancel: () => this.finishDetailFlyBack()
    });
  }

  finishDetailFlyBack() {
    this.clearOverviewCamera();
    this.isFlying = false;
    this.setButtonsEnabled(true);
    this.showPinPanel();
  }

  saveOverviewCamera() {
    const camera = this.viewer.camera;
    this.overviewCameraState = {
      position: camera.position.clone(),
      heading: camera.heading,
      pitch: camera.pitch,
      roll: camera.roll
    };
  }

  clearOverviewCamera() {
    this.overviewCameraState = null;
    this.isDetailViewActive = false;
  }

  flyToDetailView(loc, { onComplete, onCancel } = {}) {
    const camera = this.viewer.camera;
    const saved = this.overviewCameraState;
    if (!saved) return;

    const target = Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, 0);
    const currentDistance = Cesium.Cartesian3.distance(camera.position, target);
    const detailRange = 10;
    const clampedRange = Math.min(detailRange, currentDistance * 0.95);

    const direction = Cesium.Cartesian3.subtract(camera.position, target, new Cesium.Cartesian3());
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
        roll: saved.roll
      },
      duration: flightDuration(DETAIL_FLIGHT_DURATION_SECONDS),
      maximumHeight: camera.positionCartographic.height,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      complete: () => {
        if (onComplete) onComplete();
      },
      cancel: () => {
        if (onCancel) onCancel();
      }
    });
  }

  getCameraOffset(loc) {
    return new Cesium.HeadingPitchRange(
      0,
      Cesium.Math.toRadians(-50),
      loc.height
    );
  }

  flyToLocationCamera(loc, { duration = FLIGHT_DURATION_SECONDS, instant = false, onComplete, onCancel } = {}) {
    const target = Cesium.Cartesian3.fromDegrees(loc.lon, loc.lat, 0);
    const boundingSphere = new Cesium.BoundingSphere(target, 1);
    const cameraOffset = this.getCameraOffset(loc);

    this.viewer.camera.cancelFlight();

    if (instant) {
      this.viewer.camera.viewBoundingSphere(boundingSphere, cameraOffset);
      this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      this.applyTargetVerticalOffset(loc.height);
      if (onComplete) onComplete();
      return;
    }

    this.viewer.camera.flyToBoundingSphere(boundingSphere, {
      duration: flightDuration(duration),
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      offset: cameraOffset,
      maximumHeight: MAX_FLIGHT_HEIGHT_METERS,
      pitchAdjustHeight: 10,
      complete: () => {
        this.applyTargetVerticalOffset(loc.height);
        if (onComplete) onComplete();
      },
      cancel: () => {
        if (onCancel) onCancel();
      }
    });
  }

  finishLocationArrival(loc, index) {
    this.currentIndex = index;
    if (loc) this.visitedLocations.add(loc.name);
    this.updatePanel(index);
    this.showPinPanel();
  }

  hidePinPanel() {
    this.pinPanelOpen = false;
    this.selectedPin = null;
    this.locationUi.style.display = "none";
    this.locationUi.style.visibility = "hidden";
  }

  showPinPanel() {
    if (!this.pin) return;

    this.pinPanelOpen = true;
    this.selectedPin = this.pin;
    this.pinPanelBody.replaceChildren(this.createPinPanelContent(this.pin.index));
    this.locationUi.style.display = "flex";
    this.locationUi.style.visibility = "visible";
    requestAnimationFrame(() => {
      if (this.pinPanelOpen) this.positionPinPanel();
    });
  }

  positionPinPanel() {
    if (!this.pinPanelOpen || !this.selectedPin) return;

    const position = this.selectedPin.position.getValue(this.viewer.clock.currentTime);
    const canvasPosition = Cesium.SceneTransforms.worldToWindowCoordinates(this.viewer.scene, position);

    if (!canvasPosition) {
      this.locationUi.style.visibility = "hidden";
      return;
    }

    const canvasRect = this.viewer.scene.canvas.getBoundingClientRect();
    const uiRect = this.locationUi.offsetParent
      ? this.locationUi.offsetParent.getBoundingClientRect()
      : { left: 0, top: 0 };
    const x = canvasPosition.x + canvasRect.left - uiRect.left;
    const y = canvasPosition.y + canvasRect.top - uiRect.top;

    this.locationUi.style.visibility = "visible";
    this.locationUi.style.left = `${x - this.locationUi.offsetWidth / 2}px`;
    this.locationUi.style.top = `${y - this.locationUi.offsetHeight - 20}px`;
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

    if (this.isDetailViewActive || this.detailsModal.classList.contains("visible")) {
      this.hideDetailsPopup({ restoreCamera: false });
    }
    this.clearOverviewCamera();
    this.setPin(loc, index);

    if (instant) {
      this.flyToLocationCamera(loc, {
        instant: true,
        onComplete: () => this.finishLocationArrival(loc, index)
      });
      return;
    }

    this.isFlying = true;
    this.setButtonsEnabled(false);
    this.hidePinPanel();

    this.flyToLocationCamera(loc, {
      onComplete: () => {
        this.isFlying = false;
        this.setButtonsEnabled(true);
        this.finishLocationArrival(loc, index);
      },
      onCancel: () => {
        this.isFlying = false;
        this.setButtonsEnabled(true);
      }
    });
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
      this.onFinalize(this.buildFinalizeSummary());
      return;
    }

    this.flyToLocation(this.currentIndex + 1);
  }

  goPrev() {
    if (!this.isActive || this.isFlying) return;
    if (this.currentIndex === 0) return;

    this.flyToLocation(this.currentIndex - 1);
  }
}

class GameController {
  gameSummary = null;
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
    this.gameplayScreen = new GameplayScreen(
      (summary) => this.onGameFinalized(summary),
      () => this.transitionTo("start")
    );
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
        this.finalScreen.show(this.gameSummary);
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
  onGameFinalized(summary) {
    this.gameSummary = summary;
    this.transitionTo("final");
  }
}

const EMBED_MIN_WIDTH = 280;
const EMBED_MIN_HEIGHT = 400;
const EMBED_PROMPT_FULLSCREEN =
  "Oh no, the window is too small for our journey! Tap the button to go full screen and begin the adventure.";
const EMBED_PROMPT_NEWTAB =
  "Oh no, the window is too small for our journey! Tap the button to open the adventure in a new tab.";

class EmbedFullscreenController {
  constructor() {
    this.btn = document.getElementById("fullscreen-btn");
    this.promptText = document.querySelector(".embed-prompt-text");

    const inIframe = window.self !== window.top;
    const fsEnabled =
      typeof document.fullscreenEnabled === "boolean"
        ? document.fullscreenEnabled
        : typeof document.webkitFullscreenEnabled === "boolean"
          ? document.webkitFullscreenEnabled
          : true;
    this.newTabMode = inIframe && !fsEnabled;

    this.btn.addEventListener("click", () => this.toggle());
    document.addEventListener("fullscreenchange", () => this.update());
    document.addEventListener("webkitfullscreenchange", () => this.update());
    window.addEventListener("resize", () => this.update());

    this.update();
  }

  isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  isViewportTooSmall() {
    return window.innerWidth < EMBED_MIN_WIDTH || window.innerHeight < EMBED_MIN_HEIGHT;
  }

  shouldConstrain() {
    return this.isViewportTooSmall() && !this.isFullscreen();
  }

  toggle() {
    if (this.newTabMode) {
      window.open(window.location.href, "_blank", "noopener");
      return;
    }

    this.toggleFullscreen();
  }

  async toggleFullscreen() {
    try {
      if (this.isFullscreen()) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } else {
        const el = document.documentElement;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        }
      }
      this.btn.removeAttribute("title");
    } catch (e) {
      console.error(e);
      this.btn.title = "Full screen was blocked. Try opening this page in a new tab.";
    }
    this.update();
  }

  update() {
    const constrained = this.shouldConstrain();
    document.body.classList.toggle("embed-constrained", constrained);

    this.btn.classList.toggle("is-newtab", this.newTabMode);

    if (this.newTabMode) {
      this.btn.setAttribute("aria-pressed", "false");
      this.btn.setAttribute("aria-label", "Open in new tab");
      this.btn.title = "Open in new tab";
      if (this.promptText) {
        this.promptText.textContent = EMBED_PROMPT_NEWTAB;
      }
      return;
    }

    const fullscreen = this.isFullscreen();
    this.btn.setAttribute("aria-pressed", String(fullscreen));
    this.btn.setAttribute(
      "aria-label",
      fullscreen ? "Exit full screen" : "Enter full screen"
    );
    this.btn.title = fullscreen ? "Exit full screen" : "Full screen";
    if (this.promptText) {
      this.promptText.textContent = EMBED_PROMPT_FULLSCREEN;
    }
  }
}

function showStartupLoading() {
  const loadingScreen = document.getElementById("loading-screen");
  if (!loadingScreen) return;
  const loadingText = loadingScreen.querySelector(".loading-text");
  if (loadingText) loadingText.textContent = "Gathering your guides...";
  loadingScreen.classList.remove("hidden");
  loadingScreen.setAttribute("aria-hidden", "false");
}

function hideStartupLoading() {
  const loadingScreen = document.getElementById("loading-screen");
  if (!loadingScreen) return;
  loadingScreen.classList.add("hidden");
  loadingScreen.setAttribute("aria-hidden", "true");
  const loadingText = loadingScreen.querySelector(".loading-text");
  if (loadingText) loadingText.textContent = "Preparing your adventure...";
}

// Initialize the application controller
document.addEventListener("DOMContentLoaded", async () => {
  new EmbedFullscreenController();
  showStartupLoading();
  try {
    await loadCharacters();
  } catch (error) {
    console.error(error);
    try {
      const cached = localStorage.getItem(CHARACTERS_CACHE_KEY);
      if (cached) {
        CHARACTERS = JSON.parse(cached);
      }
    } catch {
      // ignore cache parse errors
    }
  } finally {
    hideStartupLoading();
  }
  if (!CHARACTERS.length) {
    document.body.innerHTML =
      "<p style='padding:2rem;font-family:sans-serif'>Could not load adventure data. Please try again later.</p>";
    return;
  }
  new GameController();
});