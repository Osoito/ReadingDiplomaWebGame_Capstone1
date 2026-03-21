import Phaser from 'phaser';
import ReadingState from '../state.js';
import { COLORS, DEPTHS, FONTS, uiScale as calcUiScale } from '../ui/constants.js';
import { preloadIcons, ICON_KEYS } from '../ui/icons.js';
import WaypointRenderer from '../managers/WaypointRenderer.js';
import PathRenderer from '../managers/PathRenderer.js';
import TokenManager from '../managers/TokenManager.js';
import BookFetcher from '../managers/BookFetcher.js';
import BookListModal from '../modals/BookListModal.js';
import VideoPopupModal from '../modals/VideoPopupModal.js';
import CelebrationModal from '../modals/CelebrationModal.js';

class BaseMapScene extends Phaser.Scene {

    constructor(key, assetKey, title) {
        super(key);
        this.assetKey = assetKey;
        this.title = title;
        this.LOGICAL_WIDTH = 1280;

        this.isDoingQuiz = false;

        this.videoCheckpoints = {
            3: {
                title: "Lukuvinkki: Visualisointi",
                url: "https://www.youtube.com/watch?v=qw3S-S708tE"
            },
            7: {
                title: "Lukuvinkki: Aktiivinen lukeminen",
                url: "https://www.youtube.com/watch?v=XjMv7DUtW8o"
            }
        };

        this.viewedVideos = new Set();
    }

    create() {
        const { width, height } = this.scale;

        // Managers
        this.waypointRenderer = new WaypointRenderer(this);
        this.pathRenderer = new PathRenderer();
        this.tokenManager = new TokenManager();
        this.bookListModal = new BookListModal(this);
        this.videoPopupModal = new VideoPopupModal(this);
        this.celebrationModal = new CelebrationModal(this);

        // Background
        this.bg = this.add.image(0, 0, this.assetKey).setOrigin(0);

        // Path graphics layer
        this.pathGraphics = this.add.graphics();
        this.pathGraphics.setDepth(DEPTHS.PATH);

        // Title text
        this.titleText = this.add.text(0, 0, this.title, {
            fontSize: '32px',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        this.titleText.setOrigin(0.5, 0);
        this.titleText.setScrollFactor(0);
        this.titleText.setDepth(DEPTHS.UI);

        // Back button (hidden, replaced by icon container in handleResize)
        this.backBtn = this.add.text(0, 0, '← TAKAISIN', {
            fontSize: '18px',
            color: '#fff',
            backgroundColor: '#1e3a5f',
            padding: 10
        });
        this.backBtn.setInteractive({ useHandCursor: true });
        this.backBtn.setScrollFactor(0);
        this.backBtn.setDepth(DEPTHS.UI);
        this.backBtn.on('pointerdown', () => {
            this.scene.stop(this.scene.key);
            this.scene.start('WorldMap');
        });

        // Book button (hidden, replaced by icon container in handleResize)
        this.bookBtn = this.add.text(20, height - 20, '📖 AVAA KIRJA', {
            fontSize: '28px',
            color: '#ffcc00',
            backgroundColor: '#1e3a5f',
            padding: 10
        });
        this.bookBtn.setOrigin(0, 1);
        this.bookBtn.setInteractive({ useHandCursor: true });
        this.bookBtn.setScrollFactor(0);
        this.bookBtn.setDepth(DEPTHS.UI);
        this.bookBtn.on('pointerdown', () => this._handleBookBtnClick());

        // Token
        const savedIndex = ReadingState.tokenPositions?.[this.scene.key] ?? 0;
        this.tokenManager.create(this, savedIndex);

        // Drag hint — centered, larger, semi-transparent
        const dLabel = this.add.text(0, 0, 'Vedä karttaa tutkiaksesi', {
            fontFamily: FONTS.BODY, fontSize: '22px', color: '#ffffff', fontStyle: 'bold'
        });
        const dIconSize = 28, dPadH = 16, dPadV = 12;
        const dW = dPadH + dIconSize + 8 + dLabel.width + dPadH;
        const dH = dPadV + Math.max(dLabel.height, dIconSize) + dPadV;
        const dBg = this.add.graphics();
        dBg.fillStyle(COLORS.NAVY, 0.45).fillRoundedRect(0, 0, dW, dH, 12);
        dBg.lineStyle(1, COLORS.GOLD, 0.4).strokeRoundedRect(0, 0, dW, dH, 12);
        const dIcon = this.add.image(dPadH + dIconSize / 2, dH / 2, ICON_KEYS.HAND_POINT)
            .setDisplaySize(dIconSize, dIconSize);
        dLabel.setPosition(dPadH + dIconSize + 8, dH / 2).setOrigin(0, 0.5);
        this.dragHint = this.add.container(width / 2 - dW / 2, height / 2 - dH / 2, [dBg, dIcon, dLabel])
            .setScrollFactor(0).setDepth(DEPTHS.UI);

        // Camera drag
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                this.cameras.main.stopFollow();
                this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
                this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
                if (this.dragHint && this.dragHint.active) {
                    this.tweens.add({ targets: this.dragHint, alpha: 0, duration: 500, onComplete: () => { if (this.dragHint) this.dragHint.destroy(); } });
                    this.dragHint = null;
                }
            }
        });

