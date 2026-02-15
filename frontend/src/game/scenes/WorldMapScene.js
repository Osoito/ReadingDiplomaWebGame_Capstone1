import Phaser from 'phaser';
import ReadingState from '../state.js';
import worldmapImg from '../../assets/worldmap.png';

class WorldMapScene extends Phaser.Scene {
    constructor() {
        super('WorldMap');
    }

    preload() {
        // Vite 下必须使用 import 的资源
        this.load.image('worldMap', worldmapImg);
    }

    create() {
        const { width, height } = this.scale;
        const bg = this.add.image(0, 0, 'worldMap').setOrigin(0);
        
        const baseScale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(baseScale);

        this.cameras.main.setBounds(0, 0, bg.displayWidth, bg.displayHeight);

        const continentPositions = {
            arctic: { x: 600, y: 120, name: 'ARKTIS', mapKey: 'ArcticMap' }, 
            europe: { x: 800, y: 300, name: 'EUROOPPA', mapKey: 'EuropeMap' },
            asia: { x: 1200, y: 350, name: 'AASIA', mapKey: 'AsiaMap' },
            africa: { x: 800, y: 500, name: 'AFRIKKA', mapKey: 'AfricaMap' },
            northAmerica: { x: 300, y: 300, name: 'POHJOIS-AMERIKKA', mapKey: 'NorthAmericaMap' },
            southAmerica: { x: 400, y: 600, name: 'ETELÄ-AMERIKKA', mapKey: 'SouthAmericaMap' },
            oceania: { x: 1350, y: 700, name: 'OSEANIA', mapKey: 'OceaniaMap' },
            antarctica: { x: 800, y: 900, name: 'ETELÄMANNER', mapKey: 'AntarcticaMap' }
        };

        Object.entries(continentPositions).forEach(([key, pos]) => {
            const scaledX = pos.x * baseScale;
            const scaledY = pos.y * baseScale;

            const mapKey = pos.mapKey;
            const unlocked = ReadingState.mapUnlock[mapKey] === true;

            const color = unlocked ? 0x00ff00 : 0x555555;
            const alpha = unlocked ? 0.4 : 0.25;

            const btn = this.add.circle(scaledX, scaledY, 40 * baseScale, color, alpha);

            if (unlocked) {
                btn.setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => {
                        this.scene.start(mapKey);
                    });
            }

            const labelOffsetY = (key === 'antarctica') ? -60 : 55;
            this.add.text(scaledX, scaledY + (labelOffsetY * baseScale), pos.name, {
                fontSize: `${16 * baseScale}px`,
                color: unlocked ? '#ffffff' : '#888888',
                backgroundColor: unlocked ? '#000000cc' : '#00000088',
                padding: { x: 10, y: 5 },
                fontStyle: 'bold'
            }).setOrigin(0.5);
        });

        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x);
                this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y);
            }
        });

        this.add.text(20, 20, `Kirjat: ${ReadingState.booksRead}/8`, {
            fontSize: '24px', fill: '#fff', stroke: '#000', strokeThickness: 4
        }).setScrollFactor(0).setDepth(1000);
    }
}

export default WorldMapScene;
