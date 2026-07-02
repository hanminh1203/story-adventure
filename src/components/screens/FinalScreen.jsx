import { useEffect, useRef } from "react";
import { UI_TEXT } from "../../uiText";
import { formatTemplate } from "../../lib/format";
import { getStarRating } from "../../lib/collectibles";
import { getCharacterCollectibleName } from "../../lib/collectibles";
import { prefersReducedMotion } from "../../lib/motion";
import StorybookDecor from "../StorybookDecor";

export default function FinalScreen({ active, summary, onRestart }) {
  const restartBtnRef = useRef(null);
  const confettiHideTimerRef = useRef(null);
  const confettiLayerRef = useRef(null);
  const finalScoreRef = useRef(null);

  useEffect(() => {
    if (!active || !summary) return;

    const { score, maxScore, character, collectibleName } = summary;
    const itemsName = collectibleName || getCharacterCollectibleName(character);
    const rating = getStarRating(score, maxScore);

    if (finalScoreRef.current) {
      finalScoreRef.current.classList.remove("final-score-pop");
      void finalScoreRef.current.offsetWidth;
      finalScoreRef.current.classList.add("final-score-pop");
    }

    if (!prefersReducedMotion() && confettiLayerRef.current) {
      confettiLayerRef.current.replaceChildren();
      const colors = ["#ffd84d", "#6fa8ff", "#ff9a8b", "#6dd47e", "#ffe679"];
      for (let i = 0; i < 36; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.backgroundColor = colors[i % colors.length];
        piece.style.animationDelay = `${Math.random() * 0.8}s`;
        piece.style.animationDuration = `${2.2 + Math.random() * 1.2}s`;
        confettiLayerRef.current.appendChild(piece);
      }
    }

    restartBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Enter") onRestart();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (confettiHideTimerRef.current) {
        window.clearTimeout(confettiHideTimerRef.current);
      }
      if (confettiLayerRef.current) {
        confettiLayerRef.current.replaceChildren();
      }
      if (finalScoreRef.current) {
        finalScoreRef.current.classList.remove("final-score-pop");
      }
      if (document.activeElement === restartBtnRef.current) {
        restartBtnRef.current?.blur();
      }
    };
  }, [active, summary, onRestart]);

  if (!summary) return null;

  const { score, maxScore, character, collectibleName } = summary;
  const itemsName = collectibleName || getCharacterCollectibleName(character);
  const rating = getStarRating(score, maxScore);

  let itemsSummary = formatTemplate(UI_TEXT.FINAL_ITEMS_SUMMARY_TEMPLATE, {
    score,
    maxScore,
    itemsName,
  });
  if (maxScore > 0 && score === maxScore) {
    itemsSummary += UI_TEXT.FINAL_ITEMS_SUMMARY_SUFFIX_SUPER_EXPLORER;
  }

  const characterName = character ? character.name : UI_TEXT.FINAL_CHARACTER_FALLBACK_NAME;
  const guideAccent = character?.themeColor;

  return (
    <div
      id="final-screen"
      className={`game-screen static-background${active ? " active" : " hidden"}`}
      aria-hidden={active ? "false" : "true"}
      style={guideAccent ? { "--guide-accent": guideAccent } : undefined}
    >
      <div className="game-screen-overlay" />
      <div className="container game-screen-content final-content storybook-screen">
        <StorybookDecor />
        <div className="game-kicker">{UI_TEXT.FINAL_SCREEN_KICKER}</div>
        <div className="final-stars" aria-label="Star rating">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={i <= rating ? "final-star filled" : "final-star"}
              aria-hidden="true"
            >
              {"\u2605"}
            </span>
          ))}
        </div>
        <h1 id="final-score" ref={finalScoreRef}>
          {score}
        </h1>
        <p id="final-collect-summary">{itemsSummary}</p>
        <p id="final-character-message">
          {formatTemplate(UI_TEXT.FINAL_CHARACTER_PROUD_TEMPLATE, { characterName })}
        </p>
        <div ref={confettiLayerRef} id="confetti-layer" className="confetti-layer" aria-hidden="true" />
        <button
          ref={restartBtnRef}
          id="restart-btn"
          className="btn-accent game-screen-btn"
          type="button"
          onClick={onRestart}
        >
          {UI_TEXT.RESTART_BTN_TEXT}
        </button>
      </div>
    </div>
  );
}
