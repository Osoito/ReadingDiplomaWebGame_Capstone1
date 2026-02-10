import Phaser from 'phaser';
import ReadingState from '../state.js';

class ReadingScene extends Phaser.Scene {
    constructor() {
        super('ReadingScene');
    }

    init(data) {
        this.sourceMap = data.prevScene;
        this.bookTitle = data.mapTitle;
        this.bookData = data.bookContent || { title: "Unknown Book", author: "Unknown", content: "No content available." };
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
            .setOrigin(0)
            .setInteractive();

        const paperWidth = Math.min(width * 0.9, 550);
        const paperHeight = Math.min(height * 0.85, 750);
        const centerX = width / 2;
        const centerY = height / 2;

        const paper = this.add.rectangle(centerX, centerY, paperWidth, paperHeight, 0xffffff)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xdddddd);

        const headerY = centerY - paperHeight * 0.42;
        this.add.text(centerX, headerY, this.bookData.title, {
            fontSize: '26px', color: '#2c3e50', fontWeight: 'bold', wordWrap: { width: paperWidth - 40 }
        }).setOrigin(0.5);

        const authorText = this.add.text(centerX, headerY + 35, `Kirjailija: ${this.bookData.author || 'Tuntematon'}`, {
            fontSize: '16px', color: '#7f8c8d'
        }).setOrigin(0.5);

        const maskMargin = 100;
        const maskGraphics = this.make.graphics();
        maskGraphics.fillRect(centerX - paperWidth/2, centerY - paperHeight/2 + maskMargin, paperWidth, paperHeight - maskMargin * 2);
        const contentMask = maskGraphics.createGeometryMask();

        this.contentBody = this.add.text(centerX, centerY - paperHeight/2 + maskMargin, this.bookData.content, {
            fontSize: '20px',
            color: '#34495e',
            lineSpacing: 12,
            align: 'left',
            wordWrap: { width: paperWidth - 60 }
        }).setOrigin(0.5, 0);

        this.contentBody.setMask(contentMask);

        const viewHeight = paperHeight - maskMargin * 2;
        this.startY = centerY - paperHeight / 2 + maskMargin;
        const maxScroll = Math.max(0, this.contentBody.height - viewHeight);

        const barW = paperWidth * 0.8;
        const barY = centerY + paperHeight * 0.38;

        this.add.rectangle(centerX, barY, barW, 10, 0xeeeeee).setOrigin(0.5);
        this.barFill = this.add.rectangle(centerX - barW/2, barY, 0, 10, 0x27ae60).setOrigin(0, 0.5);
        this.progressLabel = this.add.text(centerX + barW/2 + 10, barY, '0%', { fontSize: '14px', color: '#7f8c8d' }).setOrigin(0, 0.5);

        this.currentScrollOffset = 0;

        const updateScroll = (deltaY) => {
            this.currentScrollOffset += deltaY;
            this.currentScrollOffset = Phaser.Math.Clamp(this.currentScrollOffset, 0, maxScroll);

            this.contentBody.y = this.startY - this.currentScrollOffset;

            let pct = maxScroll > 0 ? (this.currentScrollOffset / maxScroll) : 1;
            let progressValue = Math.round(pct * 100);

            this.barFill.width = pct * barW;
            this.progressLabel.setText(`${progressValue}%`);
            ReadingState.progress = progressValue;
        };

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            updateScroll(deltaY);
        });

        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                const diffY = pointer.prevPosition.y - pointer.y;
                updateScroll(diffY);
            }
        });

        const closeBtn = this.add.text(centerX, centerY + paperHeight * 0.45, '[ TALLENNA JA SULJE ]', {
            fontSize: '20px', color: '#ffffff', backgroundColor: '#2c3e50', padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            if (this.sourceMap) {
                const config = ReadingState.mapConfig[this.sourceMap];
                if (config) {
                    ReadingState[config.storage] = ReadingState.progress;
                    console.log(`Progress synced: ${ReadingState.progress}%`);
                }
                this.scene.resume(this.sourceMap);
                this.scene.get(this.sourceMap).input.enabled = true;
            }
            this.scene.stop();
        });
    }
}

export default ReadingScene;
