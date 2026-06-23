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

// Little Red Riding Hood - the game's guide character. Original art using
// simple flat shapes (public-domain fairy tale character, not any studio's
// specific design). Swap this constant out if you replace her with custom
// artwork later.
const GUIDE_AVATAR_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Cellipse cx='48' cy='62' rx='30' ry='30' fill='%23c93b3b'/%3E%3Cpath d='M48 12c15 0 26 15 26 30 0 5-2 9-6 11-4-11-13-18-20-18s-16 7-20 18c-4-2-6-6-6-11 0-15 11-30 26-30z' fill='%23c93b3b'/%3E%3Cellipse cx='48' cy='46' rx='17' ry='19' fill='%23f6cfa0'/%3E%3Cpath d='M32 35c3-7 9-10 16-10s13 3 16 10c-6-3-11-4-16-4s-10 1-16 4z' fill='%237a4b2e'/%3E%3Ccircle cx='41' cy='47' r='3' fill='%232b2018'/%3E%3Ccircle cx='55' cy='47' r='3' fill='%232b2018'/%3E%3Ccircle cx='38' cy='52' r='3' fill='%23e8a679' opacity='0.6'/%3E%3Ccircle cx='58' cy='52' r='3' fill='%23e8a679' opacity='0.6'/%3E%3Cpath d='M41 56c3 3 11 3 14 0' stroke='%237a4b2e' stroke-width='2.5' stroke-linecap='round' fill='none'/%3E%3C/svg%3E";

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

class GuideCharacter {
  constructor() {
    this.panel = document.getElementById("guide-panel");
    this.avatarEl = document.getElementById("guide-avatar");
    this.nameEl = document.getElementById("guide-name");
    this.titleEl = document.getElementById("guide-title");
    this.textEl = document.getElementById("guide-text");
    this.questionWrap = document.getElementById("guide-question-wrap");
    this.questionEl = document.getElementById("guide-question");
    this.optionsEl = document.getElementById("guide-options");
    this.feedbackEl = document.getElementById("guide-feedback");
    this.continueBtn = document.getElementById("guide-continue-btn");

    this.completedLessons = new Set();
    this.currentLoc = null;
    this.onLessonCompleted = null;

    const avatarImg = document.createElement("img");
    avatarImg.src = GUIDE_AVATAR_URL;
    avatarImg.alt = `${GUIDE.name} ${GUIDE.species}`;
    this.avatarEl.replaceChildren(avatarImg);
    this.nameEl.textContent = `${GUIDE.name} ${GUIDE.species}`;

    this.continueBtn.addEventListener("click", () => this.collapse());
    this.avatarEl.addEventListener("click", () => this.expand());
  }

  reset() {
    this.completedLessons.clear();
    this.currentLoc = null;
    this.panel.classList.remove("visible", "collapsed");
  }

  showForLocation(loc) {
    this.currentLoc = loc;
    const lesson = loc.lesson;

    this.panel.classList.add("visible");
    this.panel.classList.remove("collapsed");
    this.feedbackEl.textContent = "";
    this.feedbackEl.className = "guide-feedback";

    if (!lesson) {
      this.titleEl.textContent = loc.name;
      this.textEl.textContent = "Let's explore this stop together!";
      this.questionWrap.style.display = "none";
      return;
    }

    this.titleEl.textContent = lesson.title;
    this.textEl.textContent = lesson.text;
    this.questionWrap.style.display = "block";
    this.questionEl.textContent = lesson.question;
    this.renderOptions(loc, lesson);
  }

  renderOptions(loc, lesson) {
    this.optionsEl.replaceChildren();

    lesson.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "guide-option-btn";
      btn.textContent = opt.text;
      btn.addEventListener("click", () => this.selectOption(loc, lesson, opt));
      this.optionsEl.appendChild(btn);
    });

    if (this.completedLessons.has(loc.name)) {
      this.feedbackEl.textContent = "You already got this one - tap Got it! to keep going, or try again below.";
      this.feedbackEl.classList.add("visible", "info");
    }
  }

  selectOption(loc, lesson, opt) {
    this.feedbackEl.textContent = opt.feedback;
    this.feedbackEl.classList.remove("info");
    this.feedbackEl.classList.add("visible", opt.correct ? "correct" : "incorrect");

    Array.from(this.optionsEl.children).forEach((btn) => {
      btn.disabled = true;
    });

    if (opt.correct && !this.completedLessons.has(loc.name)) {
      this.completedLessons.add(loc.name);
      if (this.onLessonCompleted) this.onLessonCompleted(this.completedLessons.size);
    }
  }

  collapse() {
    this.panel.classList.add("collapsed");
  }

  expand() {
    this.panel.classList.remove("collapsed");
  }

  hide() {
    this.panel.classList.remove("visible", "collapsed");
  }
}

