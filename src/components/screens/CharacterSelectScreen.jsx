import { useCallback, useEffect, useRef, useState } from "react";
import { CAROUSEL_MEDIA_QUERY } from "../../constants";
import { formatTemplate } from "../../lib/format";
import { prefersReducedMotion } from "../../lib/motion";
import { UI_TEXT } from "../../uiText";
import CharacterCard from "./CharacterCard";

export default function CharacterSelectScreen({
  active,
  characters,
  onCharacterSelected,
  onGoBack,
}) {
  const gridRef = useRef(null);
  const isCarouselJumpingRef = useRef(false);
  const carouselScrollEndTimerRef = useRef(null);
  const carouselMediaQueryRef = useRef(
    typeof window !== "undefined" ? window.matchMedia(CAROUSEL_MEDIA_QUERY) : null
  );
  const [focusedCharacterIndex, setFocusedCharacterIndex] = useState(null);
  const screenRef = useRef(null);

  const isCarouselActive = useCallback(() => {
    return carouselMediaQueryRef.current?.matches && characters.length > 0;
  }, [characters.length]);

  const getCarouselCards = useCallback(() => {
    if (!gridRef.current) return [];
    return [...gridRef.current.querySelectorAll(".character-card")];
  }, []);

  const getCenteredCarouselCardIndex = useCallback(() => {
    const cards = getCarouselCards();
    if (cards.length === 0) return 0;

    const grid = gridRef.current;
    const center = grid.scrollLeft + grid.clientWidth / 2;
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
  }, [getCarouselCards]);

  const getRealCharacterIndexFromCarouselCard = useCallback(
    (cardIndex) => {
      const realCount = characters.length;
      if (realCount === 0) return 0;
      if (cardIndex <= 0) return realCount - 1;
      if (cardIndex >= realCount + 1) return 0;
      return cardIndex - 1;
    },
    [characters.length]
  );

  const syncFocusedFromCarousel = useCallback(() => {
    if (!isCarouselActive()) return;
    const centeredIndex = getCenteredCarouselCardIndex();
    setFocusedCharacterIndex(getRealCharacterIndexFromCarouselCard(centeredIndex));
  }, [
    getCenteredCarouselCardIndex,
    getRealCharacterIndexFromCarouselCard,
    isCarouselActive,
  ]);

  const resetFocusedCharacterIndex = useCallback(() => {
    if (isCarouselActive()) {
      setFocusedCharacterIndex(0);
      return;
    }
    setFocusedCharacterIndex(null);
  }, [isCarouselActive]);

  const scrollToCarouselCard = useCallback(
    (cardIndex, behavior = "smooth") => {
      const cards = getCarouselCards();
      const card = cards[cardIndex];
      if (!card) return;

      const resolvedBehavior =
        behavior === "instant" || prefersReducedMotion() ? "auto" : "smooth";
      card.scrollIntoView({
        behavior: resolvedBehavior,
        inline: "center",
        block: "nearest",
      });
    },
    [getCarouselCards]
  );

  const resetCarouselPosition = useCallback(() => {
    if (!isCarouselActive()) return;
    isCarouselJumpingRef.current = true;
    scrollToCarouselCard(1, "instant");
    isCarouselJumpingRef.current = false;
  }, [isCarouselActive, scrollToCarouselCard]);

  const normalizeCarouselPosition = useCallback(() => {
    if (!isCarouselActive() || isCarouselJumpingRef.current) return;

    const cards = getCarouselCards();
    const realCount = characters.length;
    if (cards.length < realCount + 2) return;

    const centeredIndex = getCenteredCarouselCardIndex();
    if (centeredIndex === 0) {
      isCarouselJumpingRef.current = true;
      scrollToCarouselCard(realCount, "instant");
      isCarouselJumpingRef.current = false;
      return;
    }

    if (centeredIndex === realCount + 1) {
      isCarouselJumpingRef.current = true;
      scrollToCarouselCard(1, "instant");
      isCarouselJumpingRef.current = false;
    }
  }, [
    characters.length,
    getCarouselCards,
    getCenteredCarouselCardIndex,
    isCarouselActive,
    scrollToCarouselCard,
  ]);

  const handleCarouselScroll = useCallback(() => {
    if (!isCarouselActive() || isCarouselJumpingRef.current) return;

    if (carouselScrollEndTimerRef.current) {
      window.clearTimeout(carouselScrollEndTimerRef.current);
    }

    carouselScrollEndTimerRef.current = window.setTimeout(() => {
      carouselScrollEndTimerRef.current = null;
      normalizeCarouselPosition();
      syncFocusedFromCarousel();
    }, 120);
  }, [isCarouselActive, normalizeCarouselPosition, syncFocusedFromCarousel]);

  const scrollCharacters = useCallback(
    (direction) => {
      if (!isCarouselActive()) return null;

      const cards = getCarouselCards();
      const centeredIndex = getCenteredCarouselCardIndex();
      const targetIndex = centeredIndex + direction;
      if (targetIndex < 0 || targetIndex >= cards.length) return null;

      scrollToCarouselCard(targetIndex);
      return getRealCharacterIndexFromCarouselCard(targetIndex);
    },
    [
      getCarouselCards,
      getCenteredCarouselCardIndex,
      getRealCharacterIndexFromCarouselCard,
      isCarouselActive,
      scrollToCarouselCard,
    ]
  );

  useEffect(() => {
    const mq = carouselMediaQueryRef.current;
    if (!mq) return;

    const onChange = () => {
      resetCarouselPosition();
      resetFocusedCharacterIndex();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [resetCarouselPosition, resetFocusedCharacterIndex]);

  useEffect(() => {
    if (!active) return;

    resetFocusedCharacterIndex();
    requestAnimationFrame(() => {
      resetCarouselPosition();
      syncFocusedFromCarousel();
      screenRef.current?.focus({ preventScroll: true });
    });
  }, [active, characters, resetCarouselPosition, resetFocusedCharacterIndex, syncFocusedFromCarousel]);

  useEffect(() => {
    requestAnimationFrame(() => resetCarouselPosition());
  }, [characters, resetCarouselPosition]);

  if (characters.length === 0) return null;

  const firstCharacter = characters[0];
  const lastCharacter = characters[characters.length - 1];

  return (
    <div
      ref={screenRef}
      id="character-select-screen"
      className={`game-screen static-background${active ? " active" : " hidden"}`}
      aria-hidden={active ? "false" : "true"}
      tabIndex={-1}
    >
      <div className="game-screen-overlay" />
      <div className="game-screen-ui character-screen-ui">
        <button
          id="character-select-go-back-btn"
          className="btn-glass go-back-btn"
          type="button"
          onClick={onGoBack}
        >
          &#8592; <span className="go-back-label">{UI_TEXT.GO_BACK_LABEL}</span>
        </button>
      </div>
      <div className="container game-screen-content character-select-content">
        <h1>{UI_TEXT.CHARACTER_SELECT_TITLE}</h1>
        <p
          className="character-select-instruction"
          dangerouslySetInnerHTML={{
            __html: formatTemplate(UI_TEXT.CHARACTER_SELECT_INSTRUCTION_TEMPLATE, {
              selectButton: UI_TEXT.SELECT_BUTTON_LABEL,
            }),
          }}
        />
        <div className="character-carousel" id="character-carousel">
          <button
            type="button"
            className="carousel-arrow carousel-arrow-prev"
            id="character-prev-btn"
            aria-label={UI_TEXT.CHARACTER_CAROUSEL_PREV_ARIA_LABEL}
            onClick={() => {
              const nextIndex = scrollCharacters(-1);
              if (nextIndex !== null) setFocusedCharacterIndex(nextIndex);
            }}
          >
            &#8249;
          </button>
          <div
            className="character-grid"
            id="character-grid"
            ref={gridRef}
            onScroll={handleCarouselScroll}
          >
            <CharacterCard character={lastCharacter} isClone onSelect={() => {}} />
            {characters.map((character, index) => (
              <CharacterCard
                key={character.id}
                character={character}
                isKeyboardFocused={focusedCharacterIndex === index}
                onSelect={onCharacterSelected}
              />
            ))}
            <CharacterCard character={firstCharacter} isClone onSelect={() => {}} />
          </div>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-next"
            id="character-next-btn"
            aria-label={UI_TEXT.CHARACTER_CAROUSEL_NEXT_ARIA_LABEL}
            onClick={() => {
              const nextIndex = scrollCharacters(1);
              if (nextIndex !== null) setFocusedCharacterIndex(nextIndex);
            }}
          >
            &#8250;
          </button>
        </div>
      </div>
    </div>
  );
}
