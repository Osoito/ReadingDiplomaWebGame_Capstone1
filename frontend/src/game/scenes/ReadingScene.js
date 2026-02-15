import Phaser from 'phaser';
import ReadingState from '../state.js';

class ReadingScene extends Phaser.Scene {
    constructor() {
        super('ReadingScene');
    }

    init(data) {
        this.sourceMap = data.prevScene;
        this.bookTitle = data.mapTitle;
        this.storageKey = data.storageKey;

        this.bookData = data.bookContent || {
            id: 'unknown',
            title: "Unknown Book",
            author: "Unknown",
            content: "No content available."
        };

        this.readOnly = data.readOnly || false;
    }

    create() {
        const { width, height } = this.scale;

        // 背景遮罩
        this.add.rectangle(0, 0, width, height, 0x000000, 0.9)
            .setOrigin(0)
            .setInteractive();

        // 纸张背景
        const paperWidth = Math.min(width * 0.92, 600);
        const paperHeight = Math.min(height * 0.88, 800);
        const centerX = width / 2;
        const centerY = height / 2;

        this.add.rectangle(centerX, centerY, paperWidth, paperHeight, 0xfdf6e3)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xe6e0d0);

        // 标题
        const titleY = centerY - paperHeight * 0.43;

        this.add.text(centerX, titleY, this.bookData.title, {
            fontSize: '26px',
            color: '#5d4037',
            fontWeight: 'bold',
            wordWrap: { width: paperWidth - 60 },
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(centerX, titleY + 35, `Kirjailija: ${this.bookData.author}`, {
            fontSize: '16px',
            color: '#8d6e63'
        }).setOrigin(0.5);

        this.add.rectangle(centerX, titleY + 60, paperWidth * 0.8, 1, 0xe6e0d0).setOrigin(0.5);

        // 内容区域
        const contentStartY = titleY + 80;
        const contentWindowHeight = paperHeight * 0.72;

        // Mask
        const maskGraphics = this.make.graphics();
        maskGraphics.fillRect(
            centerX - paperWidth / 2,
            contentStartY,
            paperWidth,
            contentWindowHeight
        );
        const contentMask = maskGraphics.createGeometryMask();

        // 内容文本
        this.contentBody = this.add.text(centerX, contentStartY, this.bookData.content, {
            fontSize: '20px',
            color: '#2b2b2b',
            lineSpacing: 12,
            align: 'left',
            wordWrap: { width: paperWidth - 80 }
        }).setOrigin(0.5, 0);
        this.contentBody.setMask(contentMask);

        // ⭐⭐⭐ 先定义 maxScroll
        const maxScroll = Math.max(0, this.contentBody.height - contentWindowHeight);

        // ⭐⭐⭐ 恢复阅读进度
        const savedPct = ReadingState.bookProgress[this.bookData.id] || 0;
        this.currentScrollOffset = maxScroll * (savedPct / 100);
        this.contentBody.y = contentStartY - this.currentScrollOffset;

        ReadingState.progress = savedPct;

        // 进度条
        const barW = paperWidth * 0.7;
        const barY = centerY + paperHeight * 0.38;

        this.add.rectangle(centerX, barY, barW, 6, 0xe0e0e0).setOrigin(0.5);
        this.barFill = this.add.rectangle(
            centerX - barW / 2,
            barY,
            (savedPct / 100) * barW,
            6,
            0x8b4513
        ).setOrigin(0, 0.5);

        this.progressLabel = this.add.text(centerX, barY + 20, `${savedPct}%`, {
            fontSize: '14px',
            color: '#8d6e63'
        }).setOrigin(0.5);

        // 滚动逻辑
        const updateScroll = (deltaY) => {
            this.currentScrollOffset += deltaY;
            this.currentScrollOffset = Phaser.Math.Clamp(this.currentScrollOffset, 0, maxScroll);
            this.contentBody.y = contentStartY - this.currentScrollOffset;

            let pct = maxScroll > 0 ? (this.currentScrollOffset / maxScroll) : 1;
            pct = Math.round(pct * 100);

            this.barFill.width = (pct / 100) * barW;
            this.progressLabel.setText(`${pct}%`);

            ReadingState.progress = pct;
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

        // 关闭按钮
        const closeBtn = this.add.text(
            centerX,
            centerY + paperHeight * 0.45,
            '[ TAKAISIN KARTALLE ]',
            {
                fontSize: '18px',
                color: '#ffffff',
                backgroundColor: '#8b4513',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            const finalPct = ReadingState.progress || 0;

            // 保存阅读进度
            ReadingState.bookProgress[this.bookData.id] = finalPct;

            // ⭐⭐⭐ 只读模式：不更新地图、不解锁洲 ⭐⭐⭐
            if (this.readOnly) {
                this.scene.resume(this.sourceMap);
                this.scene.get(this.sourceMap).input.enabled = true;
                this.scene.stop();
                return;
            }

            // ⭐⭐⭐ 正常模式：更新地图进度 ⭐⭐⭐
            if (this.sourceMap) {
                const cfg = ReadingState.mapConfig[this.sourceMap];

                if (cfg) {
                    const storageKey = cfg.storage;

                    ReadingState[storageKey] = finalPct;

                    if (finalPct >= 100) {
                        if (!ReadingState.completedBookIds[this.bookData.id]) {
                            ReadingState.completedBookIds[this.bookData.id] = true;
                            ReadingState.booksRead += 1;
                        }

                        const order = ReadingState.mapOrder || [];
                        const idx = order.indexOf(this.sourceMap);
                        if (idx !== -1 && idx < order.length - 1) {
                            const nextMap = order[idx + 1];
                            if (ReadingState.mapUnlock && nextMap) {
                                ReadingState.mapUnlock[nextMap] = true;
                            }
                        }
                    }
                }

                this.scene.resume(this.sourceMap);
                this.scene.get(this.sourceMap).input.enabled = true;
            }

            this.scene.stop();
        });
    }
}

export default ReadingScene;
