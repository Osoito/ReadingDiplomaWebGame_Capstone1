import Phaser from 'phaser';
import ReadingState from '../state.js';
import worldmapImg from '../../assets/worldmap.png';

class WorldMapScene extends Phaser.Scene {
    constructor() {
        super('WorldMap');
    }

    preload() {
        this.load.image('worldMap', worldmapImg);
    }

    create() {
        const { width, height } = this.scale;
        const bg = this.add.image(0, 0, 'worldMap').setOrigin(0);

        const baseScale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(baseScale);

        this.cameras.main.setBounds(0, 0, bg.displayWidth, bg.displayHeight);

        const continentPositions = {
            arctic: { x: 600, y: 120, name: 'ARKTIS' },
            europe: { x: 800, y: 300, name: 'EUROOPPA' },
            asia: { x: 1200, y: 350, name: 'AASIA' },
            africa: { x: 800, y: 500, name: 'AFRIKKA' },
            northAmerica: { x: 300, y: 300, name: 'POHJOIS-AMERIKKA' },
            southAmerica: { x: 400, y: 600, name: 'ETELÄ-AMERIKKA' },
            oceania: { x: 1350, y: 700, name: 'OSEANIA' },
            antarctica: { x: 800, y: 900, name: 'ETELÄMANNER' }
        };

        Object.entries(continentPositions).forEach(([key, pos]) => {
            const scaledX = pos.x * baseScale;
            const scaledY = pos.y * baseScale;

            const btn = this.add.circle(scaledX, scaledY, 40 * baseScale, 0x00ff00, 0.4)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    let targetScene = key.charAt(0).toUpperCase() + key.slice(1) + "Map";
                    this.scene.start(targetScene);
                });

            const labelOffsetY = (key === 'antarctica') ? -60 : 55;
            this.add.text(scaledX, scaledY + (labelOffsetY * baseScale), pos.name, {
                fontSize: `${16 * baseScale}px`,
                color: '#ffffff',
                backgroundColor: '#000000cc',
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
