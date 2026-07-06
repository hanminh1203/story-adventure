import { useSyncExternalStore } from "react";
import { UI_TEXT } from "../uiText";
import { getAudioSettings, subscribeAudioSettings, toggleSfxEnabled } from "../lib/audio";

function SfxIcon({ muted }) {
  if (muted) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4V5Z" />
        <path d="m22 9-6 6" />
        <path d="m16 9 6 6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export default function AudioControls() {
  const { sfxEnabled } = useSyncExternalStore(
    subscribeAudioSettings,
    getAudioSettings,
    getAudioSettings
  );

  return (
    <div className="audio-controls">
      <button
        type="button"
        className="btn-glass audio-toggle-btn"
        aria-label={sfxEnabled ? UI_TEXT.AUDIO_SFX_ON_ARIA_LABEL : UI_TEXT.AUDIO_SFX_OFF_ARIA_LABEL}
        aria-pressed={String(sfxEnabled)}
        title={sfxEnabled ? UI_TEXT.AUDIO_SFX_ON_TITLE : UI_TEXT.AUDIO_SFX_OFF_TITLE}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={toggleSfxEnabled}
      >
        <span className="audio-toggle-icon" aria-hidden="true">
          <SfxIcon muted={!sfxEnabled} />
        </span>
      </button>
    </div>
  );
}