        // Audio context resume
        this.input.once('pointerdown', () => {
            if (this.sound.context && this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
        });

        // Scene resume listener
        this.events.on('resume', () => {
            this.bookListModal.destroy();
            this.time.delayedCall(100, () => {
                this.updateTokenPosition(true);
            });
        });

        // Init layout
        this.isReady = true;
        this.handleResize();

        this.scale.on('resize', this.handleResize, this);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scale.off('resize', this.handleResize, this);
            this.waypointRenderer.destroy();
            this.bookListModal.destroy();
            this.videoPopupModal.destroy();
            this.celebrationModal.destroy();
        });

        this.time.delayedCall(50, () => {
            this.updateTokenPosition(false);
        });
    }

    handleResize() {
        const { width, height } = this.scale;

        // Background cover fit
        const fillScale = Math.max(width / this.bg.width, height / this.bg.height);
        this.bg.setScale(fillScale);
        this.cameras.main.setBounds(0, 0, this.bg.displayWidth, this.bg.displayHeight);
        this.baseScale = this.bg.displayWidth / this.LOGICAL_WIDTH;
        const uiS = calcUiScale(width);

        // Recalculate point positions
        this.pointPositions = this.rawPoints.map(p => ({
            x: p.x * this.baseScale,
            y: p.y * this.baseScale
        }));

        // Render waypoints
        const currentIdx = this.tokenManager.lastPointIndex;
        this.waypointRenderer.render(
            this.pointPositions, this.baseScale, currentIdx,
            this.themeColor, this.videoCheckpoints,
            (videoData, index) => {
                if (this.tokenManager.lastPointIndex >= index) {
                    this.showVideoPopup(videoData, index, true);
                }
            }
        );

        // UI text sizes
        this.titleText.setFontSize(32 * uiS);
        const radius = Math.round(45 * uiS);

        // Hide text buttons, use icon containers
        this.bookBtn.setVisible(false);
        this.backBtn.setVisible(false);

        // Book icon button
        if (this.bookIconContainer) this.bookIconContainer.destroy();
        this.bookIconContainer = this.add.container(0, 0);

        const bookGlow = this.add.circle(0, 0, radius + 5, 0xffffff, 0.12);
        this.bookIconContainer.add(bookGlow);
        const bookBg = this.add.graphics();
        bookBg.lineStyle(5, COLORS.BROWN_DARK, 1).fillStyle(COLORS.GOLD_HOVER, 1);
        bookBg.fillCircle(0, 0, radius).strokeCircle(0, 0, radius);
        bookBg.lineStyle(2, 0xffffff, 0.5).strokeCircle(0, 0, radius * 0.88);
        this.bookIconContainer.add(bookBg);

        const bookImg = this.add.image(0, 0, ICON_KEYS.BOOK)
            .setDisplaySize(radius * 1.3, radius * 1.3).setOrigin(0.5);
        this.bookIconContainer.add(bookImg);

        const loadingIcon = this.add.image(0, 0, ICON_KEYS.HOURGLASS)
            .setDisplaySize(radius * 1.2, radius * 1.2).setOrigin(0.5).setVisible(false);
        loadingIcon.name = 'loadingIcon';
        this.bookIconContainer.add(loadingIcon);

        // Back icon button
        if (this.backIconContainer) this.backIconContainer.destroy();
        this.backIconContainer = this.add.container(0, 0);
        const backGlow = this.add.circle(0, 0, radius + 5, 0xffffff, 0.12);
        this.backIconContainer.add(backGlow);
        const backBg = this.add.graphics();
        backBg.lineStyle(5, COLORS.BACK_STROKE, 1).fillStyle(COLORS.NAVY, 1);
        backBg.fillCircle(0, 0, radius).strokeCircle(0, 0, radius);
        backBg.lineStyle(2, 0xffffff, 0.4).strokeCircle(0, 0, radius * 0.88);
        this.backIconContainer.add(backBg);
        const arrowG = this.add.graphics();
        arrowG.fillStyle(0xffffff, 1);
        const aw = radius * 0.6;
        arrowG.beginPath().moveTo(aw / 2, -aw * 0.8).lineTo(-aw * 0.7, 0).lineTo(aw / 2, aw * 0.8).closePath().fillPath();
        this.backIconContainer.add(arrowG);

        // Layout
        const isNarrow = width < 600;
        const margin = isNarrow ? 15 : 25;
        const backX = margin + radius, backY = margin + radius;
        const bookX = width - margin - radius, bookY = margin + radius;

        this.backIconContainer.setPosition(backX, backY);
        this.bookIconContainer.setPosition(bookX, bookY);
        this.titleText.setOrigin(0.5, 0).setPosition(width / 2, isNarrow ? backY + radius + 10 : 20);

        // Button interaction
        const setupBtn = (container, callback) => {
            container.setInteractive(new Phaser.Geom.Circle(0, 0, radius), Phaser.Geom.Circle.Contains);
            container.on('pointerover', () => container.setScale(1.1));
            container.on('pointerdown', () => container.setScale(0.85));
            container.on('pointerup', () => { container.setScale(1); callback(); });
            container.on('pointerout', () => container.setScale(1));
        };

        setupBtn(this.bookIconContainer, () => this._handleBookBtnClick());
        setupBtn(this.backIconContainer, () => {
            if (this.mapBgm) this.mapBgm.stop();
            this.scene.start('WorldMap');
        });

        this.bookIconContainer.setDepth(DEPTHS.UI).setScrollFactor(0);
        this.backIconContainer.setDepth(DEPTHS.UI).setScrollFactor(0);
        this.titleText.setDepth(DEPTHS.UI).setScrollFactor(0);

        // Token
        this.tokenManager.updateScale(this.baseScale);
        const curIdx = this.tokenManager.lastPointIndex;
        this.tokenManager.setPosition(this.pointPositions[curIdx].x, this.pointPositions[curIdx].y);
        this.updateTokenPosition(false);
    }

    _handleBookBtnClick() {
        const mapKey = this.scene.key;
        if (ReadingState._continentCompletedFlags?.[mapKey] === true) {
            this.showStoryQuiz();
        } else {
            this.showBookList();
        }
    }

    showBookList() {
        const mapKey = this.scene.key;
        const result = this.bookListModal.show(mapKey, async (book, key, mapCfg, isCompleted) => {
            if (!isCompleted) {
                ReadingState.mapSelectedBook[key] = book.id;
            }
            const bookData = await BookFetcher.fetchAndLaunch(
                this, book, mapCfg, isCompleted, this.bookIconContainer
            );
            this.launchReading(mapCfg, bookData);
        });
        if (result === 'completed') {
            this.showStoryQuiz();
        }
    }

    showVideoPopup(videoData, index, isManual) {
        this.videoPopupModal.show(videoData, index, isManual, this.viewedVideos);
    }

    showStoryQuiz() {
        const mapKey = this.scene.key;
        this.bookListModal.destroy();
        this.isDoingQuiz = true;

        if (window.openReactQuiz) {
            window.openReactQuiz(mapKey);
        } else {
            console.error("Critical: window.openReactQuiz is undefined!");
        }
    }

    showFinalCelebration() {
        this.celebrationModal.show(this.scene.key);
    }

    launchReading(config, bookData) {
        ReadingState.progress = ReadingState[config.storage] || 0;
        this.scene.pause();
        this.scene.launch('ReadingScene', {
            prevScene: this.scene.key,
            mapTitle: this.title,
            bookContent: bookData,
            bookId: bookData.id,
            readOnly: bookData.readOnly || false
        });
    }

    updateTokenPosition(animate = true) {
        const config = ReadingState.mapConfig[this.scene.key];
        const storageKey = config ? config.storage : 'progress';

        const mapSelectedBook = ReadingState.mapSelectedBook || {};
        const currentBookId = mapSelectedBook[this.scene.key];

        let currentProg = 0;
        if (currentBookId) {
            currentProg = ReadingState.bookProgress[currentBookId] || 0;
        } else {
            currentProg = ReadingState[storageKey] || 0;
        }

        let targetIndex = Math.floor((currentProg / 100) * (this.pointPositions.length - 1));
        targetIndex = Phaser.Math.Clamp(targetIndex, 0, this.pointPositions.length - 1);

        // Draw path
        this.pathRenderer.draw(this.pathGraphics, this.pointPositions, targetIndex, this.themeColor);

        if (animate) {
            const currentIndex = this.tokenManager.lastPointIndex;
            this.tokenManager.animateAlongPath(
                this, this.pointPositions, currentIndex, targetIndex, this.scene.key,
                (finalIdx) => this.checkCheckpointEvents(finalIdx)
            );
        } else {
            this.tokenManager.snapToPoint(this, this.pointPositions, targetIndex, this.scene.key);
            this.checkCheckpointEvents(targetIndex);
        }
    }

    checkCheckpointEvents(index) {
        if (this.videoCheckpoints[index]) {
            this.showVideoPopup(this.videoCheckpoints[index], index, false);
        }

        if (index === this.pointPositions.length - 1) {
            if (!ReadingState._continentCompletedFlags) {
                ReadingState._continentCompletedFlags = {};
            }
            const mapKey = this.scene.key;
            if (!ReadingState._continentCompletedFlags[mapKey] && !this.isDoingQuiz) {
                this.showStoryQuiz();
            }
        }
    }
}

export default BaseMapScene;
