import { useCallback, useEffect, useRef } from "react";
import StorybookDecor from "../StorybookDecor";
import { formatTemplate } from "../../lib/format";
import { prefersReducedMotion } from "../../lib/motion";
import { UI_TEXT } from "../../uiText";

function HowToStepCard({ step, index }) {
  return (
    <li className="how-to-step">
      <div className="how-to-screenshot">
        {step.image ? (
          <img
            className="how-to-screenshot-image"
            src={step.image}
            alt={formatTemplate(UI_TEXT.HOW_TO_PLAY_SCREENSHOT_ALT_TEMPLATE, {
              number: step.screenshotNumber,
            })}
          />
        ) : (
          <div
            className="how-to-screenshot-placeholder"
            aria-label={formatTemplate(UI_TEXT.HOW_TO_PLAY_SCREENSHOT_ALT_TEMPLATE, {
              number: step.screenshotNumber,
            })}
          >
            <span aria-hidden="true">{step.screenshotNumber}</span>
          </div>
        )}
      </div>
      <div className="how-to-step-text">
        <h2 className="how-to-step-title">
          <span className="how-to-step-number" aria-hidden="true">
            {index + 1}
          </span>
          {step.title}
        </h2>
        <p>{step.description}</p>
      </div>
    </li>
  );
}

export default function HowToPlayScreen({ active, onContinue, onGoBack }) {
  const continueBtnRef = useRef(null);
  const stepsRef = useRef(null);

  const steps = UI_TEXT.HOW_TO_PLAY_STEPS;

  const getCarouselSteps = useCallback(() => {
    if (!stepsRef.current) return [];
    return [...stepsRef.current.querySelectorAll(".how-to-step")];
  }, []);

  const getCenteredCarouselStepIndex = useCallback(() => {
    const cards = getCarouselSteps();
    if (cards.length === 0) return 0;

    const list = stepsRef.current;
    const center = list.scrollLeft + list.clientWidth / 2;
    let bestIndex = 0;
    let bestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }, [getCarouselSteps]);

  const scrollToCarouselStep = useCallback(
    (stepIndex, behavior = "smooth") => {
      const cards = getCarouselSteps();
      const card = cards[stepIndex];
      if (!card) return;

      const resolvedBehavior =
        behavior === "instant" || prefersReducedMotion() ? "auto" : "smooth";
      card.scrollIntoView({
        behavior: resolvedBehavior,
        inline: "center",
        block: "nearest",
      });
    },
    [getCarouselSteps]
  );

  const resetCarouselPosition = useCallback(() => {
    if (steps.length === 0) return;
    scrollToCarouselStep(0, "instant");
  }, [steps.length, scrollToCarouselStep]);

  const updateEdgePadding = useCallback(() => {
    const list = stepsRef.current;
    const card = list?.querySelector(".how-to-step");
    if (!list || !card) return;

    const padding = Math.max(0, (list.clientWidth - card.offsetWidth) / 2);
    list.style.setProperty("--how-to-edge-padding", `${padding}px`);
  }, []);

  const scrollSteps = useCallback(
    (direction) => {
      const cards = getCarouselSteps();
      const centeredIndex = getCenteredCarouselStepIndex();
      const targetIndex = centeredIndex + direction;
      if (targetIndex < 0 || targetIndex >= cards.length) return;

      scrollToCarouselStep(targetIndex);
    },
    [getCarouselSteps, getCenteredCarouselStepIndex, scrollToCarouselStep]
  );

  useEffect(() => {
    if (!active) return;

    const list = stepsRef.current;
    if (!list) return;

    requestAnimationFrame(() => {
      updateEdgePadding();
      resetCarouselPosition();
    });

    const observer = new ResizeObserver(() => {
      const index = getCenteredCarouselStepIndex();
      updateEdgePadding();
      scrollToCarouselStep(index, "instant");
    });
    observer.observe(list);

    const card = list.querySelector(".how-to-step");
    if (card) observer.observe(card);

    const handleKeyDown = (e) => {
      if (e.key === "Enter") onContinue();
    };

    document.addEventListener("keydown", handleKeyDown);
    continueBtnRef.current?.focus();

    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", handleKeyDown);
      if (document.activeElement === continueBtnRef.current) {
        continueBtnRef.current?.blur();
      }
    };
  }, [
    active,
    onContinue,
    resetCarouselPosition,
    updateEdgePadding,
    getCenteredCarouselStepIndex,
    scrollToCarouselStep,
  ]);

  return (
    <div
      id="how-to-play-screen"
      className={`game-screen static-background${active ? " active" : " hidden"}`}
      aria-hidden={active ? "false" : "true"}
    >
      <div className="game-screen-overlay" />
      <div className="game-screen-ui character-screen-ui">
        <button
          id="how-to-go-back-btn"
          className="btn-glass go-back-btn"
          type="button"
          onClick={onGoBack}
        >
          &#8592; <span className="go-back-label">{UI_TEXT.GO_BACK_LABEL}</span>
        </button>
      </div>
      <div className="container game-screen-content how-to-content storybook-screen">
        <StorybookDecor />
        <h1>{UI_TEXT.HOW_TO_PLAY_TITLE}</h1>
        <div className="how-to-carousel" id="how-to-carousel">
          <button
            type="button"
            className="carousel-arrow carousel-arrow-prev how-to-carousel-arrow"
            id="how-to-prev-btn"
            aria-label={UI_TEXT.HOW_TO_PLAY_PREV_STEP_ARIA_LABEL}
            onClick={() => scrollSteps(-1)}
          >
            &#8249;
          </button>
          <ol className="how-to-steps" id="how-to-steps" ref={stepsRef}>
            {steps.map((step, index) => (
              <HowToStepCard key={step.title} step={step} index={index} />
            ))}
          </ol>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-next how-to-carousel-arrow"
            id="how-to-next-btn"
            aria-label={UI_TEXT.HOW_TO_PLAY_NEXT_STEP_ARIA_LABEL}
            onClick={() => scrollSteps(1)}
          >
            &#8250;
          </button>
        </div>
        <div className="how-to-footer">
          <button
            ref={continueBtnRef}
            id="how-to-continue-btn"
            className="btn-accent game-screen-btn"
            type="button"
            onClick={onContinue}
          >
            {UI_TEXT.HOW_TO_PLAY_BEGIN_BTN_TEXT}
          </button>
        </div>
      </div>
    </div>
  );
}
