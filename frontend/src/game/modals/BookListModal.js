import Phaser from 'phaser';
import ReadingState from '../state.js';
import { DEPTHS, CSS_COLORS, FONTS } from '../ui/constants.js';

export default class BookListModal {
    constructor(scene) {
        this.scene = scene;
        this.listUI = null;
        this._resizeHandler = null;
        this._listEnableTime = 0;
    }

    show(mapKey, onBookSelected) {
        this._listEnableTime = Date.now();
        const mapCfg = ReadingState.mapConfig[mapKey];
        const globalBooks = ReadingState.globalBooks;
        const completedBookIds = ReadingState.completedBookIds || {};
        const mapSelectedBook = ReadingState.mapSelectedBook || {};
        const currentBookId = mapSelectedBook[mapKey] || null;

        if (!mapCfg || !globalBooks) return;

        if (ReadingState._continentCompletedFlags?.[mapKey] === true) {
            return 'completed';
        }

        const { width, height } = this.scene.scale;
        const isMobile = !this.scene.sys.game.device.os.desktop;
        const uiScale = Phaser.Math.Clamp(width / 1200, 0.8, 1.1);

        this.destroy();

        this.listUI = this.scene.add.container(0, 0).setDepth(DEPTHS.BOOK_LIST).setScrollFactor(0);

        // Overlay
        const overlay = this.scene.add.rectangle(0, 0, width, height, 0x0a192f, 0.9)
            .setOrigin(0).setScrollFactor(0).setInteractive();
        this.listUI.add(overlay);

        const titleY = 50 * uiScale;
        const title = this.scene.add.text(width / 2, titleY, "Valitse klassikkokirja", {
            fontSize: `${32 * uiScale}px`,
            color: CSS_COLORS.GOLD,
            fontFamily: FONTS.HEADING,
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);
        this.listUI.add(title);

        const closeBtnY = titleY + (55 * uiScale);
        const closeBtn = this.scene.add.text(width / 2, closeBtnY, "[ PERUUTA ]", {
            fontSize: `${20 * uiScale}px`,
            color: CSS_COLORS.WHITE,
            backgroundColor: CSS_COLORS.NAVY,
            padding: { x: 20, y: 10 },
            fontFamily: FONTS.BODY
        }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true }).setScrollFactor(0);

        closeBtn.on('pointerdown', () => this.destroy());
        this.listUI.add(closeBtn);

        // Scroll area
        const listY = closeBtnY + closeBtn.height + (25 * uiScale);
        const bottomSafety = isMobile ? 120 : 40;
        const viewH = height - listY - bottomSafety;

        const scrollContainer = this.scene.add.container(0, listY).setScrollFactor(0);
        this.listUI.add(scrollContainer);

        const scrollHitArea = this.scene.add.rectangle(width / 2, listY + viewH / 2, width, viewH, 0x000000, 0)
            .setInteractive().setScrollFactor(0);
        this.listUI.add(scrollHitArea);

        this.listUI.bringToTop(closeBtn);
        this.listUI.bringToTop(title);

        const maskG = this.scene.add.graphics().setScrollFactor(0)
            .fillStyle(0xffffff, 1).fillRect(0, listY, width, viewH).setVisible(false);
        scrollContainer.setMask(maskG.createGeometryMask());

        const availableBooks = globalBooks.map(book => ({
            ...book,
            isCompleted: !!completedBookIds[book.id],
            isCurrent: book.id === currentBookId
        }));

        // Render book items
        availableBooks.forEach((book, idx) => {
            const itemH = 100 * uiScale;
            const y = idx * itemH;
            let bg = 0x1e3a5f, bd = 0xc4973a, a = 1;
            if (book.isCompleted) { bg = 0x1a2a44; bd = 0x4a5568; a = 0.6; }
            if (book.isCurrent) { bg = 0x2d4a77; bd = 0xffffff; }

            const btnBg = this.scene.add.rectangle(width / 2, y + itemH / 2, width * 0.8, itemH * 0.9, bg, a)
                .setStrokeStyle(2, bd).setScrollFactor(0);

            const text = this.scene.add.text(width * 0.15, y + itemH / 2, `${book.title}\nBy: ${book.author}`, {
                fontSize: `${18 * uiScale}px`,
                color: book.isCompleted ? CSS_COLORS.GREY : CSS_COLORS.PARCHMENT,
                fontFamily: FONTS.BODY
            }).setOrigin(0, 0.5).setScrollFactor(0);

            const pct = ReadingState.bookProgress[book.id] || 0;
            const pctText = this.scene.add.text(width * 0.85, y + itemH / 2,
                book.isCompleted ? "✔ DONE" : `${pct}%`, {
                    fontSize: `${20 * uiScale}px`,
                    color: book.isCompleted ? '#00ff88' : CSS_COLORS.GOLD,
                    fontFamily: FONTS.BODY,
                    fontWeight: 'bold'
                }).setOrigin(1, 0.5).setScrollFactor(0);

            scrollContainer.add([btnBg, text, pctText]);
        });

        // Scroll logic
        const contentH = availableBooks.length * (100 * uiScale);
        const maxY = listY;
        const minY = contentH <= viewH ? maxY : listY - (contentH - viewH);
        let dragging = false, startY = 0, lastD = 0, vel = 0, touchStartTime = 0, rawStartY = 0;

        scrollHitArea.on('wheel', (pointer, deltaX, deltaY) => {
            scrollContainer.y = Phaser.Math.Clamp(scrollContainer.y - deltaY * 0.5, minY, maxY);
        });

        scrollHitArea.on('pointerdown', p => {
            dragging = true;
            startY = p.y;
            rawStartY = p.y;
            touchStartTime = Date.now();
            vel = 0;
        });

        scrollHitArea.on('pointermove', p => {
            if (!dragging) return;
            const d = (p.y - startY) * (isMobile ? 1.5 : 1);
            startY = p.y;
            scrollContainer.y = Phaser.Math.Clamp(scrollContainer.y + d, minY, maxY);
            lastD = d;
        });

        scrollHitArea.on('pointerup', p => {
            dragging = false;
            const duration = Date.now() - touchStartTime;
            const totalDist = Math.abs(p.y - rawStartY);

            if (totalDist < 10 && duration < 300) {
                const localY = p.y - scrollContainer.y;
                const bookIdx = Math.floor(localY / (100 * uiScale));

                if (bookIdx >= 0 && bookIdx < availableBooks.length) {
                    const book = availableBooks[bookIdx];
                    if (Date.now() - this._listEnableTime > 400) {
                        this.destroy();
                        if (onBookSelected) {
                            onBookSelected(book, mapKey, mapCfg, book.isCompleted);
                        }
                    }
                }
            } else {
                vel = isMobile ? lastD * 1.8 : lastD;
                this.scene.time.addEvent({
                    delay: 16, repeat: 50,
                    callback: () => {
                        if (!this.listUI) return;
                        if (Math.abs(vel) < 0.2) return;
                        scrollContainer.y = Phaser.Math.Clamp(scrollContainer.y + vel, minY, maxY);
                        vel *= 0.95;
                    }
                });
            }
        });

        // Auto-resize
        if (this._resizeHandler) {
            this.scene.scale.off('resize', this._resizeHandler, this.scene);
        }
        this._resizeHandler = () => { if (this.listUI) this.show(mapKey, onBookSelected); };
        this.scene.scale.on('resize', this._resizeHandler, this.scene);
    }

    destroy() {
        if (this._resizeHandler) {
            this.scene.scale.off('resize', this._resizeHandler, this.scene);
            this._resizeHandler = null;
        }
        if (this.listUI) {
            this.listUI.destroy(true);
            this.listUI = null;
        }
    }
}
