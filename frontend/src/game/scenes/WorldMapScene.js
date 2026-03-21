import Phaser from 'phaser';
import ReadingState from '../state.js';
import { preloadIcons, ICON_KEYS } from '../ui/icons.js';
import { COLORS, FONTS, uiScale as calcUiScale } from '../ui/constants.js';
import worldmapImg from '../../assets/worldmap.png';
import worldmapSimpleImg from '../../assets/worldmap_simple.png';
import pandaWorldImg from '../../assets/buddyAvatar/panda/panda_world.png';

class WorldMapScene extends Phaser.Scene {
    constructor() {
        super('WorldMap');
        this.isMinimapMaximized = false;
        this.ORIGINAL_MAP_WIDTH = 1280;
        // Declare in the constructor first
        this.pointGroup = null;
        this.pandaBuddy = null;
        this.pandaFloatTween = null;
    }

    preload() {
        this.load.image('worldMap', worldmapImg);
        this.load.image('worldMapSimple', worldmapSimpleImg);
        this.load.image('pandaWorld', pandaWorldImg);
        preloadIcons(this);
    }

    create() {
        // --- 1. Background layer ---
        const bg = this.add.image(0, 0, 'worldMap').setOrigin(0);
        const bgSimple = this.add.image(0, 0, 'worldMapSimple').setOrigin(0);
        
        const setupBackgrounds = () => {
            if (!this.cameras || !this.cameras.main || !bg.active) return;
            const { width: currentW, height: currentH } = this.scale;
            const fillScale = Math.max(currentW / bg.width, currentH / bg.height);
            const mainScale = fillScale * 1.5;
            bg.setScale(mainScale);
            bgSimple.setDisplaySize(bg.displayWidth, bg.displayHeight);
            this.cameras.main.setBounds(0, 0, bg.displayWidth, bg.displayHeight);
            return bg.displayWidth / this.ORIGINAL_MAP_WIDTH;
        };

        let currentZoomScale = setupBackgrounds();

        // --- 2. Point Setting ---
        const continentPositions = {
            arctic: { x: 450, y: 120, name: 'ARKTIS', mapKey: 'ArcticMap' }, 
            europe: { x: 700, y: 250, name: 'EUROOPPA', mapKey: 'EuropeMap' },
            asia: { x: 1000, y: 250, name: 'AASIA', mapKey: 'AsiaMap' },
            africa: { x: 650, y: 450, name: 'AFRIKKA', mapKey: 'AfricaMap' },
            northAmerica: { x: 200, y: 300, name: 'POHJOIS-AMERIKKA', mapKey: 'NorthAmericaMap' },
            southAmerica: { x: 350, y: 550, name: 'ETELÄ-AMERIKKA', mapKey: 'SouthAmericaMap' },
            oceania: { x: 1100, y: 600, name: 'OSEANIA', mapKey: 'OceaniaMap' },
            antarctica: { x: 750, y: 700, name: 'ETELÄMANNER', mapKey: 'AntarcticaMap' }
        };

        // ⭐ Modification: Change to a class attribute to ensure it is always accessible throughout the class's lifetime.
        this.pointGroup = this.add.group();
        
        // Find the latest unlocked continent (highest index in mapOrder)
        const getLatestUnlockedMapKey = () => {
            let latest = null;
            for (const mapKey of ReadingState.mapOrder) {
                if (ReadingState.mapUnlock[mapKey]) latest = mapKey;
            }
            return latest;
        };

        const renderPoints = () => {
            // ⭐ Added multiple defense checks
            if (!this.pointGroup || !this.pointGroup.scene || !this.pointGroup.active) return;

            this.pointGroup.clear(true, true);

            // Destroy old panda buddy
            if (this.pandaBuddy) { this.pandaBuddy.destroy(); this.pandaBuddy = null; }
            if (this.pandaFloatTween) { this.pandaFloatTween.remove(); this.pandaFloatTween = null; }

            const latestMapKey = getLatestUnlockedMapKey();

            Object.entries(continentPositions).forEach(([key, pos]) => {
                const finalX = pos.x * currentZoomScale;
                const finalY = pos.y * currentZoomScale;
                const unlocked = ReadingState.mapUnlock[pos.mapKey] === true;
                const isCurrent = pos.mapKey === latestMapKey;

                // Don't draw a circle dot for the current continent — panda replaces it
                if (!isCurrent) {
                    const btn = this.add.circle(finalX, finalY, 40 * currentZoomScale, unlocked ? 0x00ff00 : 0x555555, 0.4);
                    if (unlocked) btn.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start(pos.mapKey));
                    this.pointGroup.add(btn);
                }

                const txt = this.add.text(finalX, finalY + (55 * currentZoomScale), pos.name, {
                    fontFamily: '"Cinzel", serif', fontSize: `${Math.round(16 * currentZoomScale)}px`,
                    color: unlocked ? '#ffffff' : '#bbbbbb', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
                }).setOrigin(0.5);

                this.pointGroup.add(txt);

                // Place panda buddy on the latest unlocked continent
                if (isCurrent) {
                    const pandaScale = currentZoomScale * 0.12;
                    this.pandaBuddy = this.add.image(finalX, finalY, 'pandaWorld')
                        .setScale(pandaScale).setDepth(10);
                    this.pandaBuddy.setInteractive({ useHandCursor: true })
                        .on('pointerdown', () => this.scene.start(pos.mapKey));
                    this.pointGroup.add(this.pandaBuddy);

                    // Floating bob animation
                    this.pandaFloatTween = this.tweens.add({
                        targets: this.pandaBuddy,
                        y: finalY - 12 * currentZoomScale,
                        duration: 1200,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            });
        };
        renderPoints();

        // --- 3. UI Elements (badge style) ---
        const { width: initW } = this.scale;
        const uiS = calcUiScale(initW);
        const badgeFontSize = Math.round(20 * uiS);
        const badgePadH = Math.round(14 * uiS);
        const badgePadV = Math.round(10 * uiS);
        const badgeIconSize = Math.round(22 * uiS);
        const badgeRadius = 12;
        const margin = 15;

        // Helper: create a badge container with bg + icon + text
        const makeBadge = (x, y, text, iconKey, bgColor, originX) => {
            const label = this.add.text(0, 0, text, {
                fontFamily: FONTS.BODY, fontSize: badgeFontSize + 'px', color: '#ffffff', fontStyle: 'bold'
            });
            const totalW = badgePadH + badgeIconSize + 8 + label.width + badgePadH;
            const totalH = badgePadV + Math.max(label.height, badgeIconSize) + badgePadV;

            const bg = this.add.graphics();
            bg.fillStyle(bgColor, 0.85).fillRoundedRect(0, 0, totalW, totalH, badgeRadius);
            bg.lineStyle(2, COLORS.GOLD, 1).strokeRoundedRect(0, 0, totalW, totalH, badgeRadius);

            const icon = this.add.image(badgePadH + badgeIconSize / 2, totalH / 2, iconKey)
                .setDisplaySize(badgeIconSize, badgeIconSize);
            label.setPosition(badgePadH + badgeIconSize + 8, totalH / 2).setOrigin(0, 0.5);

            const container = this.add.container(x, y, [bg, icon, label]).setScrollFactor(0).setDepth(2000);
            if (originX === 1) container.setX(x - totalW);
            container._badgeWidth = totalW;
            return { container, label };
        };

        const kirjat = makeBadge(margin, margin, `KIRJAT: ${ReadingState.booksRead}/8`, ICON_KEYS.BOOK, COLORS.NAVY, 0);
        this.bookCountText = kirjat.container;
        this.bookCountLabel = kirjat.label;

        const poistu = makeBadge(initW - margin, margin, 'POISTU', ICON_KEYS.CROSS, COLORS.BACK_FILL, 1);
        this.backBtn = poistu.container;
        this.backBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.backBtn._badgeWidth, badgePadV * 2 + badgeIconSize), Phaser.Geom.Rectangle.Contains);
        this.backBtn.on('pointerdown', () => { this.backBtn.setScale(0.9); });
        this.backBtn.on('pointerup', () => { this.backBtn.setScale(1); if (this.game.handleBackNavigation) this.game.handleBackNavigation(); });
        this.backBtn.on('pointerout', () => { this.backBtn.setScale(1); });

        // --- 4. Minimap Configuration ---
        const getLayoutConfig = (isMaximized) => {
            const { width: currentW, height: currentH } = this.scale;
            if (!bg || !bg.active) return { x:0, y:0, w:100, h:100 };
            const mapRatio = bg.width / bg.height;
            const safePaddingBottom = 25;
            const sidePadding = 20;
            let targetW, targetH, targetX, targetY;
            if (isMaximized) {
                const padding = 60;
                const availW = currentW - padding * 2;
                const availH = currentH - padding * 2;
                if (availW / availH > mapRatio) {
                    targetH = availH; targetW = availH * mapRatio;
                } else {
                    targetW = availW; targetH = availW / mapRatio;
                }
                targetX = (currentW - targetW) / 2; targetY = (currentH - targetH) / 2;
            } else {
                targetW = currentW * 0.22;
                if (targetW < 140) targetW = 140; 
                targetH = targetW / mapRatio;
                targetX = currentW - targetW - sidePadding;
                targetY = currentH - targetH - safePaddingBottom;
            }
            return { x: targetX, y: targetY, w: targetW, h: targetH };
        };

        const initial = getLayoutConfig(false);
        this.minimapCamera = this.cameras.add(initial.x, initial.y, initial.w, initial.h).setBackgroundColor(0x000000);
        
        this.cameras.main.ignore(bgSimple);
        this.minimapCamera.ignore(bg);

        this.viewRectGraphics = this.add.graphics().setDepth(1005).setScrollFactor(0);
        this.miniFrame = this.add.graphics().setScrollFactor(0).setDepth(1001);
        this.interactiveRegion = this.add.rectangle(initial.x, initial.y, initial.w, initial.h, 0, 0).setOrigin(0).setScrollFactor(0).setDepth(1002).setInteractive({ useHandCursor: true });
        
        const toggleIconSize = 28;
        const togglePadH = 10;
        const togglePadV = 6;
        this.toggleLabel = this.add.text(0, 0, 'SUURENNA', {
            fontFamily: FONTS.BODY, fontSize: '17px', color: '#ffffff', fontStyle: 'bold'
        });
        const toggleW = togglePadH + toggleIconSize + 6 + this.toggleLabel.width + togglePadH;
        const toggleH = togglePadV + Math.max(this.toggleLabel.height, toggleIconSize) + togglePadV;

        this.toggleBg = this.add.graphics();
        this.toggleBg.fillStyle(COLORS.NAVY, 0.75).fillRoundedRect(0, 0, toggleW, toggleH, 10);
        this.toggleBg.lineStyle(1, COLORS.GOLD, 0.8).strokeRoundedRect(0, 0, toggleW, toggleH, 10);

        this.toggleIcon = this.add.image(togglePadH + toggleIconSize / 2, toggleH / 2, ICON_KEYS.SEARCH)
            .setDisplaySize(toggleIconSize, toggleIconSize);
        this.toggleLabel.setPosition(togglePadH + toggleIconSize + 6, toggleH / 2).setOrigin(0, 0.5);

        this.toggleBtnContainer = this.add.container(initial.x, initial.y - toggleH - 8, [this.toggleBg, this.toggleIcon, this.toggleLabel])
            .setScrollFactor(0).setDepth(1003);
        this.toggleBtnContainer.setSize(toggleW, toggleH);
        this.toggleBtnContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, toggleW, toggleH), Phaser.Geom.Rectangle.Contains);
        this.toggleBtnContainer.input.cursor = 'pointer';
        // Keep legacy reference for ignore list
        this.toggleBtn = this.toggleBtnContainer;

        const tipIconSize = 20;
        const tipPadH = 10;
        const tipPadV = 8;
        const tipLabel = this.add.text(0, 0, 'Klikkaa maanosaa tutkiaksesi!', {
            fontFamily: FONTS.BODY, fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        });
        const tipW = tipPadH + tipIconSize + 6 + tipLabel.width + tipPadH;
        const tipH = tipPadV + Math.max(tipLabel.height, tipIconSize) + tipPadV;
        const tipBg = this.add.graphics();
        tipBg.fillStyle(COLORS.NAVY, 0.85).fillRoundedRect(0, 0, tipW, tipH, 8);
        tipBg.lineStyle(1, COLORS.GOLD, 0.6).strokeRoundedRect(0, 0, tipW, tipH, 8);
        const tipIcon = this.add.image(tipPadH + tipIconSize / 2, tipH / 2, ICON_KEYS.HAND_POINT)
            .setDisplaySize(tipIconSize, tipIconSize);
        tipLabel.setPosition(tipPadH + tipIconSize + 6, tipH / 2).setOrigin(0, 0.5);

        this.tipContainer = this.add.container(initial.x - tipW - 10, initial.y + initial.h / 2 - tipH / 2, [tipBg, tipIcon, tipLabel])
            .setScrollFactor(0).setDepth(5000);
        this.tipText = this.tipContainer;

        this.minimapCamera.ignore([this.bookCountText, this.backBtn, this.miniFrame, this.interactiveRegion, this.toggleBtn, this.viewRectGraphics, this.tipText]);

        const syncUI = () => {
            if (!this.scene.isActive() || !this.minimapCamera || !this.minimapCamera.scene || !bg || !bg.active) return;

            const ratio = this.minimapCamera.width / bg.displayWidth;
            this.minimapCamera.setZoom(ratio);
            this.minimapCamera.centerOn(bg.displayWidth / 2, bg.displayHeight / 2);
            
            this.miniFrame.clear().lineStyle(4, 0x1A237E, 1).strokeRect(this.minimapCamera.x, this.minimapCamera.y, this.minimapCamera.width, this.minimapCamera.height);
            this.interactiveRegion.setPosition(this.minimapCamera.x, this.minimapCamera.y).setDisplaySize(this.minimapCamera.width, this.minimapCamera.height);
            this.toggleBtn.setPosition(this.minimapCamera.x, this.minimapCamera.y - this.toggleBtn.height - 8);
            
            if (this.tipText && this.tipText.active) {
                const tipW = this.tipText.width || 200;
                const tipH = this.tipText.height || 30;
                this.tipText.setPosition(this.minimapCamera.x - tipW - 10, this.minimapCamera.y + this.minimapCamera.height / 2 - tipH / 2);
                this.tipText.setVisible(!this.isMinimapMaximized);
            }

            this.viewRectGraphics.clear();
            if (!this.isMinimapMaximized) {
                const mainCam = this.cameras.main;
                if (mainCam) {
                    const vW = mainCam.width * ratio; const vH = mainCam.height * ratio;
                    const vX = this.minimapCamera.x + (mainCam.scrollX * ratio);
                    const vY = this.minimapCamera.y + (mainCam.scrollY * ratio);
                    this.viewRectGraphics.lineStyle(2, 0xffffff, 0.7).strokeRect(vX, vY, vW, vH);
                    this.viewRectGraphics.fillStyle(0xffffff, 0.15).fillRect(vX, vY, vW, vH);
                }
            }
        };

        const onResize = () => {
            // ⭐ Core Defense: Never run logic if the scenario is not in an Active state.
            if (!this.scene.isActive() || !bg || !bg.active) return;

            currentZoomScale = setupBackgrounds();
            renderPoints();
            
            const layout = getLayoutConfig(this.isMinimapMaximized);
            
            if (this.backBtn && this.backBtn.active) {
                this.backBtn.setX(this.scale.width - margin - this.backBtn._badgeWidth);
            }

            if (this.minimapCamera && this.minimapCamera.scene) {
                this.minimapCamera.setPosition(layout.x, layout.y).setSize(layout.w, layout.h);
            }
            syncUI();
        };

        this.scale.on('resize', onResize);
        this.events.on('update', syncUI);

        // Clean up event listeners to prevent memory leaks and zombie callbacks
        this.events.on('shutdown', () => {
            this.scale.off('resize', onResize);
        });

        const toggleMinimap = () => {
            if (!this.minimapCamera || !this.minimapCamera.scene) return;
            this.isMinimapMaximized = !this.isMinimapMaximized;
            const target = getLayoutConfig(this.isMinimapMaximized);
            this.tweens.add({
                targets: this.minimapCamera,
                x: target.x, y: target.y, width: target.w, height: target.h,
                duration: 450, ease: 'Cubic.easeInOut'
            });
            this.toggleIcon.setTexture(this.isMinimapMaximized ? ICON_KEYS.CROSS : ICON_KEYS.SEARCH);
            this.toggleLabel.setText(this.isMinimapMaximized ? 'SULJE' : 'SUURENNA');
        };

        this.toggleBtn.on('pointerdown', (p) => { p.event.stopPropagation(); toggleMinimap(); });

        let pressX, pressY;
        this.interactiveRegion.on('pointerdown', (p) => { 
            pressX = p.x; pressY = p.y; 
            if (this.tipText && this.tipText.active) this.tipText.destroy();
        });
        
        this.interactiveRegion.on('pointerup', (p) => {
            const dist = Phaser.Math.Distance.Between(pressX, pressY, p.x, p.y);
            if (dist < 10) {
                if (this.isMinimapMaximized) {
                    toggleMinimap();
                } else {
                    const r = this.add.circle(p.x, p.y, 2, 0xff0000, 0.6).setScrollFactor(0).setDepth(3000);
                    this.tweens.add({ targets: r, scale: 12, alpha: 0, duration: 300, onComplete: () => r.destroy() });
                    const relX = (p.x - this.minimapCamera.x) / this.minimapCamera.width;
                    const relY = (p.y - this.minimapCamera.y) / this.minimapCamera.height;
                    this.cameras.main.pan(relX * bg.displayWidth, relY * bg.displayHeight, 500, 'Power2');
                }
            }
        });

        // Drag hint
        const dragLabel = this.add.text(0, 0, 'Vedä karttaa tutkiaksesi', {
            fontFamily: FONTS.BODY, fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        });
        const dragIconSize = 20;
        const dPadH = 10, dPadV = 8;
        const dragW = dPadH + dragIconSize + 6 + dragLabel.width + dPadH;
        const dragH = dPadV + Math.max(dragLabel.height, dragIconSize) + dPadV;
        const dragBg = this.add.graphics();
        dragBg.fillStyle(COLORS.NAVY, 0.85).fillRoundedRect(0, 0, dragW, dragH, 8);
        dragBg.lineStyle(1, COLORS.GOLD, 0.6).strokeRoundedRect(0, 0, dragW, dragH, 8);
        const dragIcon = this.add.image(dPadH + dragIconSize / 2, dragH / 2, ICON_KEYS.HAND_POINT)
            .setDisplaySize(dragIconSize, dragIconSize);
        dragLabel.setPosition(dPadH + dragIconSize + 6, dragH / 2).setOrigin(0, 0.5);
        this.dragHint = this.add.container(initW / 2 - dragW / 2, this.scale.height - 80, [dragBg, dragIcon, dragLabel])
            .setScrollFactor(0).setDepth(2000);
        this.minimapCamera.ignore(this.dragHint);

        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown && !this.isMinimapMaximized) {
                this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x);
                this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y);
                if (this.dragHint && this.dragHint.active) {
                    this.tweens.add({ targets: this.dragHint, alpha: 0, duration: 500, onComplete: () => { if (this.dragHint) this.dragHint.destroy(); } });
                    this.dragHint = null;
                }
            }
        });

        this.cameras.main.centerOn(bg.displayWidth / 2, bg.displayHeight / 2);
    }
}

export default WorldMapScene;