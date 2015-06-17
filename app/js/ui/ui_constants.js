Size = {
  DESC_SM: 7,
  DESC: 9,
  DESC_LG: 11,
  HEADING_SM: 15,
  HEADING: 18,
  HEADING_LG: 21,
  TITLE: 60,
  BUTTON: 15,
  BUTTON_LG: 18,

  ITEM: 45,
  STAGE: 56,
  STAGE_LG: 120,

  // TODO: Remove these
  MISSION: 50,
  TEXT: 10,
  STAGE: 56,
  STAGE_LARGE: 120,
  MISSION_TEXT: 16,
  TEXT_LG: 12,
  ITEM_TEXT: 8,
  SHIP: 50
};

Padding = {
  DESC_SM: 1,
  DESC: 2,
  DESC_LG: 8,
  DESC_GAP: 10,
  HEADING: 20,
  MARGIN_SM: 7,
  MARGIN: 14,
  MARGIN_LG: 28,
  MODAL_MARGIN: 15,
  MODAL_MARGIN_SM: 6,
  ITEM: 10,

  // TODO: Remove these
  TEXT: 2,
  STAGE: 8,
  MISSION: 10,
  MD: 25,
  BOT: 30,
  TOP: 25
};

Size.ITEM_DESC = Size.TEXT * 2 + Padding.TEXT;

Padding.TEXT_BG_RATIO = .5;
Padding.DESC_SM_BG = Size.DESC_SM * Padding.TEXT_BG_RATIO;
Padding.DESC_BG = Size.DESC * Padding.TEXT_BG_RATIO;
Padding.BUTTON_BG = Size.BUTTON * Padding.TEXT_BG_RATIO;
Padding.BUTTON_LG_BG = Size.BUTTON * Padding.TEXT_BG_RATIO;
Padding.HEADING_SM_BG = Size.HEADING_SM * Padding.TEXT_BG_RATIO;
Padding.HEADING_BG = Size.HEADING * Padding.TEXT_BG_RATIO;
Padding.HEADING_LG_BG = Size.HEADING_LG * Padding.TEXT_BG_RATIO;