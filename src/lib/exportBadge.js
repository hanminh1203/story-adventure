import { formatTemplate } from "./format";
import {
  getAchievementTitle,
  getCharacterCollectibleName,
  getStarRating,
} from "./collectibles";
import { UI_TEXT } from "../uiText";

export const BADGE_SIZE = 256;
const FONT_DISPLAY = '"Fredoka", sans-serif';
const FONT_BODY = '"Nunito", sans-serif';

const BADGE_LAYOUT = {
  congratulationsY: 42,
  characterNameY: 74,
  starsY: 112,
  scoreY: 154,
  achievementY: 194,
  summaryY: 224,
};

async function ensureFonts() {
  if (!document.fonts?.load) return;
  await Promise.all([
    document.fonts.load('700 16px "Fredoka"'),
    document.fonts.load('700 16px "Nunito"'),
  ]);
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawStar(ctx, cx, cy, size, filled, accent) {
  ctx.save();
  ctx.font = `700 ${size}px ${FONT_DISPLAY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (filled) {
    ctx.fillStyle = accent;
    ctx.shadowColor = "rgba(255, 216, 77, 0.45)";
    ctx.shadowBlur = 6;
  } else {
    ctx.fillStyle = "rgba(159, 179, 217, 0.4)";
    ctx.shadowBlur = 0;
  }
  ctx.fillText("\u2605", cx, cy);
  ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const words = String(text).split(" ");
  let line = "";
  let cursorY = y;
  let linesDrawn = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      linesDrawn += 1;
      if (linesDrawn >= maxLines) return cursorY;
      line = words[i];
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line && linesDrawn < maxLines) {
    ctx.fillText(line, x, cursorY);
  }

  return cursorY;
}

function sanitizeFilenamePart(value) {
  return String(value || "adventure")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "adventure";
}

export function buildBadgeFilename(summary) {
  const characterName = summary?.character?.name || UI_TEXT.FINAL_CHARACTER_FALLBACK_NAME;
  return formatTemplate(UI_TEXT.EXPORT_BADGE_FILENAME_TEMPLATE, {
    characterName: sanitizeFilenamePart(characterName),
  });
}

export async function renderAchievementBadge(summary) {
  const { score, maxScore, character } = summary;
  const itemsName = summary.collectibleName || getCharacterCollectibleName(character);
  const characterName = character?.name || UI_TEXT.FINAL_CHARACTER_FALLBACK_NAME;
  const accent = character?.themeColor || "#ffd84d";
  const rating = getStarRating(score, maxScore);
  const achievementTitle = getAchievementTitle(score, maxScore);
  const scoreSummary = formatTemplate(UI_TEXT.BADGE_SCORE_SUMMARY_TEMPLATE, {
    score,
    maxScore,
    itemsName,
  });

  await ensureFonts();

  const canvas = document.createElement("canvas");
  canvas.width = BADGE_SIZE;
  canvas.height = BADGE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported");
  }

  const size = BADGE_SIZE;
  const inset = 10;

  const background = ctx.createLinearGradient(0, 0, size, size);
  background.addColorStop(0, "#0b1220");
  background.addColorStop(0.5, "#101a2d");
  background.addColorStop(1, "#07111f");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);

  const glow = ctx.createRadialGradient(size * 0.3, size * 0.25, 4, size * 0.3, size * 0.25, size * 0.45);
  glow.addColorStop(0, "rgba(111, 168, 255, 0.22)");
  glow.addColorStop(1, "rgba(111, 168, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  roundRect(ctx, inset, inset, size - inset * 2, size - inset * 2, 22);
  ctx.fillStyle = "rgba(15, 20, 30, 0.9)";
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = accent;
  ctx.font = `700 15px ${FONT_DISPLAY}`;
  ctx.fillText(UI_TEXT.BADGE_CONGRATULATIONS_TEXT, size / 2, BADGE_LAYOUT.congratulationsY);

  ctx.fillStyle = "#f2f4f8";
  ctx.font = `700 16px ${FONT_DISPLAY}`;
  ctx.fillText(characterName, size / 2, BADGE_LAYOUT.characterNameY);

  const starSize = 20;
  const starGap = 28;
  const starsStart = size / 2 - starGap;
  for (let i = 0; i < 3; i++) {
    drawStar(ctx, starsStart + i * starGap, BADGE_LAYOUT.starsY, starSize, i < rating, accent);
  }

  ctx.fillStyle = accent;
  ctx.font = `700 60px ${FONT_DISPLAY}`;
  ctx.fillText(String(score), size / 2, BADGE_LAYOUT.scoreY);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = accent;
  ctx.font = `700 15px ${FONT_DISPLAY}`;
  wrapText(ctx, achievementTitle, size / 2, BADGE_LAYOUT.achievementY, size - 44, 17);

  ctx.fillStyle = "#d4dae6";
  ctx.font = `700 11px ${FONT_BODY}`;
  wrapText(ctx, scoreSummary, size / 2, BADGE_LAYOUT.summaryY, size - 36, 13, 2);

  return canvas;
}

export async function exportAchievementBadge(summary) {
  const canvas = await renderAchievementBadge(summary);
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Could not create badge image"));
    }, "image/png");
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildBadgeFilename(summary);
  link.click();
  URL.revokeObjectURL(url);
}
