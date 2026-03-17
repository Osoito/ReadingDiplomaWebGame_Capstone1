import Phaser from 'phaser';
import ReadingState from '../state.js';
import worldmapImg from '../../assets/worldmap.png'; 
import worldmapSimpleImg from '../../assets/worldmap_simple.png'; 

class WorldMapScene extends Phaser.Scene {
    constructor() {
        super('WorldMap');
        this.isMinimapMaximized = false;
        this.ORIGINAL_MAP_WIDTH = 1280; 
        // 在构造函数里先声明
        this.pointGroup = null;
    }

    preload() {
        this.load.image('worldMap', worldmapImg);
        this.load.image('worldMapSimple', worldmapSimpleImg);
    }

    create() {
        // --- 1. 背景层 ---
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

        // --- 2. 点位设置 ---
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

        // ⭐ 修改：改为类的属性，确保生命周期内永远可访问
        this.pointGroup = this.add.group();
        
        const renderPoints = () => {
            // ⭐ 增加多重防御检查
            if (!this.pointGroup || !this.pointGroup.scene || !this.pointGroup.active) return;

            this.pointGroup.clear(true, true);
            Object.entries(continentPositions).forEach(([key, pos]) => {
                const finalX = pos.x * currentZoomScale;
                const finalY = pos.y * currentZoomScale;
                const unlocked = ReadingState.mapUnlock[pos.mapKey] === true;
                
                const btn = this.add.circle(finalX, finalY, 40 * currentZoomScale, unlocked ? 0x00ff00 : 0x555555, 0.4);
                if (unlocked) btn.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start(pos.mapKey));
                
                const txt = this.add.text(finalX, finalY + (55 * currentZoomScale), pos.name, {
                    fontFamily: '"Cinzel", serif', fontSize: `${Math.round(16 * currentZoomScale)}px`,
                    color: unlocked ? '#ffffff' : '#bbbbbb', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
                }).setOrigin(0.5);
                
                this.pointGroup.add(btn);
                this.pointGroup.add(txt);
            });
        };
        renderPoints();

        // --- 3. UI 元素 ---
        const uiStyle = { 
            fontFamily: '"Cinzel", serif', fontSize: '24px', fill: '#1A237E', 
            stroke: '#ffffff', strokeThickness: 5, fontStyle: 'bold',
            shadow: { offsetX: 2, offsetY: 2, color: '#1A237E80', blur: 3, fill: true }
        };

        this.bookCountText = this.add.text(20, 20, `KIRJAT: ${ReadingState.booksRead}/8`, uiStyle).setScrollFactor(0).setDepth(2000);
        this.backBtn = this.add.text(this.scale.width - 20, 20, 'POISTU', uiStyle).setOrigin(1, 0).setScrollFactor(0).setDepth(2000).setInteractive({ useHandCursor: true });
        this.backBtn.on('pointerdown', () => { if (this.game.handleBackNavigation) this.game.handleBackNavigation(); });

        // --- 4. 小地图配置 ---
        const getLayoutConfig = (isMaximized) => {
            const { width: currentW, height: currentH } = this.scale;
            if (!bg || !bg.active) return { x:0, y:0, w:100, h:100 };
            const mapRatio = bg.width / bg.height;
            const safePaddingBottom = currentH * 0.15; 
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
        
        this.toggleBtn = this.add.text(initial.x, initial.y - 35, '🔍 SUURENNA', { 
            fontFamily: '"Cinzel", serif', fontSize: '18px', fill: '#1A237E', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 4, padding: 5 
        }).setScrollFactor(0).setDepth(1003).setInteractive({ useHandCursor: true });

        this.tipText = this.add.text(initial.x - 20, initial.y + initial.h / 2, 'NAPAUTA 👉', {
            fontFamily: '"Cinzel", serif', fontSize: '32px', color: '#ff0000', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 5,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(5000);

        this.tweens.add({
            targets: this.tipText,
            alpha: { from: 1, to: 0.5 },
            x: initial.x - 40, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'      
        });

        this.minimapCamera.ignore([this.bookCountText, this.backBtn, this.miniFrame, this.interactiveRegion, this.toggleBtn, this.viewRectGraphics, this.tipText]);

        const syncUI = () => {
            if (!this.scene.isActive() || !this.minimapCamera || !this.minimapCamera.scene || !bg || !bg.active) return;

            const ratio = this.minimapCamera.width / bg.displayWidth;
            this.minimapCamera.setZoom(ratio);
            this.minimapCamera.centerOn(bg.displayWidth / 2, bg.displayHeight / 2);
            
            this.miniFrame.clear().lineStyle(4, 0x1A237E, 1).strokeRect(this.minimapCamera.x, this.minimapCamera.y, this.minimapCamera.width, this.minimapCamera.height);
            this.interactiveRegion.setPosition(this.minimapCamera.x, this.minimapCamera.y).setDisplaySize(this.minimapCamera.width, this.minimapCamera.height);
            this.toggleBtn.setPosition(this.minimapCamera.x, this.minimapCamera.y - 35);
            
            if (this.tipText && this.tipText.active) {
                this.tipText.setPosition(this.minimapCamera.x - 10, this.minimapCamera.y + this.minimapCamera.height / 2);
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
            // ⭐ 核心防御：如果场景不是 Active 状态，坚决不运行逻辑
            if (!this.scene.isActive() || !bg || !bg.active) return;

            currentZoomScale = setupBackgrounds();
            renderPoints();
            
            const layout = getLayoutConfig(this.isMinimapMaximized);
            
            if (this.backBtn && this.backBtn.active) {
                this.backBtn.setX(this.scale.width - 20);
            }

            if (this.minimapCamera && this.minimapCamera.scene) {
                this.minimapCamera.setPosition(layout.x, layout.y).setSize(layout.w, layout.h);
            }
            syncUI();
        };

        this.scale.on('resize', onResize);
        this.events.on('update', syncUI);

        // 清理事件监听，防止内存泄漏和僵尸回调
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
            this.toggleBtn.setText(this.isMinimapMaximized ? '✖ SULJE' : '🔍 SUURENNA');
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