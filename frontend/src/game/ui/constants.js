import Phaser from 'phaser';

export const COLORS = {
    NAVY:          0x1e3a5f,
    DARK_NAVY:     0x0a192f,
    GOLD:          0xc4973a,
    GOLD_HOVER:    0xd4a74a,
    PARCHMENT:     0xfdf6e3,
    WHITE:         0xffffff,
    BROWN_DARK:    0x3d2b1f,
    BROWN_LIGHT:   0x5d4037,
    BOOK_RED:      0xa52a2a,
    BOOK_PAGE:     0xfff5e1,
    BACK_FILL:     0x6d7a7a,
    BACK_STROKE:   0x2c3e50,
    VIDEO_BLUE:    0x3b88c3,
};

export const CSS_COLORS = {
    GOLD:       '#c4973a',
    WHITE:      '#ffffff',
    NAVY:       '#1e3a5f',
    PARCHMENT:  '#fdf6e3',
    GREY:       '#888888',
    LIGHT_BLUE: '#a9c1de',
};

export const DEPTHS = {
    PATH:           5,
    TOKEN:          50,
    WAYPOINT:       10,
    WAYPOINT_TEXT:  11,
    UI:             2000,
    BOOK_LIST:      10000,
    VIDEO:          9999999,
    QUIZ:           100000,
    CELEBRATION:    100000,
};

export const FONTS = {
    HEADING: '"Cinzel Decorative", serif',
    BODY:    'Nunito, sans-serif',
};

export function uiScale(width) {
    return Phaser.Math.Clamp(width / 1200, 0.7, 1.2);
}
