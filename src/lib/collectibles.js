import { UI_TEXT } from "../uiText";
import { formatTemplate } from "./format";
import {
  COLLECTIBLES_PER_SLIDE,
  COLLECTIBLE_X_EDGE_PAD,
  COLLECTIBLE_Y_MIN,
  COLLECTIBLE_Y_MAX,
  DEFAULT_COLLECTIBLE_IMAGE,
  DEFAULT_AVATAR_IMAGE,
} from "../constants";

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

export function generateBalancedPositions() {
  const bandWidth = 100 / COLLECTIBLES_PER_SLIDE;
  const positions = [];
  for (let i = 0; i < COLLECTIBLES_PER_SLIDE; i++) {
    const xMin = i * bandWidth + COLLECTIBLE_X_EDGE_PAD;
    const xMax = (i + 1) * bandWidth - COLLECTIBLE_X_EDGE_PAD;
    positions.push({
      x: randomInRange(xMin, xMax),
      y: randomInRange(COLLECTIBLE_Y_MIN, COLLECTIBLE_Y_MAX),
    });
  }
  return positions;
}

export function getCharacterCollectibleName(character) {
  return character?.collectibleName || UI_TEXT.DEFAULT_COLLECTIBLE_NAME;
}

export function getCharacterCollectibleImage(character) {
  return character?.collectibleImage || DEFAULT_COLLECTIBLE_IMAGE;
}

export function getCharacterAvatarImage(character) {
  return character?.avatarUrl || DEFAULT_AVATAR_IMAGE;
}

export function formatCollectibleLabel(collectibleName) {
  if (!collectibleName) return UI_TEXT.SCORE_LABEL_FALLBACK;
  const capitalized = `${collectibleName.charAt(0).toUpperCase()}${collectibleName.slice(1)}`;
  return formatTemplate(UI_TEXT.COLLECTIBLE_FOUND_LABEL_TEMPLATE, {
    collectibleName: capitalized,
  });
}

export function getCollectibleSingular(collectibleName) {
  if (!collectibleName) return UI_TEXT.COLLECTIBLE_SINGULAR_FALLBACK;
  if (collectibleName === "music notes") return UI_TEXT.COLLECTIBLE_SINGULAR_MUSIC_NOTES;
  if (collectibleName.endsWith("s")) return collectibleName.slice(0, -1);
  return collectibleName;
}

export function formatCollectGoal(character) {
  const name = getCharacterCollectibleName(character);
  return formatTemplate(UI_TEXT.COLLECT_GOAL_TEMPLATE, {
    count: COLLECTIBLES_PER_SLIDE,
    name,
  });
}

export function makeCollectibleId(loc, imageIndex, itemIndex) {
  return `${loc.name}:${imageIndex}:${itemIndex}`;
}

export function countCollectiblesForLocation(loc) {
  const images = loc.images || [];
  let total = 0;
  for (let i = 0; i < images.length; i++) {
    total += COLLECTIBLES_PER_SLIDE;
  }
  return total;
}

export function countCollectiblesForTour(locations) {
  return locations.reduce((sum, loc) => sum + countCollectiblesForLocation(loc), 0);
}

export function countCollectedCollectiblesForLocation(loc, collectedItems) {
  const images = loc.images || [];
  let count = 0;
  for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
    for (let itemIndex = 0; itemIndex < COLLECTIBLES_PER_SLIDE; itemIndex++) {
      if (collectedItems.has(makeCollectibleId(loc, imageIndex, itemIndex))) {
        count++;
      }
    }
  }
  return count;
}

export function isLocationFullyCollected(loc, collectedItems) {
  const total = countCollectiblesForLocation(loc);
  if (total === 0) return false;
  return countCollectedCollectiblesForLocation(loc, collectedItems) === total;
}

export function areAllCollectiblesCollectedForSlide(loc, slideIndex, collectedItems) {
  for (let itemIndex = 0; itemIndex < COLLECTIBLES_PER_SLIDE; itemIndex++) {
    if (!collectedItems.has(makeCollectibleId(loc, slideIndex, itemIndex))) {
      return false;
    }
  }
  return true;
}

export function getStarRating(score, maxScore) {
  if (maxScore === 0) return 1;
  const ratio = score / maxScore;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}

export function getTutorialSteps(character) {
  const name = character?.name || UI_TEXT.FINAL_CHARACTER_FALLBACK_NAME;
  const treasures = getCharacterCollectibleName(character);
  return [
    { message: formatTemplate(UI_TEXT.TUTORIAL_STEP_1, { name }) },
    { message: UI_TEXT.TUTORIAL_STEP_2, target: ".pin-details-btn" },
    {
      message: formatTemplate(UI_TEXT.TUTORIAL_STEP_3, { treasures }),
      target: ".collectible-item",
    },
  ];
}
