import LoadingProgressBar from "./LoadingProgressBar";
import { UI_TEXT } from "../uiText";

export default function LoadingScreen({
  visible,
  text = UI_TEXT.MAP_LOADING_TEXT,
  guideAccent,
  progress,
}) {
  return (
    <div
      className={`loading-screen${visible ? "" : " hidden"}`}
      aria-hidden={visible ? "false" : "true"}
      role="status"
      style={guideAccent ? { "--guide-accent": guideAccent } : undefined}
    >
      <div className="game-screen-overlay" />
      <div className="loading-content">
        <LoadingProgressBar progress={progress} />
        <p className="loading-text">{text}</p>
      </div>
    </div>
  );
}
