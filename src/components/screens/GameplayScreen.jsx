import { useGameplay } from "../../hooks/useGameplay";
import { UI_TEXT } from "../../uiText";
import { formatTemplate } from "../../lib/format";
import LoadingScreen from "../LoadingScreen";
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
    pinPanelBodyRef,
    detailsSlideshowRef,
    locationUiStyle,
    detailsVisible,
    exitConfirmVisible,
    slideshowLocation,
    slideshowIndex,
    mapLoading,
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
              alt="Character avatar"
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

        <div id="progress-trail" className="progress-trail" aria-label="Adventure progress">
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

        <button
          id="exit-btn"
          className="btn-glass exit-btn"
          type="button"
          aria-label="Exit game"
          onClick={showExitConfirm}
        >
          {UI_TEXT.EXIT_BTN_TEXT}
        </button>

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
          <button
            id="prev-btn"
            className={`btn-glass nav-button${isFirstLocation ? " hidden" : ""}`}
            aria-label="Previous location"
            title="Previous (left arrow)"
            disabled={isFirstLocation || isFlying}
            onClick={goPrev}
          >
            &#8592;
          </button>
          <div id="pin-panel" className="pin-panel">
            <div id="pin-panel-body" className="pin-panel-body" ref={pinPanelBodyRef}>
              {currentLoc && (
                <div>
                  <div className="panel-label">
                    {formatTemplate(UI_TEXT.STOP_PANEL_TEMPLATE, {
                      current: currentIndex + 1,
                      total: locations.length,
                    })}
                  </div>
                  <h2 className="panel-title">{currentLoc.name}</h2>
                  <p className="panel-description">{currentLoc.description || ""}</p>
                  <button
                    type="button"
                    className={`btn-accent pin-details-btn${tutorialSpotlightSelector === ".pin-details-btn" ? " tutorial-spotlight" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      showDetailsPopup(currentLoc);
                    }}
                  >
                    {UI_TEXT.PIN_DETAILS_CTA_TEXT}
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            id="next-btn"
            className={`btn-glass nav-button${isFinalLocation ? " finalize-btn" : ""}`}
            aria-label={
              isFinalLocation ? UI_TEXT.NAV_FINALIZE_ARIA_LABEL : UI_TEXT.NAV_NEXT_LOCATION_ARIA_LABEL
            }
            title={
              isFinalLocation ? UI_TEXT.NAV_EXIT_FINALIZE_TEXT : UI_TEXT.NAV_NEXT_LOCATION_TITLE
            }
            disabled={isFlying}
            onClick={goNext}
          >
            {isFinalLocation ? UI_TEXT.NAV_EXIT_FINALIZE_TEXT : "\u2192"}
          </button>
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
          detailsSlideshowRef={detailsSlideshowRef}
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

      <LoadingScreen
        visible={mapLoading}
        text={UI_TEXT.MAP_LOADING_TEXT}
        guideAccent={guideAccent}
      />
    </div>
  );
}
