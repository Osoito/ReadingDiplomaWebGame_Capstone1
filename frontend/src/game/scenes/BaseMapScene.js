import Phaser from 'phaser';
import ReadingState from '../state.js';

class BaseMapScene extends Phaser.Scene {

    constructor(key, assetKey, title) {
        super(key);
        this.assetKey = assetKey;
        this.title = title;
        this.isDoingQuiz = false; // State lock to prevent repeated triggering

        // ⭐ New Feature: Define which points trigger video (based on the pointPositions index)
        this.videoCheckpoints = {
            3: { title: "Reading Tip: Visualization", url: "https://www.youtube.com/watch?v=qw3S-S708tE" },
            7: { title: "Reading Tip: Active Reading", url: "https://www.youtube.com/watch?v=XjMv7DUtW8o" }
        };

        // ⭐ New: Initialize the viewed collection
        this.viewedVideos = new Set();
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

        this.pointPositions.forEach((pos, index) => {
            // ⭐ Modification: If it's a video point, display it in gold and add interactivity.
            const isVideo = this.videoCheckpoints[index];
            const dot = this.add.circle(pos.x, pos.y, 18 * this.baseScale, isVideo ? 0xffcc00 : (this.themeColor || 0xffffff), 1)
                .setStrokeStyle(2, 0xffffff);
            
            if (isVideo) {
                this.add.text(pos.x, pos.y, '▶', { fontSize: '14px', color: '#000' }).setOrigin(0.5);
                
                // ⭐ Added: Manual click logic
                dot.setInteractive({ useHandCursor: true });
                dot.on('pointerdown', () => {
                    // You can manually rewind once the progress (Token position) has reached or exceeded this point.
                    if (this.token && this.token.lastPointIndex >= index) {
                        this.showVideoPopup(this.videoCheckpoints[index], index, true); 
                    }
                });
            }
        });

        // ⭐ Restore the token to its last position (0 if no record exists).
        const savedIndex =
            ReadingState.tokenPositions?.[this.scene.key] ?? 0;

        this.token = this.add.image(
            this.pointPositions[savedIndex].x,
            this.pointPositions[savedIndex].y,
            'token'
        )
        .setScale(0.12 * this.baseScale)
        .setDepth(10);

        // ⭐ Synchronize lastPointIndex
        this.token.lastPointIndex = savedIndex;


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

                // ⭐ Change: If the progress is already 100%, clicking will no longer display the book list, but instead show the Quiz review.
                if (continentProg >= 100) {
                    this.showStoryQuiz();
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

        this.input.once('pointerdown', () => {
            if (this.sound.context && this.sound.context.state === 'suspended') {
                this.sound.context.resume();
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

        const { width, height } = this.scale;

        if (this.listUI) this.listUI.destroy(true);

        this.listUI = this.add.container(0, 0).setDepth(10000).setScrollFactor(0);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.9)
            .setOrigin(0)
            .setInteractive()
            .setScrollFactor(0);
        this.listUI.add(overlay);

        const title = this.add.text(width / 2, 60, "SELECT A CLASSIC BOOK", {
            fontSize: '32px', color: '#00ffcc', fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);
        this.listUI.add(title);

        const listY = 130;
        const viewH = height - 220;

        this.scrollContainer = this.add.container(0, listY).setScrollFactor(0);
        this.listUI.add(this.scrollContainer);

        const maskG = this.add.graphics();
        maskG.setScrollFactor(0); 
        maskG.fillStyle(0xffffff, 1);
        maskG.fillRect(0, listY, width, viewH);
        maskG.setVisible(false); 
        const mask = maskG.createGeometryMask();
        this.scrollContainer.setMask(mask);

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
                .setInteractive({ useHandCursor: true })
                .setScrollFactor(0);

            const pct = ReadingState.bookProgress[book.id] || 0;
            const pctLabel = book.isCompleted ? "✔ DONE" : `${pct}%`;

            const btnText = this.add.text(
                width / 2 - 40,
                itemY + 50,
                `${book.title}\nBy: ${book.author}`,
                { fontSize: '18px', color: book.isCompleted ? '#aaaaaa' : '#ffffff', align: 'left' }
            ).setOrigin(0.5).setScrollFactor(0);

            const pctText = this.add.text(width * 0.75, itemY + 50, pctLabel, {
                fontSize: '20px',
                color: book.isCompleted ? '#00ff00' : '#00ffcc'
            }).setOrigin(0.5).setScrollFactor(0);

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
            .setScrollFactor(0)
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
            if (this.token.lastPointIndex === undefined) {
                this.token.lastPointIndex = ReadingState.tokenPositions?.[this.scene.key] ?? 0;
            }

            const currentIndex = this.token.lastPointIndex;
            if (currentIndex === targetIndex) {
                // ⭐ Modification: Check the event once even if the position hasn't changed (to prevent omissions after disconnection and reconnection).
                this.checkCheckpointEvents(targetIndex);
                return;
            }

            const moveStep = (current) => {
                if (current === targetIndex) {
                    this.token.lastPointIndex = targetIndex;
                    ReadingState.tokenPositions = ReadingState.tokenPositions || {};
                    ReadingState.tokenPositions[this.scene.key] = targetIndex;
                    // ⭐ Modification: Check events after movement is complete
                    this.checkCheckpointEvents(targetIndex);
                    return;
                }

                const nextI = (current < targetIndex) ? current + 1 : current - 1;

                this.tweens.add({
                    targets: this.token,
                    x: this.pointPositions[nextI].x,
                    y: this.pointPositions[nextI].y,
                    duration: 300,
                    ease: 'Linear',
                    onStart: () => this.cameras.main.startFollow(this.token, true, 0.1, 0.1),
                    onComplete: () => moveStep(nextI)
                });
            };

            moveStep(currentIndex);
        } else {
            this.token.setPosition(pos.x, pos.y);
            this.token.lastPointIndex = targetIndex;
            ReadingState.tokenPositions = ReadingState.tokenPositions || {};
            ReadingState.tokenPositions[this.scene.key] = targetIndex;
            this.cameras.main.startFollow(this.token, true, 1, 1);
            // ⭐ Modification: Directly locate and inspect events
            this.checkCheckpointEvents(targetIndex);
        }
    }

    // ⭐ Function: Unified management of node-triggered events
    checkCheckpointEvents(index) {
        // 1. Check video nodes
        if (this.videoCheckpoints[index]) {
            this.showVideoPopup(this.videoCheckpoints[index], index, false);
        }

        // 2. Check Mainland China Complete (Quiz)
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

    // ⭐ Modified: Supports both manual and automatic modes.
    showVideoPopup(videoData, index, isManual = false) {
        // If it's automatically triggered and the video has already been viewed, then no pop-up will appear; 
        // if clicked manually, it will be ignored. viewedVideos
        if (!isManual && this.viewedVideos.has(index)) return;

        const { width, height } = this.scale;
        const depth = 200000; // Extremely high depth, ensuring it's above all UI elements.

        // 1. Semi-transparent background mask
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(depth)
            .setInteractive();

        // 2. Pop-up window with white border
        const box = this.add.rectangle(width / 2, height / 2, 450, 300, 0xffffff)
            .setStrokeStyle(4, 0xffcc00)
            .setScrollFactor(0)
            .setDepth(depth + 1);

        const title = this.add.text(width / 2, height / 2 - 100, "💡 READING TIP UNLOCKED", {
            fontSize: '24px', color: '#000', fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

        const subTitle = this.add.text(width / 2, height / 2 - 40, videoData.title, {
            fontSize: '18px', color: '#444', align: 'center', wordWrap: { width: 400 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

        // 3. Video button
        const btnBg = this.add.rectangle(width / 2, height / 2 + 50, 260, 60, 0xff0000)
            .setScrollFactor(0)
            .setDepth(depth + 2)
            .setInteractive({ useHandCursor: true });
        
        const btnLabel = this.add.text(width / 2, height / 2 + 50, "WATCH ON YOUTUBE", {
            fontSize: '20px', color: '#ffffff', fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 3);

        // 4. Close button
        const closeBtn = this.add.text(width / 2, height / 2 + 120, "[ Close ]", { 
            fontSize: '18px', color: '#888888', padding: 10
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2).setInteractive({ useHandCursor: true });

        const cleanup = () => {
            overlay.destroy();
            box.destroy();
            title.destroy();
            subTitle.destroy();
            btnBg.destroy();
            btnLabel.destroy();
            closeBtn.destroy();
            this.viewedVideos.add(index); // Marked as viewed
        };

        btnBg.on('pointerdown', () => {
            window.open(videoData.url, '_blank');
            cleanup();
        });

        closeBtn.on('pointerdown', () => {
            cleanup();
        });
    }

    // ⭐ Enhanced Feature: Quiz Answers and Book Titles Display
    showStoryQuiz() {
        this.isDoingQuiz = true;
        const { width, height } = this.scale;
        const mapKey = this.scene.key;

        const currentBookId = ReadingState.mapSelectedBook?.[mapKey];
        const bookData = ReadingState.globalBooks?.find(b => b.id === currentBookId);
        const bookTitle = bookData ? bookData.title : "The Classic Story";

        if (!ReadingState.quizAnswers) ReadingState.quizAnswers = {};
        const savedAnswers = ReadingState.quizAnswers[mapKey];
        const isReadOnly = !!savedAnswers;

        const quizContainer = this.add.container(0, 0).setDepth(100000).setScrollFactor(0);
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0).setInteractive().setScrollFactor(0);
        quizContainer.add(overlay);

        const questions = [
            "What is the plot of this story?",
            "Who are the main characters?",
            "What are your thoughts or feelings about this story?"
        ];
        let currentStep = 0;
        this.tempAnswers = savedAnswers || ["", "", ""];

        const box = this.add.rectangle(width / 2, height / 2, width * 0.8, 450, 0xffffff).setStrokeStyle(4, 0x00cc88).setScrollFactor(0);
        quizContainer.add(box);

        const title = this.add.text(width / 2, height / 2 - 180, isReadOnly ? "YOUR REFLECTIONS" : "STORY QUIZ", { 
            fontSize: '28px', color: '#00aa66', fontWeight: 'bold' 
        }).setOrigin(0.5).setScrollFactor(0);
        quizContainer.add(title);

        const bookLabel = this.add.text(width / 2, height / 2 - 135, `Book: ${bookTitle}`, {
            fontSize: '18px', color: '#555555', fontStyle: 'italic'
        }).setOrigin(0.5).setScrollFactor(0);
        quizContainer.add(bookLabel);

        const qText = this.add.text(width / 2, height / 2 - 80, questions[currentStep], {
            fontSize: '20px', color: '#333333', align: 'center', wordWrap: { width: width * 0.7 }
        }).setOrigin(0.5).setScrollFactor(0);
        quizContainer.add(qText);

        const inputElement = document.createElement('textarea');
        inputElement.style.width = (width * 0.6) + 'px';
        inputElement.style.height = '120px';
        inputElement.style.fontSize = '16px';
        inputElement.style.padding = '10px';
        inputElement.style.borderRadius = '8px';
        inputElement.style.border = '1px solid #ccc';
        
        if (isReadOnly) {
            inputElement.value = this.tempAnswers[currentStep];
            inputElement.readOnly = true;
            inputElement.style.backgroundColor = "#f0f0f0";
        }
        
        const domInput = this.add.dom(width / 2, height / 2 + 35, inputElement).setScrollFactor(0);
        quizContainer.add(domInput);

        const nextBtn = this.add.text(width / 2, height / 2 + 170, "NEXT", {
            fontSize: '22px', color: '#ffffff', backgroundColor: '#00aa66', padding: { x: 30, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);

        nextBtn.on('pointerdown', () => {
            if (!isReadOnly) this.tempAnswers[currentStep] = inputElement.value;
            currentStep++;
            if (currentStep < questions.length) {
                qText.setText(questions[currentStep]);
                inputElement.value = isReadOnly ? this.tempAnswers[currentStep] : "";
                if (currentStep === questions.length - 1) nextBtn.setText(isReadOnly ? "CLOSE" : "SUBMIT");
            } else {
                if (!isReadOnly) ReadingState.quizAnswers[mapKey] = this.tempAnswers;
                quizContainer.destroy(true);
                this.isDoingQuiz = false;
                if (!isReadOnly) this.showFinalCelebration();
            }
        });
        quizContainer.add(nextBtn);
    }

    showFinalCelebration() {
        const mapKey = this.scene.key;
        if (!ReadingState._continentCompletedFlags) ReadingState._continentCompletedFlags = {};
        ReadingState._continentCompletedFlags[mapKey] = true;

        const { width, height } = this.scale;
        const popup = this.add.container(0, 0).setDepth(100000).setScrollFactor(0);
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0).setInteractive().setScrollFactor(0);
        overlay.on('pointerdown', () => popup.destroy(true));
        popup.add(overlay);
        const box = this.add.rectangle(width / 2, height / 2, width * 0.7, 220, 0xffffff).setStrokeStyle(4, 0x00cc88).setScrollFactor(0);
        popup.add(box);
        const msg = this.add.text(width / 2, height / 2 - 40, "🎉 Congratulations!\nYou have completed exploration!", { fontSize: '24px', color: '#333', align: 'center' }).setOrigin(0.5).setScrollFactor(0);
        popup.add(msg);
        const okBtn = this.add.text(width / 2, height / 2 + 60, "[ OK ]", { fontSize: '22px', color: '#ffffff', backgroundColor: '#00aa66', padding: 10 }).setOrigin(0.5).setInteractive().on('pointerdown', () => popup.destroy(true));
        popup.add(okBtn);
    }
}

export default BaseMapScene;