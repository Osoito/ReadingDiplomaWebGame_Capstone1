import Phaser from 'phaser';
import ReadingState from '../state.js';
import worldmapImg from '../../assets/worldmap.png';
import pandaWorldImg from '../../assets/buddyAvatar/panda/panda_world.png';

class WorldMapScene extends Phaser.Scene {
    constructor() {
        super('WorldMap');
        this.isMinimapMaximized = false;
    }

    preload() {
        this.load.image('worldMap', worldmapImg);
        this.load.image('pandaWorld', pandaWorldImg);
    }

    create() {
        // 1. 基础尺寸和背景 (完全保留)
        let { width, height } = this.scale;
        const bg = this.add.image(0, 0, 'worldMap').setOrigin(0);
        const mapRatio = bg.width / bg.height;
        
        const setupBackground = () => {
            if (!this.cameras || !this.cameras.main) return;
            const currentW = this.scale.width;
            const currentH = this.scale.height;
            const fillScale = Math.max(currentW / bg.width, currentH / bg.height);
            const zoomScale = fillScale * 1.5; 
            bg.setScale(zoomScale);
            this.cameras.main.setBounds(0, 0, bg.displayWidth, bg.displayHeight);
            return zoomScale;
        };

        let currentZoomScale = setupBackground();

        // 2. 洲点位设置 (功能完整，无删改)
        const continentPositions = {
            arctic: { x: 450, y: 120, name: 'ARKTIS', mapKey: 'ArcticMap' }, 
            europe: { x: 700, y: 250, name: 'EUROOPPA', mapKey: 'EuropeMap' },
            asia: { x: 1000, y: 250, name: 'AASIA', mapKey: 'AsiaMap' },
            africa: { x: 650, y: 450, name: 'AFRIKKA', mapKey: 'AfricaMap' },
            northAmerica: { x: 200, y: 300, name: 'POHJOIS-AMERIKKA', mapKey: 'NorthAmericaMap' },
            southAmerica: { x: 350, y: 550, name: 'ETELÄ-AMERIKKA', mapKey: 'SouthAmericaMap' },
            oceania: { x: 1100, y: 600, name: 'OSEANIA', mapKey: 'OceaniaMap' },
            antarctica: { x: 800, y: 750, name: 'ETELÄMANNER', mapKey: 'AntarcticaMap' }
        };

        const pointGroup = this.add.group();
        const currentContinent = ReadingState.getCurrentContinent();
        const completedFlags = ReadingState._continentCompletedFlags || {};

        const renderPoints = () => {
            pointGroup.clear(true, true);
            // Stop any previous buddy bob tween
            if (this._buddyBobTween) {
                this._buddyBobTween.stop();
                this._buddyBobTween = null;
            }

            Object.entries(continentPositions).forEach(([key, pos]) => {
                const finalX = pos.x * currentZoomScale;
                const finalY = pos.y * currentZoomScale;
                const unlocked = ReadingState.mapUnlock[pos.mapKey] === true;
                const isCurrent = pos.mapKey === currentContinent;
                const isCompleted = !!completedFlags[pos.mapKey];

                let indicator;
                if (isCurrent && unlocked) {
                    // Current continent: panda boat with golden glow ring
                    const buddyScale = 0.08 * currentZoomScale;
                    const glowRadius = 35 * currentZoomScale;

                    // Pulsing glow circle behind panda
                    const glow = this.add.circle(finalX, finalY, glowRadius, 0xffd700, 0.25)
                        .setStrokeStyle(2, 0xffd700, 0.5);
                    pointGroup.add(glow);
                    this.tweens.add({
                        targets: glow,
                        scaleX: 1.3, scaleY: 1.3, alpha: 0.08,
                        duration: 1000, ease: 'Sine.easeInOut',
                        yoyo: true, repeat: -1
                    });

                    indicator = this.add.image(finalX, finalY, 'pandaWorld')
                        .setScale(buddyScale)
                        .setInteractive({ useHandCursor: true });
                    indicator.on('pointerdown', () => this.scene.start(pos.mapKey));
                    // Floating bob animation
                    this._buddyBobTween = this.tweens.add({
                        targets: indicator,
                        y: finalY - 8 * currentZoomScale,
                        duration: 1200,
                        ease: 'Sine.easeInOut',
                        yoyo: true,
                        repeat: -1
                    });

                    // Sparkle particles around panda
                    const sparkleChars = ['✨', '⭐', '💫'];
                    for (let i = 0; i < 3; i++) {
                        const angle = (i / 3) * Math.PI * 2;
                        const dist = (40 + Math.random() * 15) * currentZoomScale;
                        const sx = finalX + Math.cos(angle) * dist;
                        const sy = finalY + Math.sin(angle) * dist;
                        const sparkle = this.add.text(sx, sy, sparkleChars[i], {
                            fontSize: `${Math.round(12 * currentZoomScale)}px`
                        }).setOrigin(0.5).setAlpha(0);
                        pointGroup.add(sparkle);
                        this.tweens.add({
                            targets: sparkle,
                            alpha: { from: 0, to: 0.8 },
                            y: sy - 10 * currentZoomScale,
                            duration: 1500 + i * 400,
                            ease: 'Sine.easeInOut',
                            yoyo: true, repeat: -1,
                            delay: i * 500
                        });
                    }
                } else if (isCompleted && unlocked) {
                    // Completed continent: bouncy gold star
                    indicator = this.add.text(finalX, finalY, '⭐', {
                        fontSize: `${Math.round(32 * currentZoomScale)}px`,
                    }).setOrigin(0.5);
                    indicator.setInteractive({ useHandCursor: true });
                    indicator.on('pointerdown', () => this.scene.start(pos.mapKey));
                    // Gentle pulse animation
                    this.tweens.add({
                        targets: indicator,
                        scaleX: 1.15, scaleY: 1.15,
                        duration: 900, ease: 'Sine.easeInOut',
                        yoyo: true, repeat: -1
                    });
                } else if (unlocked) {
                    // Unlocked but not current, not completed: small gold dot
                    indicator = this.add.circle(finalX, finalY, 14 * currentZoomScale, 0xc4973a, 0.7);
                    indicator.setInteractive({ useHandCursor: true });
                    indicator.on('pointerdown', () => this.scene.start(pos.mapKey));
                } else {
                    // Locked: grey dot with lock icon
                    indicator = this.add.text(finalX, finalY, '🔒', {
                        fontSize: `${Math.round(20 * currentZoomScale)}px`,
                    }).setOrigin(0.5).setAlpha(0.5);
                }

                const txt = this.add.text(finalX, finalY + (55 * currentZoomScale), pos.name, {
                    fontSize: `${Math.round(16 * currentZoomScale)}px`,
                    color: unlocked ? '#ffffff' : '#888888',
                    backgroundColor: '#1e3a5f', padding: { x: 10, y: 5 }, fontStyle: 'bold'
                }).setOrigin(0.5);
                pointGroup.add(indicator);
                pointGroup.add(txt);
            });
        };
        renderPoints();

        // 3. UI elements — playful adventure style
        const uiBtnStyle = {
            fontSize: '20px', color: '#fdf6e3',
            backgroundColor: '#1e3a5f',
            padding: { x: 14, y: 8 },
            fontFamily: 'Nunito, sans-serif',
            fontStyle: 'bold',
            shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 3, fill: true }
        };

