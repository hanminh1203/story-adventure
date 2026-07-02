import { useCallback, useEffect, useState } from "react";
import { EMBED_MIN_WIDTH, EMBED_MIN_HEIGHT } from "../constants";
import { UI_TEXT } from "../uiText";

export default function EmbedPrompt() {
  const [newTabMode, setNewTabMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [constrained, setConstrained] = useState(false);
  const [btnTitle, setBtnTitle] = useState("");
  const [promptText, setPromptText] = useState(UI_TEXT.EMBED_PROMPT_FULLSCREEN);

  const checkFullscreen = useCallback(() => {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }, []);

  const isViewportTooSmall = useCallback(() => {
    return window.innerWidth < EMBED_MIN_WIDTH || window.innerHeight < EMBED_MIN_HEIGHT;
  }, []);

  const update = useCallback(() => {
    const fullscreen = checkFullscreen();
    const shouldConstrain = isViewportTooSmall() && !fullscreen;
    setIsFullscreen(fullscreen);
    setConstrained(shouldConstrain);
    document.body.classList.toggle("embed-constrained", shouldConstrain);

    if (newTabMode) {
      setBtnTitle(UI_TEXT.EMBED_BTN_OPEN_NEW_TAB_TITLE);
      setPromptText(UI_TEXT.EMBED_PROMPT_NEWTAB);
      return;
    }

    setBtnTitle(
      fullscreen ? UI_TEXT.EMBED_BTN_TITLE_EXIT_FULLSCREEN : UI_TEXT.EMBED_BTN_TITLE_ENTER_FULLSCREEN
    );
    setPromptText(UI_TEXT.EMBED_PROMPT_FULLSCREEN);
  }, [checkFullscreen, isViewportTooSmall, newTabMode]);

  useEffect(() => {
    const inIframe = window.self !== window.top;
    const fsEnabled =
      typeof document.fullscreenEnabled === "boolean"
        ? document.fullscreenEnabled
        : typeof document.webkitFullscreenEnabled === "boolean"
          ? document.webkitFullscreenEnabled
          : true;
    setNewTabMode(inIframe && !fsEnabled);
  }, []);

  useEffect(() => {
    update();
    document.addEventListener("fullscreenchange", update);
    document.addEventListener("webkitfullscreenchange", update);
    window.addEventListener("resize", update);
    return () => {
      document.removeEventListener("fullscreenchange", update);
      document.removeEventListener("webkitfullscreenchange", update);
      window.removeEventListener("resize", update);
      document.body.classList.remove("embed-constrained");
    };
  }, [update]);

  const toggle = async () => {
    if (newTabMode) {
      window.open(window.location.href, "_blank", "noopener");
      return;
    }

    try {
      if (checkFullscreen()) {
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
      setBtnTitle("");
    } catch (e) {
      console.error(e);
      setBtnTitle(UI_TEXT.EMBED_FULLSCREEN_TITLE_BLOCKED);
    }
    update();
  };

  return (
    <div id="embed-prompt" className="embed-prompt">
      <p className="embed-prompt-text">{promptText}</p>
      <button
        id="fullscreen-btn"
        className={`btn-glass fullscreen-btn${newTabMode ? " is-newtab" : ""}`}
        type="button"
        aria-label={
          newTabMode
            ? UI_TEXT.EMBED_BTN_OPEN_NEW_TAB_ARIA_LABEL
            : isFullscreen
              ? UI_TEXT.EMBED_BTN_ARIA_LABEL_EXIT_FULLSCREEN
              : UI_TEXT.EMBED_BTN_ARIA_LABEL_ENTER_FULLSCREEN
        }
        aria-pressed={newTabMode ? "false" : String(isFullscreen)}
        title={btnTitle}
        onClick={toggle}
      >
        <span className="fullscreen-icon" aria-hidden="true">
          <svg
            className="fullscreen-icon-enter"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
          <svg
            className="fullscreen-icon-exit"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
          <svg
            className="fullscreen-icon-newtab"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
          </svg>
        </span>
      </button>
    </div>
  );
}
