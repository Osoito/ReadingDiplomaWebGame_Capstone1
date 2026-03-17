import Phaser from 'phaser';

// Shared color palette (hex integers for Phaser graphics)
export const COLORS = {
    NAVY:          0x1e3a5f,
    DARK_NAVY:     0x0a192f,
    GOLD:          0xc4973a,
    GOLD_HOVER:    0xd4a74a,
    PARCHMENT:     0xfdf6e3,
    WHITE:         0xffffff,
    LOCKED_GREY:   0x555555,
    COMPLETED_GREEN: 0x00ff88,
    VIDEO_YELLOW:  0xffcc00,
};

// CSS color strings for Phaser text objects
export const CSS_COLORS = {
    GOLD:       '#c4973a',
    WHITE:      '#ffffff',
    NAVY:       '#1e3a5f',
    PARCHMENT:  '#fdf6e3',
    GREY:       '#888888',
    LIGHT_BLUE: '#a9c1de',
};

// Depth layers
export const DEPTHS = {
    PATH:           5,
    TOKEN:          10,
    UI:             2000,
    MODAL_OVERLAY:  10000,
    MODAL_CONTENT:  10001,
    VIDEO_OVERLAY:  9999999,
    VIDEO_CONTENT:  10000000,
    QUIZ:           100000,
    CELEBRATION:    100000,
};

// Fonts
export const FONTS = {
    HEADING: '"Cinzel Decorative", serif',
    BODY:    'Nunito, sans-serif',
};

// Overlay opacity
export const OVERLAY_ALPHA = 0.85;

/**
 * Compute a UI scale factor from screen width.
 * Clamp between 0.7 (small phones) and 1.2 (large desktops).
 */
export function uiScale(width) {
    return Phaser.Math.Clamp(width / 1200, 0.7, 1.2);
}
