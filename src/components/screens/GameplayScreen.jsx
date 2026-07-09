import { useGameplay } from "../../hooks/useGameplay";
import { UI_TEXT } from "../../uiText";
import { formatTemplate } from "../../lib/format";
import { playButtonClick } from "../../lib/audio";
import MapIntroScreen from "../MapIntroScreen";
import { DetailsModal } from "../gameplay/DetailsModal";

export default function GameplayScreen({ active, character, onFinalize, onExit }) {
  const gameplay = useGameplay({ character, active, onFinalize, onExit });

  const {
    locations,
    currentIndex,
    currentLoc,
    isFlying,
    score,
    collectedItems,
    visitedLocations,
    scorePulse,
    locationUiRef,
    locationUiStyle,
    detailsVisible,
    exitConfirmVisible,
    slideshowLocation,
    slideshowIndex,
    mapLoading,
    mapReady,
    mapReadyRef,
    dismissIntro,
    handleIntroEnded,
    achievementToast,
    tutorialActive,
    tutorialConfig,
    tutorialSpotlightSelector,
    removingCollectibleIds,
    collectFeedback,
    isFirstLocation,
    isFinalLocation,
    scoreLabel,
    avatarSrc,
    collectibleImage,
    guideAccent,
    goNext,
    goPrev,
    changeSlide,
    setSlideshowIndex,
    showDetailsPopup,
    hideDetailsPopup,
    showExitConfirm,
    hideExitConfirm,
    confirmExit,
    skipTutorial,
    collectItem,
    getCollectiblesForSlide,
    makeCollectibleId,
    getCollectibleSingular,
    countCollectedForLocation,
    isLocationFullyCollected: isLocFullyCollected,
    slideAllCollected,
    character: guide,
  } = gameplay;

  const tutorialMessage = tutorialConfig?.message || "";

  return (
    <div
      id="gameplay-screen"
      className={active ? "active" : "hidden"}
      aria-hidden={active ? "false" : "true"}
    >
      <div id="cesiumContainer" />

      <div className="ui" style={guideAccent ? { "--guide-accent": guideAccent } : undefined}>
        <div
          id="score-panel"
          className={`score-panel-layout${scorePulse ? " score-pulse" : ""}`}
        >
          <div>
            <img
              id="avatar"
              src={avatarSrc}
              alt={UI_TEXT.AVATAR_ALT_TEXT}
              className="avatar"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div id="score-label" className="panel-label">
              {scoreLabel}
            </div>
            <div className="score-row">
              <img
                id="score-collectible-icon"
                className="score-collectible-icon"
                src={collectibleImage}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
              />
              <div id="score-value">{score}</div>
            </div>
          </div>
        </div>

        <button
          id="exit-btn"
          className="btn-glass exit-btn"
          type="button"
          aria-label={UI_TEXT.EXIT_BTN_ARIA_LABEL}
          data-tooltip={UI_TEXT.EXIT_BTN_TITLE}
          data-tooltip-pos="bottom"
          onClick={showExitConfirm}
        >
          <span className="exit-btn-icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M0 0 C5.28 0 10.56 0 16 0 C16 2.64 16 5.28 16 8 C15.34 8 14.68 8 14 8 C14 6.02 14 4.04 14 2 C12.68 2 11.36 2 10 2 C10 7.61 10 13.22 10 19 C11.32 19 12.64 19 14 19 C14 17.02 14 15.04 14 13 C14.66 13 15.32 13 16 13 C16 15.64 16 18.28 16 21 C14.02 21 12.04 21 10 21 C10 21.99 10 22.98 10 24 C8.52031676 23.85950482 7.04125484 23.71245174 5.5625 23.5625 C4.73878906 23.48128906 3.91507812 23.40007813 3.06640625 23.31640625 C1 23 1 23 0 22 C-0.08700342 20.36527118 -0.10701063 18.72685945 -0.09765625 17.08984375 C-0.09443359 16.10048828 -0.09121094 15.11113281 -0.08789062 14.09179688 C-0.07951172 13.05087891 -0.07113281 12.00996094 -0.0625 10.9375 C-0.05798828 9.89271484 -0.05347656 8.84792969 -0.04882812 7.77148438 C-0.03699927 5.18096546 -0.01906319 2.59047578 0 0 Z M2 2 C2 7.94 2 13.88 2 20 C3.98 20.66 5.96 21.32 8 22 C8 16.06 8 10.12 8 4 C6.02 3.34 4.04 2.68 2 2 Z " transform="translate(0,0)"/>
              <path d="M0 0 C2.86724686 0.57344937 3.8614515 0.8614515 6 3 C5.63318342 5.93453261 5.13562754 6.86437246 3 9 C2.01 9 1.02 9 0 9 C0 8.34 0 7.68 0 7 C-1.65 6.67 -3.3 6.34 -5 6 C-5 5.01 -5 4.02 -5 3 C-3.35 2.67 -1.7 2.34 0 2 C0 1.34 0 0.68 0 0 Z " transform="translate(18,6)"/>
            </svg>
          </span>
        </button>

        <div id="progress-trail" className="progress-trail" aria-label={UI_TEXT.PROGRESS_TRAIL_ARIA_LABEL}>
          <div id="progress-trail-label" className="progress-trail-label">
            {locations.length > 0
              ? formatTemplate(UI_TEXT.STOP_PANEL_TEMPLATE, {
                current: currentIndex + 1,
                total: locations.length,
              })
              : ""}
          </div>
          <div id="progress-trail-dots" className="progress-trail-dots">
            {locations.map((loc, index) => {
              const classes = ["progress-dot"];
              if (index < currentIndex) classes.push("done");
              else if (index === currentIndex) classes.push("current");
              else classes.push("upcoming");

              if (isLocFullyCollected(loc)) classes.push("collected-all");
              else if (countCollectedForLocation(loc) > 0) classes.push("collected-some");
              else if (index === currentIndex) classes.push("visiting-empty");
              else if (visitedLocations.has(loc.name)) classes.push("visited-empty");

              return (
                <span key={loc.name} className={classes.join(" ")} aria-label={loc.name} />
              );
            })}
          </div>
        </div>

        <div
          id="achievement-toast"
          className={`achievement-toast${achievementToast.visible ? " visible" : ""}`}
          aria-live="polite"
          hidden={!achievementToast.visible}
        >
          {achievementToast.message}
        </div>

        <div
          id="tutorial-card"
          className={`tutorial-card${tutorialActive ? "" : " hidden"}`}
          aria-hidden={tutorialActive ? "false" : "true"}
          role="dialog"
          aria-labelledby="tutorial-message"
        >
          <img
            id="tutorial-avatar"
            className="tutorial-avatar"
            src={avatarSrc}
            alt={guide?.name || ""}
            referrerPolicy="no-referrer"
          />
          <div className="tutorial-speech">
            <p id="tutorial-speaker" className="tutorial-speaker">
              {guide
                ? formatTemplate(UI_TEXT.TUTORIAL_SPEAKER_TEMPLATE, { name: guide.name })
                : UI_TEXT.TUTORIAL_SPEAKER_FALLBACK}
            </p>
            <p id="tutorial-message">{tutorialMessage}</p>
            <div className="tutorial-actions">
              <button
                id="tutorial-skip-btn"
                type="button"
                className="tutorial-skip-btn"
                onClick={skipTutorial}
              >
                {UI_TEXT.TUTORIAL_SKIP_BTN_TEXT}
              </button>
            </div>
          </div>
        </div>

        <div
          id="location-ui"
          className="location-ui"
          ref={locationUiRef}
          style={{
            display: locationUiStyle.display,
            visibility: locationUiStyle.visibility,
            left: locationUiStyle.left,
            top: locationUiStyle.top,
          }}
        >
          <div id="pin-panel" className="pin-panel">
            <div id="pin-panel-body" className="pin-panel-body">
              {currentLoc && (
                <div className="pin-panel-content">
                  <div className="panel-label">
                    {formatTemplate(UI_TEXT.STOP_PANEL_TEMPLATE, {
                      current: currentIndex + 1,
                      total: locations.length,
                    })}
                  </div>
                  <h2 className="panel-title">{currentLoc.name}</h2>
                  <div className="pin-panel-description-scroll">
                    <p className="panel-description">{currentLoc.description || ""}</p>
                  </div>
                  <div className="pin-panel-actions">
                    <button
                      id="prev-btn"
                      type="button"
                      className={`nav-button${isFirstLocation ? " hidden" : ""}`}
                      aria-label={UI_TEXT.NAV_PREV_LOCATION_ARIA_LABEL}
                      data-tooltip={UI_TEXT.NAV_PREV_LOCATION_TITLE}
                      disabled={isFirstLocation || isFlying}
                      onClick={goPrev}
                    >
                      &#8592;
                    </button>
                    <button
                      type="button"
                      className={`btn-accent pin-details-btn${tutorialSpotlightSelector === ".pin-details-btn" ? " tutorial-spotlight" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        playButtonClick();
                        showDetailsPopup(currentLoc);
                      }}
                    >
                      {UI_TEXT.PIN_DETAILS_CTA_TEXT}
                    </button>
                    <button
                      id="next-btn"
                      type="button"
                      className={`nav-button${isFinalLocation ? " finalize-btn" : ""}`}
                      aria-label={
                        isFinalLocation
                          ? UI_TEXT.NAV_FINALIZE_ARIA_LABEL
                          : UI_TEXT.NAV_NEXT_LOCATION_ARIA_LABEL
                      }
                      data-tooltip={
                        isFinalLocation
                          ? UI_TEXT.NAV_EXIT_FINALIZE_TEXT
                          : UI_TEXT.NAV_NEXT_LOCATION_TITLE
                      }
                      disabled={isFlying}
                      onClick={goNext}
                    >
                      {isFinalLocation ? UI_TEXT.NAV_EXIT_FINALIZE_TEXT : "\u2192"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DetailsModal
          visible={detailsVisible}
          location={slideshowLocation}
          character={guide}
          slideshowIndex={slideshowIndex}
          collectedItems={collectedItems}
          removingCollectibleIds={removingCollectibleIds}
          tutorialSpotlightSelector={tutorialSpotlightSelector}
          collectFeedback={collectFeedback}
          collectibleImage={collectibleImage}
          getCollectiblesForSlide={getCollectiblesForSlide}
          makeCollectibleId={makeCollectibleId}
          getCollectibleSingular={getCollectibleSingular}
          onCollect={collectItem}
          onChangeSlide={changeSlide}
          onSetSlideIndex={setSlideshowIndex}
          onClose={() => hideDetailsPopup()}
          onNextStop={() => {
            hideDetailsPopup({ restoreCamera: false });
            goNext();
          }}
          slideAllCollected={slideAllCollected}
        />

        <div
          id="exit-confirm-modal"
          className={`exit-confirm-modal${exitConfirmVisible ? " visible" : ""}`}
          aria-hidden={exitConfirmVisible ? "false" : "true"}
          onClick={(e) => {
            if (e.target === e.currentTarget) hideExitConfirm();
          }}
        >
          <div
            className="exit-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-confirm-title"
          >
            <h2 id="exit-confirm-title">{UI_TEXT.EXIT_CONFIRM_TITLE}</h2>
            <p>{UI_TEXT.EXIT_CONFIRM_BODY}</p>
            <div className="exit-confirm-actions">
              <button
                id="exit-cancel-btn"
                type="button"
                className="exit-confirm-btn"
                onClick={hideExitConfirm}
              >
                {UI_TEXT.EXIT_CANCEL_BTN_TEXT}
              </button>
              <button
                id="exit-confirm-btn"
                type="button"
                className="btn-accent exit-confirm-btn-primary"
                onClick={confirmExit}
              >
                {UI_TEXT.EXIT_CONFIRM_BTN_TEXT}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MapIntroScreen
        visible={mapLoading}
        character={guide}
        mapReady={mapReady}
        mapReadyRef={mapReadyRef}
        guideAccent={guideAccent}
        onSkip={dismissIntro}
        onVideoEnded={handleIntroEnded}
      />
    </div>
  );
}
