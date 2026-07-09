import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUDIO_SETTINGS_KEY } from "../constants";

async function loadAudioModule() {
  vi.resetModules();
  return import("./audio");
}

describe("audio helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    delete window.__flythroughBackgroundMusicInstances;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads persisted settings and notifies subscribers on change", async () => {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify({ sfxEnabled: false, musicEnabled: true }));
    const audio = await loadAudioModule();
    const listener = vi.fn();
    const unsubscribe = audio.subscribeAudioSettings(listener);

    expect(audio.getAudioSettings()).toEqual({ sfxEnabled: false, musicEnabled: true });

    audio.toggleSfxEnabled();

    expect(audio.getAudioSettings()).toEqual({ sfxEnabled: true, musicEnabled: true });
    expect(listener).toHaveBeenCalledOnce();
    expect(JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY))).toEqual({
      sfxEnabled: true,
      musicEnabled: true,
    });

    unsubscribe();
  });

  it("preloads audio only once and tolerates failures", async () => {
    const audio = await loadAudioModule();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const created = [];
    const originalAudio = globalThis.Audio;

    globalThis.Audio = class extends originalAudio {
      constructor(src) {
        super(src);
        created.push(this);
        this.readyState = 0;
      }

      load() {
        if (this.src.includes("coin-1")) {
          this.dispatch("error");
        } else {
          this.dispatch("canplaythrough");
        }
      }
    };

    const first = audio.preloadAudio();
    const second = audio.preloadAudio();
    await first;

    expect(second).toBe(first);
    expect(created.length).toBeGreaterThan(1);
    expect(warn).toHaveBeenCalledOnce();
  });

  it("starts and stops background music", async () => {
    const audio = await loadAudioModule();

    await audio.preloadAudio();
    audio.startBackgroundMusic();

    const [instance] = [...window.__flythroughBackgroundMusicInstances];
    expect(instance.paused).toBe(false);

    audio.stopBackgroundMusic();
    expect(instance.paused).toBe(true);
    expect(instance.currentTime).toBe(0);
  });

  it("falls back to unlock listeners when autoplay is blocked", async () => {
    const originalAudio = globalThis.Audio;

    globalThis.Audio = class extends originalAudio {
      play() {
        this.paused = true;
        return Promise.reject(new Error("blocked"));
      }
    };
    const audio = await loadAudioModule();

    const addEventListener = vi.spyOn(document, "addEventListener");
    audio.startBackgroundMusic();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(addEventListener).toHaveBeenCalledWith("pointerdown", expect.any(Function));
    expect(addEventListener).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("plays button sounds only for visible enabled buttons", async () => {
    const audio = await loadAudioModule();
    const playSpy = vi.spyOn(globalThis.Audio.prototype, "play");
    const button = document.createElement("button");
    document.body.appendChild(button);

    audio.attachButtonClickSounds();
    button.click();
    expect(playSpy).toHaveBeenCalled();

    playSpy.mockClear();
    button.disabled = true;
    button.click();
    expect(playSpy).not.toHaveBeenCalled();

    audio.detachButtonClickSounds();
  });

  it("stops playing sound effects when sfx is disabled", async () => {
    const audio = await loadAudioModule();
    const playSpy = vi.spyOn(globalThis.Audio.prototype, "play");

    audio.setSfxEnabled(false);
    audio.playApplause();
    audio.playCollectPickup();
    audio.playFlightWhoosh();

    expect(playSpy).not.toHaveBeenCalled();
  });

  it("pauses music immediately when disabled", async () => {
    const audio = await loadAudioModule();

    await audio.preloadAudio();
    audio.startBackgroundMusic();
    audio.setMusicEnabled(false);

    const [instance] = [...window.__flythroughBackgroundMusicInstances];
    expect(instance.paused).toBe(true);
  });
});
