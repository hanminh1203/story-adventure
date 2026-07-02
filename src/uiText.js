// Centralised UI text and labels (non–Google Sheet content)

export const UI_TEXT = {
  COLLECT_MESSAGES: ["Great find!", "Nice one!", "Got it!"],
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

  ACHIEVEMENT_ALL_ITEMS_AT_LOCATION: "All {itemsName} found at {locationName}!",
  FINAL_ITEMS_SUMMARY_TEMPLATE: "You found {score} of {maxScore} {itemsName}!",
  FINAL_ITEMS_SUMMARY_SUFFIX_SUPER_EXPLORER: " Super Explorer!",
  FINAL_CHARACTER_FALLBACK_NAME: "Your guide",
  FINAL_CHARACTER_PROUD_TEMPLATE: "{characterName} is proud of your adventure!",

  START_LOADING_TEXT: "Gathering your guides...",
  MAP_LOADING_TEXT: "Preparing your adventure...",
  DATA_LOAD_ERROR_HTML:
    "<p style='padding:2rem;font-family:sans-serif'>Could not load adventure data. Please try again later.</p>",

  EMBED_PROMPT_FULLSCREEN:
    "Oh no, the window is too small for our journey! Tap the button to go full screen and begin the adventure.",
  EMBED_PROMPT_NEWTAB:
    "Oh no, the window is too small for our journey! Tap the button to open the adventure in a new tab.",
  EMBED_FULLSCREEN_TITLE_BLOCKED:
    "Full screen was blocked. Try opening this page in a new tab.",

  EMBED_BTN_OPEN_NEW_TAB_ARIA_LABEL: "Open in new tab",
  EMBED_BTN_OPEN_NEW_TAB_TITLE: "Open in new tab",
  EMBED_BTN_ARIA_LABEL_ENTER_FULLSCREEN: "Enter full screen",
  EMBED_BTN_ARIA_LABEL_EXIT_FULLSCREEN: "Exit full screen",
  EMBED_BTN_TITLE_ENTER_FULLSCREEN: "Full screen",
  EMBED_BTN_TITLE_EXIT_FULLSCREEN: "Exit full screen",

  NAV_NEXT_LOCATION_TITLE: "Next (right arrow)",
  NAV_EXIT_FINALIZE_TEXT: "Finalize",
  NAV_NEXT_LOCATION_ARIA_LABEL: "Next location",
  NAV_FINALIZE_ARIA_LABEL: "Finalize game",

  START_SCREEN_TITLE: "Magical Story Adventures",
  START_SCREEN_DESCRIPTION:
    "Step into a world where children can explore countries, cultures, landmarks, stories, and magical adventures through an interactive online journey inspired by Google Earth.",
  START_BUTTON_TEXT: "LET'S GO!",
  CHARACTER_SELECT_TITLE: "Meet your guides",
  CHARACTER_SELECT_INSTRUCTION_TEMPLATE:
    "Watch their stories, choose your favourite guide, then tap <strong>{selectButton}</strong> to begin your adventure!",
  GO_BACK_LABEL: "Go back",
  TUTORIAL_SKIP_BTN_TEXT: "Skip tutorial",
  EXIT_BTN_TEXT: "Exit",
  EXIT_CONFIRM_TITLE: "Leave adventure?",
  EXIT_CONFIRM_BODY: "Your progress will be lost. Are you sure you want to exit?",
  EXIT_CANCEL_BTN_TEXT: "Keep playing",
  EXIT_CONFIRM_BTN_TEXT: "Exit",
  FINAL_SCREEN_KICKER: "Final Score",
  RESTART_BTN_TEXT: "RESTART",
  LOADING_SCREEN_VISIBILITY_TEXT: "Preparing your adventure...",

  STOP_PANEL_TEMPLATE: "Stop {current} of {total}",
  SLIDESHOW_META_TEMPLATE: "{current} / {total}",
  SLIDESHOW_IMG_ALT_TEMPLATE: "{locationName} image {current}",
  SLIDESHOW_THUMB_ARIA_LABEL_TEMPLATE: "Show image {current}",

  SLIDE_COMPLETE_BTN_TEXT_NEXT_STOP: "On to the next stop!",
  SLIDE_COMPLETE_BTN_TEXT_NEXT_PICTURE: "See the next picture!",

  PIN_DETAILS_CTA_TEXT: "Look closer!",
  SLIDE_COMPLETE_LABEL_TEXT: "Hooray! You found them all here!",
  SLIDESHOW_EMPTY_TEXT: "Our photos are still on their way — check back soon!",
  SLIDESHOW_BTN_PREV_ARIA_LABEL: "previous image",
  SLIDESHOW_BTN_NEXT_ARIA_LABEL: "next image",

  COLLECTIBLE_ARIA_LABEL_TEMPLATE: "Collect {singular} for 1 point",
};
