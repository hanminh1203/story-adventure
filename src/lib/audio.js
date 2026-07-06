import whooshUrl from "../assets/sounds/WHSH_Whoosh_SNDBTS_JW_191.wav";
import pickupUrl from "../assets/sounds/678385__deltacode__item-pickup-v2.wav";
import applauseUrl from "../assets/sounds/403061__modestos1994__applause.wav";
import backgroundMusicUrl from "../assets/sounds/Lukrembo - Storybook (freetouse.com).mp3";

const SOUND_URLS = {
  whoosh: whooshUrl,
  pickup: pickupUrl,
  applause: applauseUrl,
};

const BACKGROUND_MUSIC_VOLUME = 0.25;
const BACKGROUND_MUSIC_REGISTRY_KEY = "__flythroughBackgroundMusicInstances";

const audioCache = new Map();
const settingsListeners = new Set();

let backgroundMusic = null;
let unlockHandler = null;
let backgroundMusicPlayGeneration = 0;
let preloadPromise = null;
let sfxEnabled = true;
let musicEnabled = true;
let audioSettingsSnapshot = { sfxEnabled, musicEnabled };

function notifySettingsListeners() {
  settingsListeners.forEach((listener) => listener());
}

function publishAudioSettings() {
  audioSettingsSnapshot = { sfxEnabled, musicEnabled };
  notifySettingsListeners();
}

function createAudio(url) {
  const audio = new Audio(url);
  audio.preload = "auto";
  return audio;
}

function getOrCreateAudio(url) {
  let audio = audioCache.get(url);
  if (!audio) {
    audio = createAudio(url);
    audioCache.set(url, audio);
  }
  return audio;
}

function getBackgroundMusicRegistry() {
  if (typeof window === "undefined") return null;
  if (!window[BACKGROUND_MUSIC_REGISTRY_KEY]) {
    window[BACKGROUND_MUSIC_REGISTRY_KEY] = new Set();
  }
  return window[BACKGROUND_MUSIC_REGISTRY_KEY];
}

function registerBackgroundMusicInstance(audio) {
  const registry = getBackgroundMusicRegistry();
  if (!registry) return;

  for (const instance of registry) {
    if (instance !== audio) {
      instance.pause();
    }
  }

  registry.clear();
  registry.add(audio);
}

function getBackgroundMusic() {
  if (!backgroundMusic) {
    backgroundMusic = new Audio(backgroundMusicUrl);
    backgroundMusic.loop = true;
    backgroundMusic.preload = "auto";
    backgroundMusic.volume = BACKGROUND_MUSIC_VOLUME;
    registerBackgroundMusicInstance(backgroundMusic);
  }
  return backgroundMusic;
}

function forEachBackgroundMusicInstance(callback) {
  const registry = getBackgroundMusicRegistry();
  if (registry?.size) {
    for (const instance of registry) {
      callback(instance);
    }
    return;
  }

  callback(getBackgroundMusic());
}

function waitForAudioReady(audio) {
  return new Promise((resolve) => {
    if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      resolve();
      return;
    }

    const done = () => resolve();
    audio.addEventListener("canplaythrough", done, { once: true });
    audio.addEventListener("error", done, { once: true });
    audio.load();
  });
}

export function subscribeAudioSettings(listener) {
  settingsListeners.add(listener);
  return () => settingsListeners.delete(listener);
}

export function getAudioSettings() {
  return audioSettingsSnapshot;
}

export function setSfxEnabled(enabled) {
  if (sfxEnabled === enabled) return;
  sfxEnabled = enabled;
  publishAudioSettings();
}

export function toggleSfxEnabled() {
  setSfxEnabled(!sfxEnabled);
}

export function setMusicEnabled(enabled) {
  if (musicEnabled === enabled) return;

  musicEnabled = enabled;

  if (enabled) {
    tryPlayBackgroundMusic();
  } else {
    forEachBackgroundMusicInstance((audio) => {
      audio.pause();
    });
  }

  publishAudioSettings();
}

export function toggleMusicEnabled() {
  setMusicEnabled(!musicEnabled);
}

export function preloadAudio() {
  if (preloadPromise) return preloadPromise;

  const sfxAudio = [SOUND_URLS.whoosh, SOUND_URLS.pickup, SOUND_URLS.applause].map((url) =>
    getOrCreateAudio(url)
  );

  preloadPromise = Promise.all([getBackgroundMusic(), ...sfxAudio].map(waitForAudioReady));
  return preloadPromise;
}

function playSound(url) {
  if (!sfxEnabled) return;

  const audio = getOrCreateAudio(url);
  audio.currentTime = 0;
  audio.play().catch(() => {
    /* Blocked until the user has interacted with the page. */
  });
}

function isAudioControlsTarget(event) {
  return Boolean(event.target?.closest?.(".audio-controls"));
}

function attachBackgroundMusicUnlockListener() {
  if (unlockHandler) return;

  unlockHandler = (event) => {
    if (isAudioControlsTarget(event)) return;
    detachBackgroundMusicUnlockListener();
    tryPlayBackgroundMusic();
  };

  document.addEventListener("pointerdown", unlockHandler);
  document.addEventListener("keydown", unlockHandler);
}

function detachBackgroundMusicUnlockListener() {
  if (!unlockHandler) return;
  document.removeEventListener("pointerdown", unlockHandler);
  document.removeEventListener("keydown", unlockHandler);
  unlockHandler = null;
}

function tryPlayBackgroundMusic() {
  if (!musicEnabled) return;

  const audio = getBackgroundMusic();
  if (!audio.paused) return;

  const generation = ++backgroundMusicPlayGeneration;
  audio.play().then(() => {
    if (generation !== backgroundMusicPlayGeneration) {
      audio.pause();
    }
  }).catch(() => {
    if (generation === backgroundMusicPlayGeneration) {
      attachBackgroundMusicUnlockListener();
    }
  });
}

export function startBackgroundMusic() {
  tryPlayBackgroundMusic();
}

export function stopBackgroundMusic() {
  backgroundMusicPlayGeneration++;
  detachBackgroundMusicUnlockListener();

  forEachBackgroundMusicInstance((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

export function playFlightWhoosh() {
  playSound(SOUND_URLS.whoosh);
}

export function playCollectPickup() {
  playSound(SOUND_URLS.pickup);
}

export function playApplause() {
  playSound(SOUND_URLS.applause);
}
