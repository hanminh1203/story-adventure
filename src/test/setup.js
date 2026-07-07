import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 0);
}

if (!globalThis.cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  });
}

if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
}

class MockAudio {
  static instances = [];

  constructor(src = "") {
    this.src = src;
    this.preload = "";
    this.loop = false;
    this.volume = 1;
    this.currentTime = 0;
    this.paused = true;
    this.readyState = HTMLMediaElement.HAVE_ENOUGH_DATA;
    this._listeners = new Map();
    MockAudio.instances.push(this);
  }

  addEventListener(type, listener) {
    const listeners = this._listeners.get(type) || new Set();
    listeners.add(listener);
    this._listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this._listeners.get(type)?.delete(listener);
  }

  dispatch(type) {
    this._listeners.get(type)?.forEach((listener) => listener());
  }

  load() {}

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }
}

globalThis.Audio = MockAudio;