        const bookCountText = this.add.text(20, 20, `📚 KIRJAT: ${ReadingState.booksRead}/8`, uiBtnStyle)
            .setScrollFactor(0).setDepth(1000);

        const backBtn = this.add.text(this.scale.width - 20, 20, '🚪 POISTU', uiBtnStyle)
            .setOrigin(1, 0).setScrollFactor(0).setDepth(1000)
            .setInteractive({ useHandCursor: true });

        // Hover effect on back button
        backBtn.on('pointerover', () => backBtn.setBackgroundColor('#c4973a'));
        backBtn.on('pointerout',  () => backBtn.setBackgroundColor('#1e3a5f'));
        backBtn.on('pointerdown', () => { if (this.game.handleBackNavigation) this.game.handleBackNavigation(); });

        // 4. 小地图核心逻辑 (包含 Resize 适配)
        const getLayoutConfig = (isMaximized) => {
            const currentW = this.scale.width;
            const currentH = this.scale.height;
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
                targetX = (currentW - targetW) / 2;
                targetY = (currentH - targetH) / 2;
            } else {
                const minimapPct = currentW < 600 ? 0.35 : 0.25;
                targetW = currentW * minimapPct;
                targetH = targetW / mapRatio;
                targetX = currentW - targetW - 20;
                targetY = currentH - targetH - 20;
            }
            return { x: targetX, y: targetY, w: targetW, h: targetH };
        };

        const initial = getLayoutConfig(false);
        const minimapCamera = this.cameras.add(initial.x, initial.y, initial.w, initial.h).setBackgroundColor(0x000000);
        const miniFrame = this.add.graphics().setScrollFactor(0).setDepth(1001);
        const interactiveRegion = this.add.rectangle(initial.x, initial.y, initial.w, initial.h, 0x000000, 0).setOrigin(0).setScrollFactor(0).setDepth(1002).setInteractive({ useHandCursor: true });
        const toggleBtn = this.add.text(initial.x, initial.y - 35, '🔍 SUURENNA', { fontSize: '18px', fill: '#FFD700', fontStyle: 'bold', backgroundColor: '#1e3a5f', padding: 5 }).setScrollFactor(0).setDepth(1003).setInteractive({ useHandCursor: true });

        // ⭐ 解决中间矩形框的关键：让小地图不渲染 UI 元素和它自己的边框
        // 这样小地图里就只有干净的背景图和点位了
        minimapCamera.ignore([bookCountText, backBtn, miniFrame, interactiveRegion, toggleBtn]);

        const syncUI = () => {
            if (!minimapCamera.scene) return;
            minimapCamera.setZoom(minimapCamera.width / bg.displayWidth);
            minimapCamera.centerOn(bg.displayWidth / 2, bg.displayHeight / 2);
            miniFrame.clear();
            miniFrame.lineStyle(4, 0xFFD700, 1);
            miniFrame.strokeRect(minimapCamera.x, minimapCamera.y, minimapCamera.width, minimapCamera.height);
            interactiveRegion.setPosition(minimapCamera.x, minimapCamera.y);
            interactiveRegion.setDisplaySize(minimapCamera.width, minimapCamera.height);
            
            // 保持你要求的按钮向左偏移
            toggleBtn.setPosition(minimapCamera.x - 50, minimapCamera.y - 35);
            backBtn.setPosition(this.scale.width - 20, 20);
        };

        const onResize = (gameSize) => {
            currentZoomScale = setupBackground();
            renderPoints();
            const layout = getLayoutConfig(this.isMinimapMaximized);
            minimapCamera.setPosition(layout.x, layout.y);
            minimapCamera.setSize(layout.w, layout.h);
            syncUIWithHints();
        };

        this.scale.on('resize', onResize);
        this.events.once('shutdown', () => {
            this.scale.off('resize', onResize);
        });

        syncUI();

        // 5. Navigation hints (playful, auto-fade)
        const hintStyle = {
            fontSize: '15px', color: '#fdf6e3',
            backgroundColor: 'rgba(30,58,95,0.85)',
            padding: { x: 14, y: 8 },
            fontFamily: 'Nunito, sans-serif',
            fontStyle: 'italic',
            shadow: { offsetX: 0, offsetY: 1, color: '#000', blur: 2, fill: true }
        };

        // Main map hint - appears briefly on entry
        const mapHint = this.add.text(width / 2, height - 80, '🗺️ Klikkaa maanosan merkkiä aloittaaksesi seikkailun!', hintStyle)
            .setOrigin(0.5).setScrollFactor(0).setDepth(1000).setAlpha(0);
        minimapCamera.ignore(mapHint);

        // Minimap hint - below toggle button
        const miniHint = this.add.text(0, 0, '👆 Klikkaa pienoiskarttaa\nsiirtyäksesi kartalla', {
            ...hintStyle, fontSize: '12px', align: 'center'
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000).setAlpha(0);
        minimapCamera.ignore(miniHint);

        // Position miniHint below toggle on syncUI
        const origSyncUI = syncUI;
        const syncUIWithHints = () => {
            origSyncUI();
            miniHint.setPosition(
                minimapCamera.x + minimapCamera.width / 2,
                minimapCamera.y + minimapCamera.height + 8
            );
        };

        // Animate hints in then fade out
        this.tweens.add({
            targets: mapHint, alpha: 1,
            duration: 600, delay: 300, ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: mapHint, alpha: 0,
                    duration: 800, delay: 4000
                });
            }
        });
        this.tweens.add({
            targets: miniHint, alpha: 0.9,
            duration: 600, delay: 800, ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: miniHint, alpha: 0,
                    duration: 800, delay: 5000
                });
            }
        });

        syncUIWithHints();

        // 切换动画 (完全保留)
        const toggleMinimap = () => {
            this.isMinimapMaximized = !this.isMinimapMaximized;
            const target = getLayoutConfig(this.isMinimapMaximized);
            this.tweens.add({
                targets: minimapCamera,
                x: target.x, y: target.y, width: target.w, height: target.h,
                duration: 450, ease: 'Cubic.easeInOut',
                onUpdate: () => syncUI()
            });
            toggleBtn.setText(this.isMinimapMaximized ? '✖ SULJE' : '🔍 SUURENNA');
        };

        toggleBtn.on('pointerdown', (p) => { p.event.stopPropagation(); toggleMinimap(); });
        interactiveRegion.on('pointerdown', (pointer) => {
            const relX = (pointer.x - minimapCamera.x) / minimapCamera.width;
            const relY = (pointer.y - minimapCamera.y) / minimapCamera.height;
            this.cameras.main.pan(relX * bg.displayWidth, relY * bg.displayHeight, 500, 'Power2');
            if (this.isMinimapMaximized) toggleMinimap();
        });

        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown && !this.isMinimapMaximized) {
                this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x);
                this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y);
            }
        });

        this.cameras.main.centerOn(bg.displayWidth / 2, bg.displayHeight / 2);
    }
}

export default WorldMapScene;
