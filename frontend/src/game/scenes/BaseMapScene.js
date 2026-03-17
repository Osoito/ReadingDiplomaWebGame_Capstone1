import Phaser from 'phaser';
import ReadingState from '../state.js';

class BaseMapScene extends Phaser.Scene {

    constructor(key, assetKey, title) {
        super(key);
        this.assetKey = assetKey;
        this.title = title;
        this.LOGICAL_WIDTH = 1280; // ⭐ Added: Assuming your original points are marked on a 1280px wide map.
        
        // --- Original Logic: Function Locks and Configuration ---
        this.isDoingQuiz = false; 

        // --- Original Logic: Video Checkpoint Definition ---
        this.videoCheckpoints = {
            3: { 
                title: "Lukuvinkki: Visualisointi", 
                url: "https://www.youtube.com/watch?v=qw3S-S708tE" 
            },
            7: { 
                title: "Lukuvinkki: Aktiivinen lukeminen", 
                url: "https://www.youtube.com/watch?v=XjMv7DUtW8o" 
            }
        };

        // --- Original logic: Video viewing history already viewed ---
        this.viewedVideos = new Set();
        
        // Dynamic object container
        this.dotObjects = []; 
        this.dotTexts = [];
    }

        create() {
        const { width, height } = this.scale;

        // 1. Initialize background
        this.bg = this.add.image(0, 0, this.assetKey).setOrigin(0);
        
        // 2. Initialize the path graph layer (must be below the Token)
        this.pathGraphics = this.add.graphics();
        this.pathGraphics.setDepth(5);

        // 3. Initialize the title text (with the original Stroke style)
        this.titleText = this.add.text(0, 0, this.title, {
            fontSize: '32px', 
            color: '#fff', 
            stroke: '#000', 
            strokeThickness: 4
        });
        this.titleText.setOrigin(0.5, 0);
        this.titleText.setScrollFactor(0);
        this.titleText.setDepth(2000);

        // 4. Initialize the back button (with original color and padding)
        this.backBtn = this.add.text(0, 0, '← TAKAISIN', {
            fontSize: '18px', 
            color: '#fff', 
            backgroundColor: '#1e3a5f', 
            padding: 10
        });
        this.backBtn.setInteractive({ useHandCursor: true });
        this.backBtn.setScrollFactor(0);
        this.backBtn.setDepth(2000);
        this.backBtn.on('pointerdown', () => {
            this.scene.stop(this.scene.key);
            this.scene.start('WorldMap');
        });

        // 5. Initialize the book button (with original color and 📖 symbol)
        this.bookBtn = this.add.text(20, height - 20, '📖 AVAA KIRJA', {
            fontSize: '28px', 
            color: '#ffcc00', 
            backgroundColor: '#1e3a5f', 
            padding: 10
        });
        this.bookBtn.setOrigin(0, 1);
        this.bookBtn.setInteractive({ useHandCursor: true });
        this.bookBtn.setScrollFactor(0);
        this.bookBtn.setDepth(2000);
        this.bookBtn.on('pointerdown', () => {
    const globalBooks = ReadingState.globalBooks || [];
    const completedBookIds = ReadingState.completedBookIds || {};

    // 1. Core Decision: Check if any book in the current mainland has been completed.
    const finishedBook = globalBooks.find(book => !!completedBookIds[book.id]);

    if (finishedBook) {
        // --- Scenario: The book has already been read ---
        // Go directly to review the quiz, without giving the reader a chance to look at the reading list.
        this.showStoryQuiz();
    } else {
        // --- Scenario: Not finished reading the book yet ---
        // Normal pop-up book selection
        this.showBookList();
    }
});

        // 6. Initialize Token
        const savedIndex = ReadingState.tokenPositions?.[this.scene.key] ?? 0;
        this.token = this.add.image(0, 0, 'token');
        this.token.setScale(0.12);
        this.token.setDepth(10);
        this.token.lastPointIndex = savedIndex;

        // 7. Raw interactive listening: drag and drop the camera
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                this.cameras.main.stopFollow();
                this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
                this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
            }
        });

        // 8. Audio Context Restoration
        this.input.once('pointerdown', () => {
            if (this.sound.context && this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
        });

        // 9. Scene Resumption Listening
        this.events.on('resume', () => {
            // Fix: Ensures that any remaining list items are cleared upon returning.
            if (this.listUI) {
                if (this._resizeBookListHandler) {
                    this.scale.off('resize', this._resizeBookListHandler, this);
                    this._resizeBookListHandler = null;
                }
                this.listUI.destroy(true);
                this.listUI = null;
            }
            this.time.delayedCall(100, () => {
                this.updateTokenPosition(true);
            });
        });

        // ⭐⭐⭐ Core Fix: Adjusted Initialization Order ⭐⭐⭐
        // 1. Now the scene is fully marked as ready, so camera calls inside handleResize will not fail.
        this.isReady = true;

        // 2. Perform the first layout calculation safely, which will create the pointPositions array.
        this.handleResize();

        // 3. Then set up a listener for the future resize event.
        this.scale.on('resize', this.handleResize, this);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scale.off('resize', this.handleResize, this);
        });

        // 4. Finally, it is safe to call updateTokenPosition, as it can now confirm that pointPositions exist.
        this.time.delayedCall(50, () => {
            this.updateTokenPosition(false);
        });
    }

    // ⭐ Adaptation and fine-tuning logic: Ensure the UI size and position are correct on various devices and resolve overlap issues.
    handleResize() {
        const { width, height } = this.scale;
        
        // --- A, B, C, D retain their original logic ---
        const fillScale = Math.max(width / this.bg.width, height / this.bg.height); 
        this.bg.setScale(fillScale);
        this.cameras.main.setBounds(0, 0, this.bg.displayWidth, this.bg.displayHeight);
        this.baseScale = this.bg.displayWidth / this.LOGICAL_WIDTH;
        const uiScale = Phaser.Math.Clamp(width / 1200, 0.7, 1.2);

        this.pointPositions = this.rawPoints.map(p => ({
            x: p.x * this.baseScale,
            y: p.y * this.baseScale
        }));

        this.dotObjects.forEach(d => d.destroy());
        this.dotTexts.forEach(t => t.destroy());
        this.dotObjects = [];
        this.dotTexts = [];

        this.pointPositions.forEach((pos, index) => {
            const isVideo = this.videoCheckpoints[index];
            const dotColor = isVideo ? 0xffcc00 : (this.themeColor || 0xffffff);
            const dotRadius = 18 * this.baseScale;
            const dot = this.add.circle(pos.x, pos.y, dotRadius, dotColor, 1).setStrokeStyle(2, 0xffffff).setDepth(10);
            this.dotObjects.push(dot);

            if (isVideo) {
                const iconSize = (14 * this.baseScale) + 'px';
                const txt = this.add.text(pos.x, pos.y, '▶', { fontSize: iconSize, color: '#000' }).setOrigin(0.5).setDepth(11);
                this.dotTexts.push(txt);
                dot.setInteractive({ useHandCursor: true });
                dot.on('pointerdown', () => {
                    if (this.token && this.token.lastPointIndex >= index) {
                        this.showVideoPopup(this.videoCheckpoints[index], index, true); 
                    }
                });
            }
        });

        // --- E. Top UI ---
        this.titleText.setFontSize(32 * uiScale);
        const radius = Math.round(35 * uiScale);

        this.bookBtn.setVisible(false);
        this.backBtn.setVisible(false);

        // Reset the book button container
        if (this.bookIconContainer) this.bookIconContainer.destroy();
        this.bookIconContainer = this.add.container(0, 0);

        // 1. Background circle
        const bookBg = this.add.graphics();
        bookBg.lineStyle(5, 0x3d2b1f, 1).fillStyle(0xd4a74a, 1);
        bookBg.fillCircle(0, 0, radius).strokeCircle(0, 0, radius);
        bookBg.lineStyle(2, 0xffffff, 0.5).strokeCircle(0, 0, radius * 0.88);
        this.bookIconContainer.add(bookBg);

        // 2. Draw a book icon
        const bookG = this.add.graphics();
        bookG.name = 'bookGraphic'; 
        const bw = radius * 1.0; const bh = radius * 0.75;
        bookG.fillStyle(0x5d4037, 1).fillRoundedRect(-bw/2 + 2, -bh/2 + 2, bw, bh, 4); 
        bookG.fillStyle(0xa52a2a, 1).fillRoundedRect(-bw/2, -bh/2, bw, bh, 4);
        bookG.fillStyle(0xfff5e1, 1).fillRect(-bw*0.42, -bh*0.4, bw*0.84, bh*0.8);
        bookG.lineStyle(1.5, 0x3d2b1f, 0.3).lineBetween(0, -bh*0.4, 0, bh*0.4);
        this.bookIconContainer.add(bookG);

        // 3. ⏳ Load icon (initially hidden)
        const loadingIcon = this.add.text(0, 0, '⏳', { 
            fontSize: (radius * 1.2) + 'px' 
        }).setOrigin(0.5).setVisible(false);
        loadingIcon.name = 'loadingIcon';
        this.bookIconContainer.add(loadingIcon);

        // Reset the back button container
        if (this.backIconContainer) this.backIconContainer.destroy();
        this.backIconContainer = this.add.container(0, 0);
        const backBg = this.add.graphics();
        backBg.lineStyle(5, 0x2c3e50, 1).fillStyle(0x6d7a7a, 1);
        backBg.fillCircle(0, 0, radius).strokeCircle(0, 0, radius);
        backBg.lineStyle(2, 0xffffff, 0.4).strokeCircle(0, 0, radius * 0.88);
        this.backIconContainer.add(backBg);
        const arrowG = this.add.graphics();
        arrowG.fillStyle(0xffffff, 1);
        const aw = radius * 0.6;
        arrowG.beginPath().moveTo(aw/2, -aw*0.8).lineTo(-aw*0.7, 0).lineTo(aw/2, aw*0.8).closePath().fillPath();
        this.backIconContainer.add(arrowG);

        // Layout calculation
        const isNarrowScreen = width < 600;
        const margin = isNarrowScreen ? 15 : 25;
        const backX = margin + radius;
        const backY = margin + radius;
        const bookX = width - margin - radius;
        const bookY = margin + radius;

        this.backIconContainer.setPosition(backX, backY);
        this.bookIconContainer.setPosition(bookX, bookY);
        this.titleText.setOrigin(0.5, 0).setPosition(width / 2, isNarrowScreen ? backY + radius + 10 : 20);

        // Button interaction logic
        const setupBtn = (container, callback) => {
            container.setInteractive(new Phaser.Geom.Circle(0, 0, radius), Phaser.Geom.Circle.Contains);
            container.on('pointerdown', () => container.setScale(0.85));
            container.on('pointerup', () => { 
                container.setScale(1); 
                callback(); 
            });
            container.on('pointerout', () => container.setScale(1));
        };

        setupBtn(this.bookIconContainer, () => {
            const mapKey = this.scene.key;
            if (ReadingState._continentCompletedFlags && ReadingState._continentCompletedFlags[mapKey] === true) {
                this.showStoryQuiz(); 
            } else {
                this.showBookList();
            }
        });

        setupBtn(this.backIconContainer, () => {
            if (this.mapBgm) this.mapBgm.stop();
            this.scene.start('WorldMap');
        });

        // Hierarchy and scaling factor
        this.bookIconContainer.setDepth(2000).setScrollFactor(0);
        this.backIconContainer.setDepth(2000).setScrollFactor(0);
        this.titleText.setDepth(2000).setScrollFactor(0);

        this.token.setScale(0.12 * this.baseScale).setDepth(50);
        const curIdx = this.token.lastPointIndex ?? 0;
        this.token.setPosition(this.pointPositions[curIdx].x, this.pointPositions[curIdx].y);
        this.updateTokenPosition(false);
    }

    // --- The following is the original logic, and deletion is strictly prohibited ---
    showBookList() {
        this._listEnableTime = Date.now();
        const mapKey = this.scene.key;
        const mapCfg = ReadingState.mapConfig[mapKey];
        const globalBooks = ReadingState.globalBooks;
        const completedBookIds = ReadingState.completedBookIds || {};
        const mapSelectedBook = ReadingState.mapSelectedBook || {};
        const currentBookId = mapSelectedBook[mapKey] || null;

        if (!mapCfg || !globalBooks) return;

        // ⭐⭐⭐ Core Modification: Use defined flag to precisely determine whether the current continent has been cleared ⭐⭐⭐
        // Once showFinalCelebration has been triggered on this continent, it will only enter the Quiz and not the Book List.
        if (ReadingState._continentCompletedFlags && ReadingState._continentCompletedFlags[mapKey] === true) {
            console.log("此大陆任务已完成，直接跳转 Quiz 回顾");
            this.showStoryQuiz(); 
            return; 
        }

        const { width, height } = this.scale;
        const isMobile = !this.sys.game.device.os.desktop;
        const uiScale = Phaser.Math.Clamp(width / 1200, 0.8, 1.1);

        if (this.listUI) {
            this.listUI.destroy(true);
            this.listUI = null;
        }

        this.listUI = this.add.container(0, 0).setDepth(10000).setScrollFactor(0);

        // 1. Background mask
        const overlay = this.add.rectangle(0, 0, width, height, 0x0a192f, 0.9)
            .setOrigin(0).setScrollFactor(0).setInteractive();
        this.listUI.add(overlay);

        const titleY = 50 * uiScale;
        const title = this.add.text(width / 2, titleY, "Valitse klassikkokirja", {
            fontSize: `${32 * uiScale}px`,
            color: '#c4973a',
            fontFamily: '"Cinzel Decorative", serif',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);
        this.listUI.add(title);

        const closeBtnY = titleY + (55 * uiScale);
        const closeBtn = this.add.text(width / 2, closeBtnY, "[ PERUUTA ]", {
            fontSize: `${20 * uiScale}px`,
            color: '#ffffff',
            backgroundColor: '#1e3a5f',
            padding: { x: 20, y: 10 },
            fontFamily: 'Nunito'
        })
        .setOrigin(0.5, 0).setInteractive({ useHandCursor: true }).setScrollFactor(0);
        
        closeBtn.on('pointerdown', () => {
            if (this._resizeBookListHandler) {
                this.scale.off('resize', this._resizeBookListHandler, this);
            }
            this.listUI.destroy(true);
        });
        this.listUI.add(closeBtn);

        // 2. List area settings
        const listY = closeBtnY + closeBtn.height + (25 * uiScale);
        const bottomSafety = isMobile ? 120 : 40; 
        const viewH = height - listY - bottomSafety;

        this.scrollContainer = this.add.container(0, listY).setScrollFactor(0);
        this.listUI.add(this.scrollContainer);

        const scrollHitArea = this.add.rectangle(width/2, listY + viewH/2, width, viewH, 0x000000, 0)
            .setInteractive()
            .setScrollFactor(0);
        this.listUI.add(scrollHitArea);

        this.listUI.bringToTop(closeBtn);
        this.listUI.bringToTop(title);

        const maskG = this.add.graphics().setScrollFactor(0).fillStyle(0xffffff, 1)
            .fillRect(0, listY, width, viewH).setVisible(false);
        const mask = maskG.createGeometryMask();
        this.scrollContainer.setMask(mask);

        const availableBooks = globalBooks.map(book => ({
            ...book,
            isCompleted: !!completedBookIds[book.id],
            isCurrent: book.id === currentBookId
        }));

        // 4. Render the book item
        availableBooks.forEach((book, idx) => {
            const itemH = 100 * uiScale;
            const y = idx * itemH;
            let bg = 0x1e3a5f, bd = 0xc4973a, α = 1;
            if (book.isCompleted) { bg = 0x1a2a44; bd = 0x4a5568; α = 0.6; }
            if (book.isCurrent)   { bg = 0x2d4a77; bd = 0xffffff; }

            const btnBg = this.add.rectangle(width/2, y+itemH/2, width*0.8, itemH*0.9, bg, α)
                .setStrokeStyle(2, bd).setScrollFactor(0);

            const text = this.add.text(width*0.15, y+itemH/2, `${book.title}\nBy: ${book.author}`, {
                fontSize:`${18*uiScale}px`, color: book.isCompleted ? '#888888' : '#fdf6e3',
                fontFamily:'Nunito, Arial'
            }).setOrigin(0,0.5).setScrollFactor(0);

            const pct = ReadingState.bookProgress[book.id] || 0;
            const pctText = this.add.text(width*0.85, y+itemH/2, book.isCompleted ? "✔ DONE" : `${pct}%`, {
                fontSize:`${20*uiScale}px`, color: book.isCompleted ? '#00ff88' : '#c4973a',
                fontFamily:'Nunito', fontWeight:'bold'
            }).setOrigin(1,0.5).setScrollFactor(0);

            this.scrollContainer.add([btnBg, text, pctText]);
        });

        // 5. Scrolling Logic 
        const contentH = availableBooks.length * (100 * uiScale);
        const maxY = listY;
        const minY = contentH <= viewH ? maxY : listY - (contentH - viewH);
        let dragging = false, startY = 0, lastD = 0, vel = 0, touchStartTime = 0;

        scrollHitArea.on('wheel', (pointer, deltaX, deltaY) => {
            const scrollSpeed = 0.5; 
            const newY = this.scrollContainer.y - (deltaY * scrollSpeed);
            this.scrollContainer.y = Phaser.Math.Clamp(newY, minY, maxY);
        });

        scrollHitArea.on('pointerdown', p => {
            dragging = true;
            startY = p.y;
            this._rawStartY = p.y;
            touchStartTime = Date.now();
            vel = 0;
        });

        scrollHitArea.on('pointermove', p => {
            if (!dragging) return;
            const d = (p.y - startY) * (isMobile ? 1.5 : 1);
            startY = p.y;
            this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y + d, minY, maxY);
            lastD = d;
        });

        scrollHitArea.on('pointerup', p => {
            dragging = false;
            const duration = Date.now() - touchStartTime;
            const totalDist = Math.abs(p.y - this._rawStartY);

            if (totalDist < 10 && duration < 300) {
                const localY = p.y - this.scrollContainer.y;
                const bookIdx = Math.floor(localY / (100 * uiScale));
                
                if (bookIdx >= 0 && bookIdx < availableBooks.length) {
                    const book = availableBooks[bookIdx];
                    if (Date.now() - this._listEnableTime > 400) {
                        this.scale.off('resize', this._resizeBookListHandler, this);
                        this.listUI.destroy(true);
                        
                        if (book.isCompleted) {
                            this.fetchGutenbergBook(book, mapCfg, true);
                        } else {
                            ReadingState.mapSelectedBook[mapKey] = book.id;
                            this.fetchGutenbergBook(book, mapCfg, false);
                        }
                    }
                }
            } else {
                vel = isMobile ? lastD * 1.8 : lastD;
                this.time.addEvent({
                    delay: 16, repeat: 50,
                    callback: () => {
                        if (!this.listUI) return; 
                        if (Math.abs(vel) < 0.2) return;
                        this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y + vel, minY, maxY);
                        vel *= 0.95;
                    }
                });
            }
        });

        if (this._resizeBookListHandler) {
            this.scale.off('resize', this._resizeBookListHandler, this);
        }
        this._resizeBookListHandler = () => { if (this.listUI) this.showBookList(); };
        this.scale.on('resize', this._resizeBookListHandler, this);
    }

    async fetchGutenbergBook(book, config, readOnly = false) {
    // --- 1. Get the icon component ---
    const bookG = this.bookIconContainer.getByName('bookGraphic');
    const loadingI = this.bookIconContainer.getByName('loadingIcon');

    // --- 2. Switch to loading state (show ⏳, hide 📖) ---
    if (bookG) bookG.setVisible(false);
    if (loadingI) {
        loadingI.setVisible(true);
        // Making the hourglass spin adds a sense of loading.
        this.tweens.add({
            targets: loadingI,
            angle: 360,
            duration: 1000,
            repeat: -1
        });
    }

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
                if (fetchedText.length > 1000) { 
                    success = true; 
                    break; 
                }
            }
        } catch (e) {
            console.error("Proxy error:", e);
        }
    }

    if (success) {
        const startMarkers = ["*** START OF", "CHAPTER I", "Title:"];
        let cleanText = fetchedText;
        for (let m of startMarkers) {
            let idx = fetchedText.indexOf(m);
            if (idx !== -1) { 
                cleanText = fetchedText.substring(idx); 
                break; 
            }
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
            content: `[DEMO CONTENT]\n\nUnable to connect to Project Gutenberg.\n\n${"Preview ".repeat(100)}`,
            readOnly: readOnly
        });
    }

    // --- 3. End loading and restore icons (hide ⏳, show 📖) ---
    if (loadingI) {
        this.tweens.killTweensOf(loadingI);
        loadingI.setAngle(0).setVisible(false);
    }
    if (bookG) bookG.setVisible(true);
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

        // Draw path lines
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
            if (currentIndex === targetIndex) {
                this.checkCheckpointEvents(targetIndex);
                return;
            }

            const moveStep = (current) => {
                if (current === targetIndex) {
                    this.token.lastPointIndex = targetIndex;
                    ReadingState.tokenPositions = ReadingState.tokenPositions || {};
                    ReadingState.tokenPositions[this.scene.key] = targetIndex;
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
                    onStart: () => {
                        this.cameras.main.startFollow(this.token, true, 0.1, 0.1);
                    },
                    onComplete: () => {
                        moveStep(nextI);
                    }
                });
            };

            moveStep(currentIndex);
        } else {
            this.token.setPosition(pos.x, pos.y);
            this.token.lastPointIndex = targetIndex;
            ReadingState.tokenPositions = ReadingState.tokenPositions || {};
            ReadingState.tokenPositions[this.scene.key] = targetIndex;
            this.cameras.main.startFollow(this.token, true, 1, 1);
            this.checkCheckpointEvents(targetIndex);
        }
    }

    checkCheckpointEvents(index) {
        // Video Trigger
        if (this.videoCheckpoints[index]) {
            this.showVideoPopup(this.videoCheckpoints[index], index, false);
        }

        // Quiz Triggered
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

   showVideoPopup(videoData, index, isManual = false) {
        // Debugging: Ensure you see the actual value of index in the console.
        console.log("Current Video Index:", index);

        if (!isManual && this.viewedVideos.has(index)) return;

        // 1) Clean up old pop-ups
        if (this.videoPopupUI) {
            this.videoPopupUI.destroy(true);
        }

        // 2) Basic Configuration
        const { width, height } = this.scale;
        const uiScale = Phaser.Math.Clamp(width / 1200, 0.7, 1.2);
        const depthBase = 9999999;

        // 3) Create a group
        this.videoPopupUI = this.add.group();

        // 4) Masking layer
        const overlay = this.add.rectangle(0, 0, width, height, 0x0a192f, 0.85)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(depthBase)
            .setInteractive();
        this.videoPopupUI.add(overlay);

        // 5) Background frame
        const boxW = 450 * uiScale;
        const boxH = 300 * uiScale;
        const box = this.add.rectangle(width / 2, height / 2, boxW, boxH, 0x1e3a5f)
            .setStrokeStyle(4, 0xc4973a)
            .setScrollFactor(0)
            .setDepth(depthBase + 1);
        this.videoPopupUI.add(box);

        // 6) Title
        const title = this.add.text(width / 2, height / 2 - (100 * uiScale), "💡 LUKUVINKKI AVATTU", {
            fontFamily: '"Cinzel Decorative", serif',
            fontSize: (26 * uiScale) + 'px',
            color: '#c4973a',
            shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 2);
        this.videoPopupUI.add(title);

        // 7) Subheading - Dynamically switch headings based on the index
        let displayTitle = "Liisan seikkailut ihmemaassa"; 
        const currentIdx = String(index); // 

        if (currentIdx === "7") {
            displayTitle = "Seitsemän veljestä -laulu";
        } else if (currentIdx === "30") {
            displayTitle = "Liisan seikkailut ihmemaassa";
        }

        const subTitle = this.add.text(width / 2, height / 2 - (40 * uiScale), displayTitle, {
            fontFamily: 'Nunito, sans-serif',
            fontSize: (18 * uiScale) + 'px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: boxW - 50 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 2);
        this.videoPopupUI.add(subTitle);

        // 8) View button background
        const btnW = 260 * uiScale;
        const btnH = 60 * uiScale;
        const btnBg = this.add.rectangle(width / 2, height / 2 + (50 * uiScale), btnW, btnH, 0xc4973a)
            .setScrollFactor(0)
            .setDepth(depthBase + 2)
            .setInteractive({ useHandCursor: true });
        this.videoPopupUI.add(btnBg);

        // 9) Button Text
        const btnLabel = this.add.text(width / 2, height / 2 + (50 * uiScale), "KATSO TÄSSÄ", {
            fontFamily: 'Nunito',
            fontSize: (20 * uiScale) + 'px',
            color: '#1e3a5f',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 3);
        this.videoPopupUI.add(btnLabel);

        // 10) Close text
        const closeBtn = this.add.text(width / 2, height / 2 + (120 * uiScale), "[ Sulje ]", {
            fontFamily: 'Nunito',
            fontSize: (18 * uiScale) + 'px',
            color: '#a9c1de',
            padding: 10
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 2)
        .setInteractive({ useHandCursor: true });
        this.videoPopupUI.add(closeBtn);

        // --- Core cleanup logic ---
        const cleanup = () => {
            if (this.videoPopupUI) {
                this.videoPopupUI.destroy(true);
                this.videoPopupUI = null;
            }
            this.viewedVideos.add(index);
            this.scale.off('resize', this._resizeVideoHandler);
            window.removeEventListener('keydown', escHandler);
        };

        // --- Interactive Binding ---
        btnBg.on('pointerover', () => { btnBg.setFillStyle(0xd4a74a); });
        btnBg.on('pointerout', () => { btnBg.setFillStyle(0xc4973a); });
        
        btnBg.on('pointerdown', () => {
            // Select different video IDs based on index
            let targetVideoId = "TZoNz-2rk8c"; // Default video number 30 (Alice)
            const currentIdxStr = String(index);
            
            if (currentIdxStr === "7") {
                targetVideoId = "jDZcdgDgM48"; // Video of point 7 (Seven Brothers)
            }

            const embedUrl = `https://www.youtube.com/embed/${targetVideoId}?autoplay=1&rel=0&modestbranding=1`;

            // Create DOM layer
            const videoOverlay = document.createElement('div');
            videoOverlay.id = "video-dom-layer";
            videoOverlay.style = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.95); z-index: 20000000;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 10px; box-sizing: border-box;
            `;

            videoOverlay.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: flex-end; width: min(92vw, 160vh); max-width: 1000px;">
                    <button id="close-dom-video" style="
                        background: #c4973a; color: #1e3a5f; 
                        border: none; padding: 10px 25px; 
                        margin-bottom: 8px;
                        font-weight: bold; cursor: pointer; 
                        border-radius: 4px; font-size: 16px;
                        font-family: sans-serif;
                    ">✕ SULJE </button>
                    
                    <div style="
                        width: 100%; 
                        aspect-ratio: 16/9; 
                        max-height: 70vh; 
                        border: 3px solid #c4973a;
                        background: #000;
                    ">
                        <iframe width="100%" height="100%" src="${embedUrl}" 
                                frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen>
                        </iframe>
                    </div>
                </div>
            `;

            document.body.appendChild(videoOverlay);

            document.getElementById('close-dom-video').onclick = () => {
                const el = document.getElementById('video-dom-layer');
                if (el) document.body.removeChild(el);
            };

            cleanup(); 
        });

        closeBtn.on('pointerdown', () => cleanup());

        // ESC Exit Logic
        const escHandler = (e) => { 
            if (e.key === 'Escape') {
                const domLayer = document.getElementById('video-dom-layer');
                if (domLayer) document.body.removeChild(domLayer);
                cleanup(); 
            }
        };
        window.addEventListener('keydown', escHandler);

        // Window scaling adaptive logic
        this._resizeVideoHandler = () => {
            if (this.videoPopupUI) {
                this.showVideoPopup(videoData, index, true);
            }
        };
        this.scale.on('resize', this._resizeVideoHandler);
    }

    showStoryQuiz() {
    const mapKey = this.scene.key;
    
    // 1. Force close any remaining book list UI elements on the screen.
    if (this.listUI) {
        this.listUI.destroy(true);
        this.listUI = null;
    }
    
    // 2. Mark the state to prevent logical overlap.
    this.isDoingQuiz = true;

    console.log("Attempting to open React Quiz for:", mapKey);
    if (window.openReactQuiz) {
        window.openReactQuiz(mapKey);
    } else {
        console.error("Critical: window.openReactQuiz is undefined!");
    }
}

    showFinalCelebration() {
        const mapKey = this.scene.key;
        // 1) Update complete status
        if (!ReadingState._continentCompletedFlags) {
            ReadingState._continentCompletedFlags = {};
        }
        ReadingState._continentCompletedFlags[mapKey] = true;

        // 2) If the old pop-up already exists, destroy and uninstall the listener first.
        if (this.celebrationUI) {
            this.celebrationUI.destroy(true);
            if (this._resizeCelebrationHandler) {
                this.scale.off('resize', this._resizeCelebrationHandler, this);
                this._resizeCelebrationHandler = null;
            }
        }

        const { width, height } = this.scale;
        const uiScale = Phaser.Math.Clamp(width / 1200, 0.8, 1.2);

        this.celebrationUI = this.add.container(0, 0).setDepth(100000).setScrollFactor(0);

        this.celebrationUI.once('destroy', () => {
            if (this._resizeCelebrationHandler) {
                this.scale.off('resize', this._resizeCelebrationHandler, this);
                this._resizeCelebrationHandler = null;
            }
            this.celebrationUI = null;
        });

        const overlay = this.add.rectangle(0, 0, width, height, 0x0a192f, 0.85).setOrigin(0).setInteractive().setScrollFactor(0);
        this.celebrationUI.add(overlay);

        const boxW = Math.min(width * 0.85, 500 * uiScale);
        const boxH = 300 * uiScale;
        const box = this.add.rectangle(width / 2, height / 2, boxW, boxH, 0x1e3a5f).setStrokeStyle(4, 0xc4973a).setScrollFactor(0);
        this.celebrationUI.add(box);

        const titleMsg = this.add.text(width / 2, height / 2 - (60 * uiScale), "🎉 ONNISTUKSIA!", {
            fontSize: `${32 * uiScale}px`,
            color: '#c4973a',
            fontFamily: '"Cinzel Decorative", serif',
            fontWeight: 'bold',
            shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);
        this.celebrationUI.add(titleMsg);

        const subMsg = this.add.text(width / 2, height / 2 + (15 * uiScale), "Olet suorittanut tutkimusmatkan loppuun!", {
            fontSize: `${20 * uiScale}px`,
            color: '#ffffff',
            fontFamily: 'Nunito, sans-serif',
            align: 'center',
            wordWrap: { width: boxW - 40 }
        }).setOrigin(0.5).setScrollFactor(0);
        this.celebrationUI.add(subMsg);

        const okBtn = this.add.text(width / 2, height / 2 + (90 * uiScale), " SELVÄ ", {
            fontSize: `${22 * uiScale}px`,
            color: '#ffffff',
            backgroundColor: '#c4973a',
            padding: { x: 40, y: 12 },
            fontFamily: 'Nunito',
            fontWeight: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);

        okBtn.on('pointerover', () => okBtn.setBackgroundColor('#d4a74a'));
        okBtn.on('pointerout', () => okBtn.setBackgroundColor('#c4973a'));
        okBtn.on('pointerdown', () => this.celebrationUI.destroy(true));
        this.celebrationUI.add(okBtn);

        this._resizeCelebrationHandler = () => { if (this.celebrationUI) this.showFinalCelebration(); };
        this.scale.on('resize', this._resizeCelebrationHandler, this);

        box.setScale(0.5);
        this.tweens.add({
            targets: [box, titleMsg, subMsg, okBtn],
            scaleX: 1, scaleY: 1, duration: 400, ease: 'Back.easeOut'
        });
    }
}

export default BaseMapScene;