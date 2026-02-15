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
            .setOrigin(0, 1)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setDepth(2000)
            .on('pointerdown', () => {

                const mapKey = this.scene.key;
                const cfg = ReadingState.mapConfig[mapKey];
                const storageKey = cfg.storage;
                const continentProg = ReadingState[storageKey] || 0;

                if (continentProg >= 100) {
                    this.bookBtn.disableInteractive();
                    this.bookBtn.setColor("#777777");
                    this.bookBtn.setBackgroundColor("#333333");
                    return;
                }

                this.showBookList();
            });

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

        this.time.delayedCall(50, () => this.updateTokenPosition(false));
    }

    showBookList() {
        const mapKey = this.scene.key;
        const mapCfg = ReadingState.mapConfig[mapKey];
        const globalBooks = ReadingState.globalBooks;
        const completedBookIds = ReadingState.completedBookIds || {};
        const mapSelectedBook = ReadingState.mapSelectedBook || {};
        const currentBookId = mapSelectedBook[mapKey] || null;

        if (!mapCfg || !globalBooks) return;

        const storageKey = mapCfg.storage;
        const continentProg = ReadingState[storageKey] || 0;

        const { width, height } = this.scale;

        if (this.listUI) this.listUI.destroy(true);

        this.listUI = this.add.container(0, 0).setDepth(10000).setScrollFactor(0);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.9)
            .setOrigin(0)
            .setInteractive();
        this.listUI.add(overlay);

        const title = this.add.text(width / 2, 60, "SELECT A CLASSIC BOOK", {
            fontSize: '32px', color: '#00ffcc', fontWeight: 'bold'
        }).setOrigin(0.5);
        this.listUI.add(title);

        const listY = 130;
        const viewH = height - 220;

        this.scrollContainer = this.add.container(0, listY);
        this.listUI.add(this.scrollContainer);

        const maskG = this.make.graphics();
        maskG.fillRect(0, listY, width, viewH);
        this.scrollContainer.setMask(maskG.createGeometryMask());

        const availableBooks = globalBooks.map(book => ({
            ...book,
            isCompleted: !!completedBookIds[book.id],
            isCurrent: (book.id === currentBookId)
        }));

        availableBooks.forEach((book, index) => {
            const itemY = index * 100;

            let bgColor = 0x333333;
            let borderColor = 0x00ffcc;
            let alpha = 1;

            if (book.isCompleted) {
                bgColor = 0x222222;
                borderColor = 0x888888;
                alpha = 0.5;
            }

            if (book.isCurrent) {
                bgColor = 0x555555;
                borderColor = 0xffff00;
            }

            const btnBg = this.add.rectangle(width / 2, itemY + 50, width * 0.7, 80, bgColor, alpha)
                .setStrokeStyle(2, borderColor)
                .setInteractive({ useHandCursor: true });

            const pct = ReadingState.bookProgress[book.id] || 0;
            const pctLabel = book.isCompleted ? "✔ DONE" : `${pct}%`;

            const btnText = this.add.text(
                width / 2 - 40,
                itemY + 50,
                `${book.title}\nBy: ${book.author}`,
                { fontSize: '18px', color: book.isCompleted ? '#aaaaaa' : '#ffffff', align: 'left' }
            ).setOrigin(0.5);

            const pctText = this.add.text(width * 0.75, itemY + 50, pctLabel, {
                fontSize: '20px',
                color: book.isCompleted ? '#00ff00' : '#00ffcc'
            }).setOrigin(0.5);

            btnBg.on('pointerdown', () => {
                const dragDist = Math.abs(this.input.activePointer.upY - this.input.activePointer.downY);
                if (dragDist >= 15) return;

                if (book.isCompleted) {
                    this.listUI.destroy(true);
                    this.fetchGutenbergBook(book, mapCfg, true);
                    return;
                }

                const prevBookId = ReadingState.mapSelectedBook[mapKey] || null;

                if (!prevBookId) {
                    ReadingState.mapSelectedBook[mapKey] = book.id;
                } else if (prevBookId !== book.id) {
                    ReadingState[storageKey] = 0;
                    this.token.lastPointIndex = 0;
                    this.updateTokenPosition(false);
                    ReadingState.mapSelectedBook[mapKey] = book.id;
                }

                this.listUI.destroy(true);
                this.fetchGutenbergBook(book, mapCfg, false);
            });

            this.scrollContainer.add([btnBg, btnText, pctText]);
        });

        const contentHeight = availableBooks.length * 100;
        const maxY = listY;
        const minY = contentHeight <= viewH ? maxY : listY - (contentHeight - viewH) - 40;

        let isDragging = false;
        let dragStartY = 0;
        let lastMoveY = 0;
        let velocity = 0;

        overlay.on('pointerdown', (p) => {
            isDragging = true;
            dragStartY = p.y;
            velocity = 0;
        });

        overlay.on('pointermove', (p) => {
            if (!isDragging) return;
            const delta = p.y - dragStartY;
            dragStartY = p.y;
            let newY = this.scrollContainer.y + delta;
            newY = Phaser.Math.Clamp(newY, minY, maxY);
            this.scrollContainer.y = newY;
            lastMoveY = delta;
        });

        overlay.on('pointerup', () => {
            isDragging = false;
            velocity = lastMoveY;
            this.time.addEvent({
                delay: 16,
                repeat: 40,
                callback: () => {
                    if (Math.abs(velocity) < 0.5) return;
                    let newY = this.scrollContainer.y + velocity;
                    newY = Phaser.Math.Clamp(newY, minY, maxY);
                    this.scrollContainer.y = newY;
                    velocity *= 0.9;
                }
            });
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            let newY = this.scrollContainer.y - deltaY * 0.5;
            newY = Phaser.Math.Clamp(newY, minY, maxY);
            this.scrollContainer.y = newY;
        });

        const closeBtn = this.add.text(width / 2, height - 50, "[ CANCEL ]", {
            fontSize: '20px', color: '#ff4444', backgroundColor: '#000', padding: 10
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.listUI.destroy(true));
        this.listUI.add(closeBtn);
    }

    async fetchGutenbergBook(book, config, readOnly = false) {
        this.bookBtn.setText("⏳ LOADING...");

        const proxies = [
            "https://api.allorigins.win/raw?url=",
            "https://corsproxy.io/?",
            "https://api.codetabs.com/v1/proxy/?quest="
        ];

        const targetUrl = `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.txt`;

        let success = false;
        let fetchedText = "";

        for (const proxy of proxies) {
            try {
                const response = await fetch(proxy + encodeURIComponent(targetUrl), {
                    signal: AbortSignal.timeout(5000)
                });
                if (response.ok) {
                    fetchedText = await response.text();
                    if (fetchedText.length > 1000) { success = true; break; }
                }
            } catch (e) {}
        }

        if (success) {
            const startMarkers = ["*** START OF", "CHAPTER I", "Title:"];
            let cleanText = fetchedText;
            for (let m of startMarkers) {
                let idx = fetchedText.indexOf(m);
                if (idx !== -1) { cleanText = fetchedText.substring(idx); break; }
            }

            this.launchReading(config, {
                id: book.id,
                title: book.title,
                author: book.author,
                content: cleanText.substring(0, 20000),
                readOnly: readOnly
            });
        } else {
            this.launchReading(config, {
                id: book.id,
                title: book.title + " (Demo Mode)",
                author: book.author,
                content: `[DEMO CONTENT]\n\nUnable to connect.\n\n${"Preview ".repeat(100)}`,
                readOnly: readOnly
            });
        }

        this.bookBtn.setText("📖 AVAA KIRJA");
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
        const currentProg = ReadingState[storageKey] || 0;

        let targetIndex = Math.floor((currentProg / 100) * (this.pointPositions.length - 1));
        targetIndex = Phaser.Math.Clamp(targetIndex, 0, this.pointPositions.length - 1);

        if (this.pathGraphics) {
            this.pathGraphics.clear();
            this.pathGraphics.lineStyle(4, this.themeColor || 0xffffff, 0.4);

            if (targetIndex >= 1) {
                this.pathGraphics.beginPath();
                this.pathGraphics.moveTo(this.pointPositions[0].x, this.pointPositions[0].y);
                for (let i = 1; i <= targetIndex; i++) {
                    this.pathGraphics.lineTo(this.pointPositions[i].x, this.pointPositions[i].y);
                }
                this.pathGraphics.strokePath();
            }
        }

        const pos = this.pointPositions[targetIndex];

        if (animate) {
            const currentIndex = this.token.lastPointIndex || 0;

            if (currentIndex < targetIndex) {
                const moveNext = (i) => {
                    if (i > targetIndex) {
                        this.token.lastPointIndex = targetIndex;
                        return;
                    }

                    this.tweens.add({
                        targets: this.token,
                        x: this.pointPositions[i].x,
                        y: this.pointPositions[i].y,
                        duration: 400,
                        ease: 'Linear',
                        onStart: () => this.cameras.main.startFollow(this.token, true, 0.1, 0.1),
                        onComplete: () => moveNext(i + 1)
                    });
                };
                moveNext(currentIndex + 1);
            } else {
                this.token.setPosition(pos.x, pos.y);
                this.token.lastPointIndex = targetIndex;
                this.cameras.main.startFollow(this.token, true, 1, 1);
            }
        }

        if (targetIndex === this.pointPositions.length - 1) {

            if (!ReadingState._continentCompletedFlags) {
                ReadingState._continentCompletedFlags = {};
            }

            const mapKey = this.scene.key;

            if (!ReadingState._continentCompletedFlags[mapKey]) {
                ReadingState._continentCompletedFlags[mapKey] = true;

                const { width, height } = this.scale;

                const popup = this.add.container(0, 0)
                    .setDepth(99999)
                    .setScrollFactor(0);

                const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.6)
                    .setOrigin(0)
                    .setInteractive();
                overlay.on('pointerdown', () => {
                    popup.destroy(true);
                });
                popup.add(overlay);

                const box = this.add.rectangle(width / 2, height / 2, width * 0.7, 220, 0xffffff)
                    .setStrokeStyle(4, 0x00cc88);
                popup.add(box);

                const msg = this.add.text(
                    width / 2,
                    height / 2 - 40,
                    "🎉 Congratulations!\nYou have completed the exploration of this continent!",
                    {
                        fontSize: '24px',
                        color: '#333333',
                        align: 'center',
                        wordWrap: { width: width * 0.6 }
                    }
                ).setOrigin(0.5);
                popup.add(msg);

                const okBtn = this.add.text(
                    width / 2,
                    height / 2 + 60,
                    "[ OK ]",
                    {
                        fontSize: '22px',
                        color: '#ffffff',
                        backgroundColor: '#00aa66',
                        padding: { x: 20, y: 10 }
                    }
                )
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true });

                okBtn.on('pointerdown', () => {
                    popup.destroy(true);
                });

                popup.add(okBtn);
            }
        }
    }
}

export default BaseMapScene;


