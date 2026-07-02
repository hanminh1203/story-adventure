import { UI_TEXT } from "../uiText";

export default function LoadingScreen({
  visible,
  text = UI_TEXT.MAP_LOADING_TEXT,
  guideAccent,
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
        <div className="loading-spinner" aria-hidden="true" />
        <p className="loading-text">{text}</p>
      </div>
    </div>
  );
}
