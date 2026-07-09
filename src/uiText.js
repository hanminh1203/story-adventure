// Centralised UI text and labels (non–Google Sheet content)

import howTo1Image from "./assets/images/how-to/how-to-1.png";
import howTo2Image from "./assets/images/how-to/how-to-2.png";
import howTo3Image from "./assets/images/how-to/how-to-3.png";
import howTo4Image from "./assets/images/how-to/how-to-4.png";

export const UI_TEXT = {
  COLLECT_MESSAGES: ["Great find!", "Nice one!", "Well done!", "Brilliant!", "Got it!"],
  SELECT_BUTTON_LABEL: "Pick me!",
  DEFAULT_COLLECTIBLE_NAME: "treasures",
  SCORE_LABEL_FALLBACK: "Treasures found!",
  COLLECTIBLE_FOUND_LABEL_TEMPLATE: "{collectibleName} found!",
  COLLECT_GOAL_TEMPLATE: "Find {count} hidden {name} in these pictures!",
  COLLECTIBLE_SINGULAR_FALLBACK: "treasure",
  COLLECTIBLE_SINGULAR_MUSIC_NOTES: "music note",

  TUTORIAL_STEP_1: "Hi! I'm {name}. Watch us fly to our first magical stop!",
  TUTORIAL_STEP_2: "Tap Look closer! to see photos of this place.",
  TUTORIAL_STEP_3: "Can you find the hidden {treasures}? Tap them for treasure!",
  TUTORIAL_SPEAKER_TEMPLATE: "{name} says:",
  TUTORIAL_SPEAKER_FALLBACK: "Your guide says:",

  ACHIEVEMENT_ALL_ITEMS_AT_LOCATION:
    "Hooray! You found all the {itemsName} at {locationName}!",
  FINAL_ITEMS_SUMMARY_TEMPLATE: "You found {score} of {maxScore} {itemsName}!",
  FINAL_ITEMS_SUMMARY_SUFFIX_SUPER_EXPLORER: " Super Explorer!",
  FINAL_CHARACTER_FALLBACK_NAME: "Your guide",
  FINAL_CHARACTER_PROUD_TEMPLATE: "{characterName} is proud of your adventure!",

  START_LOADING_TEXT: "Gathering your guides...",
  MAP_LOADING_TEXT: "Preparing your adventure...",
  LOADING_PROGRESS_ARIA_LABEL: "Loading progress",
  MAP_INTRO_SKIP_BTN_TEXT: "Skip ahead!",
  DATA_LOAD_ERROR_HTML:
    "<p style='padding:2rem;font-family:sans-serif'>Oops! We couldn't load the adventure just now. Please try again later.</p>",

  EMBED_PROMPT_FULLSCREEN:
    "Oh no, the window is too small for our journey! Tap the button to go full screen and begin the adventure.",
  EMBED_PROMPT_NEWTAB:
    "Oh no, the window is too small for our journey! Tap the button to open the adventure in a new tab.",
  EMBED_FULLSCREEN_TITLE_BLOCKED:
    "Oh no! Full screen didn't work. Try opening the adventure in a new tab.",

  EMBED_BTN_OPEN_NEW_TAB_ARIA_LABEL: "Open in new tab",
  EMBED_BTN_OPEN_NEW_TAB_TITLE: "Open in new tab",
  EMBED_BTN_ARIA_LABEL_ENTER_FULLSCREEN: "Enter full screen",
  EMBED_BTN_ARIA_LABEL_EXIT_FULLSCREEN: "Exit full screen",
  EMBED_BTN_TITLE_ENTER_FULLSCREEN: "Full screen",
  EMBED_BTN_TITLE_EXIT_FULLSCREEN: "Exit full screen",

  AUDIO_SFX_ON_ARIA_LABEL: "Turn sound effects off",
  AUDIO_SFX_OFF_ARIA_LABEL: "Turn sound effects on",
  AUDIO_SFX_ON_TITLE: "Sound effects on",
  AUDIO_SFX_OFF_TITLE: "Sound effects off",

  AUDIO_MUSIC_ON_ARIA_LABEL: "Turn music off",
  AUDIO_MUSIC_OFF_ARIA_LABEL: "Turn music on",
  AUDIO_MUSIC_ON_TITLE: "Music on",
  AUDIO_MUSIC_OFF_TITLE: "Music off",

  NAV_NEXT_LOCATION_TITLE: "Next stop",
  NAV_EXIT_FINALIZE_TEXT: "Finish!",
  NAV_NEXT_LOCATION_ARIA_LABEL: "Next stop",
  NAV_FINALIZE_ARIA_LABEL: "Finish adventure",
  NAV_PREV_LOCATION_ARIA_LABEL: "Previous stop",
  NAV_PREV_LOCATION_TITLE: "Previous stop",

  START_SCREEN_TITLE: "Magical Story Adventures",
  START_SCREEN_DESCRIPTION:
    "Fly around the world with magical guides! Explore countries, cultures, landmarks, and stories on a fun online adventure inspired by Google Earth.",
  START_BUTTON_TEXT: "LET'S GO!",
  HOW_TO_PLAY_TITLE: "How to Play",
  HOW_TO_PLAY_BEGIN_BTN_TEXT: "Got it — let's go!",
  HOW_TO_PLAY_PREV_STEP_ARIA_LABEL: "Previous step",
  HOW_TO_PLAY_NEXT_STEP_ARIA_LABEL: "Next step",
  HOW_TO_PLAY_PREV_STEP_TITLE: "Previous step",
  HOW_TO_PLAY_NEXT_STEP_TITLE: "Next step",
  HOW_TO_PLAY_SCREENSHOT_ALT_TEMPLATE: "How-to picture {number}",
  HOW_TO_PLAY_STEPS: [
    {
      title: "Choose your guide",
      description:
        "Watch each guide's story, then tap Pick me! to choose who leads your adventure.",
      screenshotNumber: 1,
      image: howTo1Image,
    },
    {
      title: "Explore the globe",
      description:
        "Your guide flies you to magical stops around the world. Use the arrow buttons to move between places, then tap Look closer! to see photos from each stop.",
      screenshotNumber: 2,
      image: howTo2Image,
    },
    {
      title: "Find hidden treasures",
      description:
        "Hidden treasures are tucked inside the pictures. Tap them to collect treasure and win points!",
      screenshotNumber: 3,
      image: howTo3Image,
    },
    {
      title: "Finish your journey",
      description:
        "Visit every stop, then tap Finish! to see how many treasures you found. Ready? Let's go!",
      screenshotNumber: 4,
      image: howTo4Image,
    },
  ],
  CHARACTER_SELECT_TITLE: "Meet your guides",
  CHARACTER_SELECT_INSTRUCTION_TEMPLATE:
    "Watch their stories, choose your favourite guide, then tap <strong>{selectButton}</strong> to begin your adventure!",
  CHARACTER_CAROUSEL_PREV_ARIA_LABEL: "Previous guide",
  CHARACTER_CAROUSEL_NEXT_ARIA_LABEL: "Next guide",
  CHARACTER_CAROUSEL_PREV_TITLE: "Previous guide",
  CHARACTER_CAROUSEL_NEXT_TITLE: "Next guide",
  GO_BACK_LABEL: "Go back",
  TUTORIAL_SKIP_BTN_TEXT: "Skip ahead!",
  EXIT_BTN_TEXT: "Leave",
  EXIT_BTN_ARIA_LABEL: "Leave adventure",
  EXIT_BTN_TITLE: "Leave adventure",
  EXIT_CONFIRM_TITLE: "Leaving already?",
  EXIT_CONFIRM_BODY: "Your treasure hunt won't be saved. Are you sure you want to leave?",
  EXIT_CANCEL_BTN_TEXT: "Keep playing",
  EXIT_CONFIRM_BTN_TEXT: "Leave",
  FINAL_SCREEN_KICKER: "Your score!",
  FINAL_STARS_ARIA_LABEL: "Stars you earned",
  RESTART_BTN_TEXT: "Play again!",
  LOADING_SCREEN_VISIBILITY_TEXT: "Preparing your adventure...",

  AVATAR_ALT_TEXT: "Your guide",
  PROGRESS_TRAIL_ARIA_LABEL: "Your adventure",

  STOP_PANEL_TEMPLATE: "Stop {current} of {total}",
  SLIDESHOW_META_TEMPLATE: "{current} / {total}",
  SLIDESHOW_IMG_ALT_TEMPLATE: "{locationName} picture {current}",
  SLIDESHOW_THUMB_ARIA_LABEL_TEMPLATE: "Show picture {current}",
  SLIDESHOW_THUMB_TITLE_TEMPLATE: "Show picture {current}",

  SLIDE_COMPLETE_BTN_TEXT_NEXT_STOP: "On to the next stop!",
  SLIDE_COMPLETE_BTN_TEXT_NEXT_PICTURE: "See the next picture!",

  PIN_DETAILS_CTA_TEXT: "Look closer!",
  SLIDE_COMPLETE_LABEL_TEXT: "Hooray! You found them all here!",
  SLIDESHOW_EMPTY_TEXT: "Our photos are still on their way — check back soon!",
  SLIDESHOW_BTN_PREV_ARIA_LABEL: "Previous picture",
  SLIDESHOW_BTN_NEXT_ARIA_LABEL: "Next picture",
  SLIDESHOW_BTN_PREV_TITLE: "Previous picture",
  SLIDESHOW_BTN_NEXT_TITLE: "Next picture",
  DETAILS_CLOSE_ARIA_LABEL: "Close",
  DETAILS_CLOSE_TITLE: "Close",

  COLLECTIBLE_ARIA_LABEL_TEMPLATE: "Tap to collect a {singular}!",
};
