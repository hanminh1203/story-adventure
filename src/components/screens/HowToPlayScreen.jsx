import { useCallback, useEffect, useRef, useState } from "react";
import { useCenteredCarousel } from "../../hooks/useCenteredCarousel";
import StorybookDecor from "../StorybookDecor";
import { formatTemplate } from "../../lib/format";
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
  const contentRef = useRef(null);
  const stepsRef = useRef(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { getItems: getCarouselSteps, getCenteredIndex, scrollToItem: scrollToCarouselStep } =
    useCenteredCarousel(stepsRef, ".how-to-step");

  const steps = UI_TEXT.HOW_TO_PLAY_STEPS;

  const syncCurrentStepIndex = useCallback(() => {
    setCurrentStepIndex(getCenteredIndex());
  }, [getCenteredIndex]);

  const resetCarouselPosition = useCallback(() => {
    if (steps.length === 0) return;
    setCurrentStepIndex(0);
    scrollToCarouselStep(0, "instant");
  }, [steps.length, scrollToCarouselStep]);

  const updateEdgePadding = useCallback(() => {
    const list = stepsRef.current;
    const card = list?.querySelector(".how-to-step");
    if (!list || !card) return;

    const padding = Math.max(0, (list.clientWidth - card.offsetWidth) / 2);
    list.style.setProperty("--how-to-edge-padding", `${padding}px`);
  }, []);

  const updateContentHeight = useCallback(() => {
    const content = contentRef.current;
    if (!content) return;

    content.style.setProperty("--how-to-content-height", `${content.offsetHeight}px`);
  }, []);

  const scrollSteps = useCallback(
    (direction) => {
      const cards = getCarouselSteps();
      const centeredIndex = getCenteredIndex();
      const targetIndex = centeredIndex + direction;
      if (targetIndex < 0 || targetIndex >= cards.length) return;

      scrollToCarouselStep(targetIndex);
    },
    [getCarouselSteps, getCenteredIndex, scrollToCarouselStep]
  );

  useEffect(() => {
    if (!active) return;

    const list = stepsRef.current;
    const content = contentRef.current;
    if (!list || !content) return;

    requestAnimationFrame(() => {
      updateContentHeight();
      updateEdgePadding();
      resetCarouselPosition();
      syncCurrentStepIndex();
    });

    const observer = new ResizeObserver(() => {
      const index = getCenteredIndex();
      setCurrentStepIndex(index);
      updateContentHeight();
      updateEdgePadding();
      scrollToCarouselStep(index, "instant");
    });
    observer.observe(content);
    observer.observe(list);

    const card = list.querySelector(".how-to-step");
    if (card) observer.observe(card);

    continueBtnRef.current?.focus();

    return () => {
      observer.disconnect();
      if (document.activeElement === continueBtnRef.current) {
        continueBtnRef.current?.blur();
      }
    };
  }, [
    active,
    resetCarouselPosition,
    syncCurrentStepIndex,
    updateEdgePadding,
    updateContentHeight,
    getCenteredIndex,
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
          data-tooltip={UI_TEXT.GO_BACK_LABEL}
          data-tooltip-pos="bottom"
          onClick={onGoBack}
        >
          &#8592; <span className="go-back-label">{UI_TEXT.GO_BACK_LABEL}</span>
        </button>
      </div>
      <div
        ref={contentRef}
        className="container game-screen-content how-to-content storybook-screen"
      >
        <StorybookDecor />
        <h1>{UI_TEXT.HOW_TO_PLAY_TITLE}</h1>
        <div className="how-to-carousel" id="how-to-carousel">
          <button
            type="button"
            className="carousel-arrow carousel-arrow-prev how-to-carousel-arrow"
            id="how-to-prev-btn"
            aria-label={UI_TEXT.HOW_TO_PLAY_PREV_STEP_ARIA_LABEL}
            data-tooltip={UI_TEXT.HOW_TO_PLAY_PREV_STEP_TITLE}
            disabled={currentStepIndex === 0}
            onClick={() => scrollSteps(-1)}
          >
            &#8249;
          </button>
          <ol
            className="how-to-steps"
            id="how-to-steps"
            ref={stepsRef}
            onScroll={syncCurrentStepIndex}
          >
            {steps.map((step, index) => (
              <HowToStepCard key={step.title} step={step} index={index} />
            ))}
          </ol>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-next how-to-carousel-arrow"
            id="how-to-next-btn"
            aria-label={UI_TEXT.HOW_TO_PLAY_NEXT_STEP_ARIA_LABEL}
            data-tooltip={UI_TEXT.HOW_TO_PLAY_NEXT_STEP_TITLE}
            disabled={currentStepIndex === steps.length - 1}
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
