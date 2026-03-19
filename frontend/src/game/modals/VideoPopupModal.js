import Phaser from 'phaser';
import { DEPTHS, CSS_COLORS, FONTS } from '../ui/constants.js';

export default class VideoPopupModal {
    constructor(scene) {
        this.scene = scene;
        this.popupUI = null;
        this._resizeHandler = null;
        this._escHandler = null;
    }

    show(videoData, index, isManual, viewedVideos) {
        if (!isManual && viewedVideos.has(index)) return;

        this.destroy();

        const { width, height } = this.scene.scale;
        const s = Phaser.Math.Clamp(width / 1200, 0.7, 1.2);
        const depthBase = DEPTHS.VIDEO;

        this.popupUI = this.scene.add.group();

        // Overlay
        const overlay = this.scene.add.rectangle(0, 0, width, height, 0x0a192f, 0.85)
            .setOrigin(0).setScrollFactor(0).setDepth(depthBase).setInteractive();
        this.popupUI.add(overlay);

        // Box
        const boxW = 450 * s;
        const boxH = 300 * s;
        const box = this.scene.add.rectangle(width / 2, height / 2, boxW, boxH, 0x1e3a5f)
            .setStrokeStyle(4, 0xc4973a).setScrollFactor(0).setDepth(depthBase + 1);
        this.popupUI.add(box);

        // Title
        const title = this.scene.add.text(width / 2, height / 2 - (100 * s), '💡 LUKUVINKKI AVATTU', {
            fontFamily: FONTS.HEADING,
            fontSize: (26 * s) + 'px',
            color: CSS_COLORS.GOLD,
            shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 2);
        this.popupUI.add(title);

        // Subtitle
        const subTitle = this.scene.add.text(width / 2, height / 2 - (40 * s), videoData.title, {
            fontFamily: FONTS.BODY,
            fontSize: (18 * s) + 'px',
            color: CSS_COLORS.WHITE,
            align: 'center',
            wordWrap: { width: boxW - 50 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 2);
        this.popupUI.add(subTitle);

        // Watch button
        const btnBg = this.scene.add.rectangle(width / 2, height / 2 + (50 * s), 260 * s, 60 * s, 0xc4973a)
            .setScrollFactor(0).setDepth(depthBase + 2).setInteractive({ useHandCursor: true });
        this.popupUI.add(btnBg);

        const btnLabel = this.scene.add.text(width / 2, height / 2 + (50 * s), 'KATSO TÄSSÄ', {
            fontFamily: FONTS.BODY,
            fontSize: (20 * s) + 'px',
            color: CSS_COLORS.NAVY,
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 3);
        this.popupUI.add(btnLabel);

        // Close button
        const closeBtn = this.scene.add.text(width / 2, height / 2 + (120 * s), '[ Sulje ]', {
            fontFamily: FONTS.BODY,
            fontSize: (18 * s) + 'px',
            color: CSS_COLORS.LIGHT_BLUE,
            padding: 10
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 2)
            .setInteractive({ useHandCursor: true });
        this.popupUI.add(closeBtn);

        const cleanup = () => {
            viewedVideos.add(index);
            this.destroy();
        };

        btnBg.on('pointerover', () => btnBg.setFillStyle(0xd4a74a));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0xc4973a));

        btnBg.on('pointerdown', () => {
            let targetVideoId = 'TZoNz-2rk8c';
            if (String(index) === '7') {
                targetVideoId = 'jDZcdgDgM48';
            }

            const embedUrl = `https://www.youtube.com/embed/${targetVideoId}?autoplay=1&rel=0&modestbranding=1`;

            const videoOverlay = document.createElement('div');
            videoOverlay.id = 'video-dom-layer';
            videoOverlay.style = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.95); z-index: 20000000;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 10px; box-sizing: border-box;
            `;
            videoOverlay.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: flex-end; width: min(92vw, 160vh); max-width: 1000px;">
                    <button id="close-dom-video" style="
                        background: #c4973a; color: #1e3a5f;
                        border: none; padding: 10px 25px;
                        margin-bottom: 8px;
                        font-weight: bold; cursor: pointer;
                        border-radius: 4px; font-size: 16px;
                        font-family: sans-serif;
                    ">✕ SULJE </button>
                    <div style="
                        width: 100%;
                        aspect-ratio: 16/9;
                        max-height: 70vh;
                        border: 3px solid #c4973a;
                        background: #000;
                    ">
                        <iframe width="100%" height="100%" src="${embedUrl}"
                                frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen>
                        </iframe>
                    </div>
                </div>
            `;
            document.body.appendChild(videoOverlay);
            document.getElementById('close-dom-video').onclick = () => {
                const el = document.getElementById('video-dom-layer');
                if (el) document.body.removeChild(el);
            };
            cleanup();
        });

        closeBtn.on('pointerdown', () => cleanup());

        // ESC handler
        this._escHandler = (e) => {
            if (e.key === 'Escape') {
                const domLayer = document.getElementById('video-dom-layer');
                if (domLayer) document.body.removeChild(domLayer);
                cleanup();
            }
        };
        window.addEventListener('keydown', this._escHandler);

        // Auto-resize
        this._resizeHandler = () => {
            if (this.popupUI) this.show(videoData, index, true, viewedVideos);
        };
        this.scene.scale.on('resize', this._resizeHandler);
    }

    destroy() {
        if (this._resizeHandler) {
            this.scene.scale.off('resize', this._resizeHandler);
            this._resizeHandler = null;
        }
        if (this._escHandler) {
            window.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
        if (this.popupUI) {
            this.popupUI.destroy(true);
            this.popupUI = null;
        }
    }
}
