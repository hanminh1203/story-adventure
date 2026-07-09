import { getYouTubeVideoId } from "../lib/media";
import { useYouTubeIntroPlayer } from "../hooks/useYouTubeIntroPlayer";
import { UI_TEXT } from "../uiText";

export default function MapIntroScreen({
  visible,
  character,
  mapReady,
  mapReadyRef,
  guideAccent,
  onSkip,
  onVideoEnded,
}) {
  const videoId = getYouTubeVideoId(character);
  const hasVideo = Boolean(videoId);
  const { containerRef } = useYouTubeIntroPlayer({
    videoId,
    active: visible && hasVideo,
    mapReadyRef,
    onEnded: onVideoEnded,
  });

  return (
    <div
      className={`loading-screen map-intro-screen${visible ? "" : " hidden"}`}
      aria-hidden={visible ? "false" : "true"}
      role="status"
      style={guideAccent ? { "--guide-accent": guideAccent } : undefined}
    >
      <div className="game-screen-overlay" />
      <div className="loading-content map-intro-content">
        {hasVideo ? (
          <>
            <div className="map-intro-video">
              <div ref={containerRef} className="map-intro-video-player" />
            </div>
            {mapReady ? (
              <button
                type="button"
                className="btn-accent map-intro-skip-btn"
                onClick={onSkip}
              >
                {UI_TEXT.MAP_INTRO_SKIP_BTN_TEXT}
              </button>
            ) : (
              <>
                <div className="loading-spinner" aria-hidden="true" />
                <p className="loading-text">{UI_TEXT.MAP_LOADING_TEXT}</p>
              </>
            )}
          </>
        ) : (
          <>
            <div className="loading-spinner" aria-hidden="true" />
            <p className="loading-text">{UI_TEXT.MAP_LOADING_TEXT}</p>
          </>
        )}
      </div>
    </div>
  );
}