class GuideCharacter {
  constructor() {
    this.panel = document.getElementById("guide-panel");
    this.avatarEl = document.getElementById("guide-avatar");
    this.nameEl = document.getElementById("guide-name");
    this.titleEl = document.getElementById("guide-title");
    this.textEl = document.getElementById("guide-text");
    this.questionWrap = document.getElementById("guide-question-wrap");
    this.questionEl = document.getElementById("guide-question");
    this.optionsEl = document.getElementById("guide-options");
    this.feedbackEl = document.getElementById("guide-feedback");
    this.continueBtn = document.getElementById("guide-continue-btn");

    this.completedLessons = new Set();
    this.currentLoc = null;
    this.onLessonCompleted = null;

    const avatarImg = document.createElement("img");
    avatarImg.src = GUIDE_AVATAR_URL;
    avatarImg.alt = `${GUIDE.name} ${GUIDE.species}`;
    this.avatarEl.replaceChildren(avatarImg);
    this.nameEl.textContent = `${GUIDE.name} ${GUIDE.species}`;

    this.continueBtn.addEventListener("click", () => this.collapse());
    this.avatarEl.addEventListener("click", () => this.expand());
  }

  reset() {
    this.completedLessons.clear();
    this.currentLoc = null;
    this.panel.classList.remove("visible", "collapsed");
  }

  showForLocation(loc) {
    this.currentLoc = loc;
    const lesson = loc.lesson;

    this.panel.classList.add("visible");
    this.panel.classList.remove("collapsed");
    this.feedbackEl.textContent = "";
    this.feedbackEl.className = "guide-feedback";

    if (!lesson) {
      this.titleEl.textContent = loc.name;
      this.textEl.textContent = "Let's explore this stop together!";
      this.questionWrap.style.display = "none";
      return;
    }

    this.titleEl.textContent = lesson.title;
    this.textEl.textContent = lesson.text;
    this.questionWrap.style.display = "block";
    this.questionEl.textContent = lesson.question;
    this.renderOptions(loc, lesson);
  }

  renderOptions(loc, lesson) {
    this.optionsEl.replaceChildren();

    lesson.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "guide-option-btn";
      btn.textContent = opt.text;
      btn.addEventListener("click", () => this.selectOption(loc, lesson, opt));
      this.optionsEl.appendChild(btn);
    });

    if (this.completedLessons.has(loc.name)) {
      this.feedbackEl.textContent = "You already got this one - tap Got it! to keep going, or try again below.";
      this.feedbackEl.classList.add("visible", "info");
    }
  }

  selectOption(loc, lesson, opt) {
    this.feedbackEl.textContent = opt.feedback;
    this.feedbackEl.classList.remove("info");
    this.feedbackEl.classList.add("visible", opt.correct ? "correct" : "incorrect");

    Array.from(this.optionsEl.children).forEach((btn) => {
      btn.disabled = true;
    });

    if (opt.correct && !this.completedLessons.has(loc.name)) {
      this.completedLessons.add(loc.name);
      if (this.onLessonCompleted) this.onLessonCompleted(this.completedLessons.size);
    }
  }

  collapse() {
    this.panel.classList.add("collapsed");
  }

  expand() {
    this.panel.classList.remove("collapsed");
  }

  hide() {
    this.panel.classList.remove("visible", "collapsed");
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

    this.renderCharacters();
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
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;

      videoContainer.appendChild(iframe);

      const nameDiv = document.createElement("div");
      nameDiv.className = "character-name";
      nameDiv.textContent = character.name;

      const titleDiv = document.createElement("div");
      titleDiv.className = "character-title";
      titleDiv.textContent = character.title;

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
      card.appendChild(nameDiv);
      card.appendChild(titleDiv);
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
    this.selectedCharacter = null;

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
    this.lessonsValue = document.getElementById("lessons-value");
    this.prevBtn = document.getElementById("prev-btn");
    this.nextBtn = document.getElementById("next-btn");
    this.pinPanel = document.getElementById("pin-panel");
    this.detailsModal = document.getElementById("details-modal");
    this.detailsCloseBtn = document.getElementById("details-close-btn");
    this.detailsTitle = document.getElementById("details-title");
    this.detailsDescription = document.getElementById("details-description");
    this.detailsSlideshow = document.getElementById("details-slideshow");

    this.guide = new GuideCharacter();
    this.guide.onLessonCompleted = (count) => this.updateLessonsCount(count);

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
    this.guide.reset();
    // Get locations from the selected character
    const character = CHARACTERS.find(c => c.id === this.selectedCharacter);
    this.locations = character ? character.locations : [];
    this.updateScore();
    this.updateLessonsCount(0);
    this.flyToLocation(this.currentIndex);
  }

  hide() {
    this.screenElement.classList.remove('active');
    this.viewer.camera.flyHome();
    this.hideDetailsPopup();
    this.hidePinPanel();
    this.guide.hide();
  }

  updateLessonsCount(count) {
    this.lessonsValue.textContent = `${count}/${LOCATIONS.length}`;
  }

  createPinPanelContent(index) {
    const loc = this.locations[index];
    const content = document.createElement("div");
    content.appendChild(this.createElementWithText("div", `Location ${index + 1} of ${this.locations.length}`, "panel-label"));
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
    const loc = this.locations[index];
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
      this.guide.showForLocation(loc);
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
        this.guide.showForLocation(loc);
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
        this.gameplayScreen.selectedCharacter = this.selectedCharacter;
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