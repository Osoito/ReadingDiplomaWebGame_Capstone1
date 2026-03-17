import Phaser from 'phaser';
import { COLORS, CSS_COLORS, FONTS, OVERLAY_ALPHA, uiScale } from './constants.js';

/**
 * Reusable modal frame builder for Phaser scenes.
 * Handles: overlay, box, title, auto-resize, and cleanup.
 */
class ModalBuilder {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this._resizeHandler = null;
        this._escHandler = null;
    }

    /**
     * Create the standard modal frame: overlay + box + title text.
     * Returns { container, overlay, box, title, width, height, uiScale, boxW, boxH }
     * so the caller can add more elements to `container`.
     *
     * @param {object} opts
     * @param {string} opts.title       - Title text displayed at top of box
     * @param {number} [opts.widthRatio=0.85] - Box width as fraction of screen
     * @param {number} [opts.maxWidth]   - Max box width in logical px (before uiScale)
     * @param {number} [opts.boxHeight=300] - Box height in logical px (before uiScale)
     * @param {number} [opts.depth=10000]   - Base depth for the container
     * @param {boolean} [opts.useContainer=true] - Use Phaser container (true) or group (false)
     */
    createFrame(opts = {}) {
        const { width, height } = this.scene.scale;
        const scale = uiScale(width);

        const depthBase = opts.depth ?? 10000;
        const widthRatio = opts.widthRatio ?? 0.85;
        const maxWidth = opts.maxWidth;
        const boxHeightBase = opts.boxHeight ?? 300;
        const useContainer = opts.useContainer !== false;

        // Container or group
        if (useContainer) {
            this.container = this.scene.add.container(0, 0)
                .setDepth(depthBase)
                .setScrollFactor(0);
        } else {
            this.container = this.scene.add.group();
        }

        // Overlay
        const overlay = this.scene.add.rectangle(0, 0, width, height, COLORS.DARK_NAVY, OVERLAY_ALPHA)
            .setOrigin(0)
            .setInteractive()
            .setScrollFactor(0);
        if (useContainer) {
            this.container.add(overlay);
        } else {
            overlay.setDepth(depthBase);
            this.container.add(overlay);
        }

        // Box dimensions
        let boxW = width * widthRatio;
        if (maxWidth) boxW = Math.min(boxW, maxWidth * scale);
        boxW = Math.min(boxW, width * 0.9);
        const boxH = Math.min(boxHeightBase * scale, height * 0.85);

        const box = this.scene.add.rectangle(width / 2, height / 2, boxW, boxH, COLORS.NAVY)
            .setStrokeStyle(4, COLORS.GOLD)
            .setScrollFactor(0);
        if (useContainer) {
            this.container.add(box);
        } else {
            box.setDepth(depthBase + 1);
            this.container.add(box);
        }

        // Inner decorative frame (inset gold border)
        const inset = 8;
        const innerFrame = this.scene.add.graphics().setScrollFactor(0);
        innerFrame.lineStyle(1, COLORS.GOLD, 0.35);
        innerFrame.strokeRect(
            width / 2 - boxW / 2 + inset,
            height / 2 - boxH / 2 + inset,
            boxW - inset * 2,
            boxH - inset * 2
        );
        if (useContainer) {
            this.container.add(innerFrame);
        } else {
            innerFrame.setDepth(depthBase + 1);
            this.container.add(innerFrame);
        }

        // Corner star decorations
        const cornerSize = `${Math.round(12 * scale)}px`;
        const corners = [
            { x: width / 2 - boxW / 2 + 16, y: height / 2 - boxH / 2 + 12 },
            { x: width / 2 + boxW / 2 - 16, y: height / 2 - boxH / 2 + 12 },
            { x: width / 2 - boxW / 2 + 16, y: height / 2 + boxH / 2 - 16 },
            { x: width / 2 + boxW / 2 - 16, y: height / 2 + boxH / 2 - 16 },
        ];
        corners.forEach(c => {
            const star = this.scene.add.text(c.x, c.y, '✦', {
                fontSize: cornerSize, color: '#c4973a'
            }).setOrigin(0.5).setScrollFactor(0).setAlpha(0.5);
            if (useContainer) {
                this.container.add(star);
            } else {
                star.setDepth(depthBase + 2);
                this.container.add(star);
            }
        });

        // Title
        const title = this.scene.add.text(width / 2, height / 2 - (boxH / 2) + 30 * scale, opts.title || '', {
            fontFamily: FONTS.HEADING,
            fontSize: (26 * scale) + 'px',
            color: CSS_COLORS.GOLD,
            shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);
        if (useContainer) {
            this.container.add(title);
        } else {
            title.setDepth(depthBase + 2);
            this.container.add(title);
        }

        // Title underline decoration
        const underline = this.scene.add.graphics().setScrollFactor(0);
        const ulY = height / 2 - (boxH / 2) + 30 * scale + 18 * scale;
        const ulW = Math.min(boxW * 0.5, 200 * scale);
        underline.lineStyle(1, COLORS.GOLD, 0.4);
        underline.beginPath();
        underline.moveTo(width / 2 - ulW / 2, ulY);
        underline.lineTo(width / 2 + ulW / 2, ulY);
        underline.strokePath();
        if (useContainer) {
            this.container.add(underline);
        } else {
            underline.setDepth(depthBase + 2);
            this.container.add(underline);
        }

        return {
            container: this.container,
            overlay,
            box,
            title,
            width,
            height,
            uiScale: scale,
            boxW,
            boxH
        };
    }

    /**
     * Register auto-resize: on scale change, call `rebuildFn()` which should
     * destroy the old modal and rebuild it.
     * @param {Function} rebuildFn
     */
    enableAutoResize(rebuildFn) {
        this._resizeHandler = rebuildFn;
        this.scene.scale.on('resize', this._resizeHandler, this.scene);

        // Auto-cleanup when container is destroyed
        if (this.container && this.container.once) {
            this.container.once('destroy', () => {
                this._removeResize();
            });
        }
    }

    /**
     * Register ESC key to close the modal.
     * @param {Function} closeFn
     */
    enableEscClose(closeFn) {
        this._escHandler = (e) => { if (e.key === 'Escape') closeFn(); };
        window.addEventListener('keydown', this._escHandler);
    }

    /** Remove resize listener */
    _removeResize() {
        if (this._resizeHandler) {
            this.scene.scale.off('resize', this._resizeHandler, this.scene);
            this._resizeHandler = null;
        }
    }

    /** Full cleanup: destroy container + remove listeners */
    destroy() {
        this._removeResize();
        if (this._escHandler) {
            window.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
        if (this.container) {
            if (typeof this.container.destroy === 'function') {
                this.container.destroy(true);
            }
            this.container = null;
        }
    }
}

export default ModalBuilder;
