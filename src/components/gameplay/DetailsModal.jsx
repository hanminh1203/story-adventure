import { UI_TEXT } from "../../uiText";
import { formatTemplate } from "../../lib/format";
import { formatCollectGoal } from "../../lib/collectibles";
function CollectibleButton({
  itemId,
  position,
  imageUrl,
  ariaLabel,
  collected,
  removing,
  spotlight,
  onCollect,
}) {
  if (collected && !removing) return null;

  return (
    <button
      type="button"
      className={`collectible-item${spotlight ? " tutorial-spotlight" : ""}${removing ? " collected" : ""}`}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onCollect(itemId, position);
      }}
    >
      <img src={imageUrl} alt="" referrerPolicy="no-referrer" />
    </button>
  );
}

export default function Slideshow({
  location,
  character,
  slideshowIndex,
  collectedItems,
  removingCollectibleIds,
  tutorialSpotlightSelector,
  collectFeedback,
  collectibleImage,
  getCollectiblesForSlide,
  makeCollectibleId,
  getCollectibleSingular,
  onCollect,
  onChangeSlide,
  onSetSlideIndex,
  onNextStop,
  slideAllCollected,
}) {
  const images = location?.images || [];

  if (images.length === 0) {
    return <p className="details-empty">{UI_TEXT.SLIDESHOW_EMPTY_TEXT}</p>;
  }

  const collectibles = getCollectiblesForSlide(location, slideshowIndex)
    .map((position, itemIndex) => {
      const itemId = makeCollectibleId(location, slideshowIndex, itemIndex);
      return { itemId, position, itemIndex };
    })
    .filter(({ itemId }) => !collectedItems.has(itemId) || removingCollectibleIds.has(itemId));

  const singular = getCollectibleSingular();
  const isLastImage = slideshowIndex === images.length - 1;

  return (
    <>
      <div className="slideshow-frame">
        <img
          src={images[slideshowIndex]}
          alt={formatTemplate(UI_TEXT.SLIDESHOW_IMG_ALT_TEMPLATE, {
            locationName: location.name,
            current: slideshowIndex + 1,
          })}
          referrerPolicy="no-referrer"
        />
        <div className="collectibles-layer">
          {getCollectiblesForSlide(location, slideshowIndex).map((position, itemIndex) => {
            const itemId = makeCollectibleId(location, slideshowIndex, itemIndex);
            const collected = collectedItems.has(itemId);
            const removing = removingCollectibleIds.has(itemId);
            if (collected && !removing) return null;
            return (
              <CollectibleButton
                key={itemId}
                itemId={itemId}
                position={position}
                imageUrl={collectibleImage}
                ariaLabel={formatTemplate(UI_TEXT.COLLECTIBLE_ARIA_LABEL_TEMPLATE, { singular })}
                collected={collected}
                removing={removing}
                spotlight={tutorialSpotlightSelector === ".collectible-item"}
                onCollect={onCollect}
              />
            );
          })}
          {collectFeedback && (
            <span
              className="collect-feedback"
              aria-hidden="true"
              style={{ left: `${collectFeedback.left}%`, top: `${collectFeedback.top}%` }}
            >
              {collectFeedback.message}
            </span>
          )}
        </div>
        <button
          type="button"
          className="slideshow-btn slideshow-btn-previous"
          aria-label={UI_TEXT.SLIDESHOW_BTN_PREV_ARIA_LABEL}
          onClick={() => onChangeSlide(-1)}
        >
          &#8592;
        </button>
        <button
          type="button"
          className="slideshow-btn slideshow-btn-next"
          aria-label={UI_TEXT.SLIDESHOW_BTN_NEXT_ARIA_LABEL}
          onClick={() => onChangeSlide(1)}
        >
          &#8594;
        </button>
        {slideAllCollected && (
          <div className="slide-complete">
            <p className="slide-complete-label">{UI_TEXT.SLIDE_COMPLETE_LABEL_TEXT}</p>
            <button
              type="button"
              className="btn-accent slide-complete-btn"
              onClick={isLastImage ? onNextStop : () => onChangeSlide(1)}
            >
              {isLastImage
                ? UI_TEXT.SLIDE_COMPLETE_BTN_TEXT_NEXT_STOP
                : UI_TEXT.SLIDE_COMPLETE_BTN_TEXT_NEXT_PICTURE}
            </button>
          </div>
        )}
      </div>
      <div className="slideshow-meta">
        {formatTemplate(UI_TEXT.SLIDESHOW_META_TEMPLATE, {
          current: slideshowIndex + 1,
          total: images.length,
        })}
      </div>
      <div className="slideshow-thumbnails">
        {images.map((url, index) => (
          <button
            key={url + index}
            type="button"
            className={index === slideshowIndex ? "active" : ""}
            aria-label={formatTemplate(UI_TEXT.SLIDESHOW_THUMB_ARIA_LABEL_TEMPLATE, {
              current: index + 1,
            })}
            onClick={() => onSetSlideIndex(index)}
          >
            <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" />
          </button>
        ))}
      </div>
    </>
  );
}

export function DetailsModal({
  visible,
  location,
  character,
  slideshowIndex,
  collectedItems,
  removingCollectibleIds,
  tutorialSpotlightSelector,
  collectFeedback,
  collectibleImage,
  detailsSlideshowRef,
  getCollectiblesForSlide,
  makeCollectibleId,
  getCollectibleSingular,
  onCollect,
  onChangeSlide,
  onSetSlideIndex,
  onClose,
  onNextStop,
  slideAllCollected,
}) {
  if (!location) return null;

  const images = location.images || [];
  const showCollectGoal = images.length > 0;

  return (
    <div
      id="details-modal"
      className={`details-modal${visible ? " visible" : ""}`}
      aria-hidden={visible ? "false" : "true"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="details-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
      >
        <button
          id="details-close-btn"
          className="details-close-btn"
          type="button"
          aria-label="Close details"
          onClick={onClose}
        >
          &#215;
        </button>
        {showCollectGoal && (
          <p id="details-collect-goal" className="details-collect-goal">
            {formatCollectGoal(character)}
          </p>
        )}
        <h2 id="details-title">{location.name}</h2>
        <p id="details-description">{location.description || ""}</p>
        <div id="details-slideshow" className="details-slideshow" ref={detailsSlideshowRef}>
          <Slideshow
            location={location}
            character={character}
            slideshowIndex={slideshowIndex}
            collectedItems={collectedItems}
            removingCollectibleIds={removingCollectibleIds}
            tutorialSpotlightSelector={tutorialSpotlightSelector}
            collectFeedback={collectFeedback}
            collectibleImage={collectibleImage}
            getCollectiblesForSlide={getCollectiblesForSlide}
            makeCollectibleId={makeCollectibleId}
            getCollectibleSingular={getCollectibleSingular}
            onCollect={onCollect}
            onChangeSlide={onChangeSlide}
            onSetSlideIndex={onSetSlideIndex}
            onNextStop={onNextStop}
            slideAllCollected={slideAllCollected}
          />
        </div>
      </div>
    </div>
  );
}
