import { useEffect, useRef } from "react";
import { UI_TEXT } from "../../uiText";

export default function StartScreen({ active, onStart }) {
  const startBtnRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter") onStart();
    };

    document.addEventListener("keydown", handleKeyDown);
    startBtnRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (document.activeElement === startBtnRef.current) {
        startBtnRef.current?.blur();
      }
    };
  }, [active, onStart]);

  return (
    <div
      id="start-screen"
      className={`game-screen static-background${active ? " active" : " hidden"}`}
      aria-hidden={active ? "false" : "true"}
    >
      <div className="game-screen-overlay" />
      <div className="container game-screen-content start-content storybook-screen">
        <div className="storybook-decor" aria-hidden="true">
          <span className="sparkle sparkle-1" />
          <span className="sparkle sparkle-2" />
          <span className="sparkle sparkle-3" />
          <span className="sparkle sparkle-4" />
          <span className="sparkle sparkle-5" />
          <span className="sparkle sparkle-6" />
        </div>
        <h1>{UI_TEXT.START_SCREEN_TITLE}</h1>
        <p>{UI_TEXT.START_SCREEN_DESCRIPTION}</p>
        <button
          ref={startBtnRef}
          id="start-btn"
          className="btn-accent game-screen-btn"
          type="button"
          onClick={onStart}
        >
          {UI_TEXT.START_BUTTON_TEXT}
        </button>
      </div>
    </div>
  );
}
