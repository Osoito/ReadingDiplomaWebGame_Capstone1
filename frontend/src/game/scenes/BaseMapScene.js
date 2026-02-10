import Phaser from 'phaser';
import ReadingState from '../state.js';

class BaseMapScene extends Phaser.Scene {
    constructor(key, assetKey, title) {
        super(key);
        this.assetKey = assetKey;
        this.title = title;
    }

    create() {
        const { width, height } = this.scale;

        const bg = this.add.image(0, 0, this.assetKey).setOrigin(0);
        this.baseScale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(this.baseScale);
        this.cameras.main.setBounds(0, 0, bg.displayWidth, bg.displayHeight);

        this.pathGraphics = this.add.graphics().setDepth(5);

        this.pointPositions = this.rawPoints.map(p => ({
            x: p.x * this.baseScale,
            y: p.y * this.baseScale
        }));

        this.pointPositions.forEach(pos => {
            this.add.circle(pos.x, pos.y, 18 * this.baseScale, this.themeColor || 0xffffff, 1)
                .setStrokeStyle(2, 0xffffff);
        });

        this.token = this.add.image(this.pointPositions[0].x, this.pointPositions[0].y, 'token')
            .setScale(0.12 * this.baseScale)
            .setDepth(10);

        this.add.text(width / 2, 20, this.title, {
            fontSize: '32px', color: '#fff', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5, 0).setScrollFactor(0);

        this.add.text(20, 20, '← TAKAISIN', {
            fontSize: '18px', color: '#fff', backgroundColor: '#444', padding: 10
        })
            .setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(2000)
            .on('pointerdown', () => {
                this.scene.stop(this.scene.key);
                this.scene.start('WorldMap');
            });

        this.bookBtn = this.add.text(20, height - 20, '📖 AVAA KIRJA', {
            fontSize: '28px', color: '#ffcc00', backgroundColor: '#000', padding: 10
        })
            .setOrigin(0, 1).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(2000)
            .on('pointerdown', () => this.handleOpenBook());

        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                this.cameras.main.stopFollow();
                this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
                this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
            }
        });

        this.events.on('resume', () => {
            this.input.enabled = true;
            this.time.delayedCall(100, () => this.updateTokenPosition(true));
        });

        this.updateTokenPosition(false);
    }

    async handleOpenBook() {
        const config = ReadingState.mapConfig[this.scene.key];
        if (!config) return;

        this.bookBtn.setText('⏳ Ladataan...');

        try {
            if (config.bookUrl) {
                const response = await fetch(config.bookUrl);
                if (response.ok) {
                    const fullText = await response.text();
                    this.launchReading(config, {
                        title: this.title,
                        author: "Online Library",
                        content: fullText.substring(0, 8000)
                    });
                    return;
                }
            }
            throw new Error("API unavailable");
        } catch (error) {
            console.warn("API failed, switching to local data");
            const fallback = config.localBook || config.book || {
                title: "Lukuseikkailu",
                author: "Opettaja",
                content: "Tervetuloa lukemaan!"
            };
            this.launchReading(config, fallback);
        } finally {
            this.bookBtn.setText('📖 AVAA KIRJA');
        }
    }

    launchReading(config, bookData) {
        ReadingState.progress = ReadingState[config.storage] || 0;
        this.scene.pause();
        this.scene.launch('ReadingScene', {
            prevScene: this.scene.key,
            mapTitle: this.title,
            bookContent: bookData
        });
    }

    updateTokenPosition(animate = true) {
        if (!this.token || !this.pointPositions || !this.pointPositions.length) return;

        const config = ReadingState.mapConfig[this.scene.key];
        const storageKey = config ? config.storage : 'progress';
        const currentProg = ReadingState[storageKey] || 0;

        let targetIndex = Math.floor((currentProg / 100) * (this.pointPositions.length - 1));
        targetIndex = Phaser.Math.Clamp(targetIndex, 0, this.pointPositions.length - 1);

        if (this.pathGraphics) {
            this.pathGraphics.clear();
            this.pathGraphics.lineStyle(4, this.themeColor || 0xffffff, 0.4);
            if (targetIndex >= 1) {
                this.pathGraphics.beginPath();
                this.pathGraphics.moveTo(this.pointPositions[1].x, this.pointPositions[1].y);
                for (let i = 2; i <= targetIndex; i++) {
                    this.pathGraphics.lineTo(this.pointPositions[i].x, this.pointPositions[i].y);
                }
                this.pathGraphics.strokePath();
            }
        }

        const currentIndex = this.token.lastPointIndex || 0;

        if (animate && currentIndex < targetIndex) {
            const moveNext = (index) => {
                if (index > targetIndex) {
                    this.token.lastPointIndex = targetIndex;
                    return;
                }
                this.tweens.add({
                    targets: this.token,
                    x: this.pointPositions[index].x,
                    y: this.pointPositions[index].y,
                    duration: 400,
                    ease: 'Linear',
                    onStart: () => this.cameras.main.startFollow(this.token, true, 0.1, 0.1),
                    onComplete: () => moveNext(index + 1)
                });
            };
            moveNext(currentIndex + 1);
        } else {
            const pos = this.pointPositions[targetIndex];
            this.token.setPosition(pos.x, pos.y);
            this.token.lastPointIndex = targetIndex;
            this.cameras.main.startFollow(this.token, true, 1, 1);
        }
    }
}

export default BaseMapScene;
