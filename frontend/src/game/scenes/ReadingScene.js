import Phaser from 'phaser';
import ReadingState from '../state.js';

class ReadingScene extends Phaser.Scene {
    constructor() {
        super('ReadingScene');
        this.uiContainer = null;
        this.domElement = null;
        this.isRendering = false;
    }

    init(data) {
        this.sourceMap = data.prevScene;
        this.bookTitle = data.mapTitle;
        this.storageKey = data.storageKey;
        this.bookData = data.bookContent || {
            id: 'unknown', title: "Unknown Book", author: "Unknown", content: "No content available."
        };
        this.readOnly = data.readOnly || false;
    }

    create() {
        this.initializeUI();
        this.scale.on('resize', this.initializeUI, this);
    }
    
    async initializeUI() {
        await document.fonts.ready;
        this.renderUI();
    }

    renderUI() {
        if (this.isRendering) return;
        this.isRendering = true;

        const { width, height } = this.scale;

        if (this.uiContainer) this.uiContainer.destroy();
        if (this.domElement) this.domElement.destroy();
        
        this.uiContainer = this.add.container(0, 0);

        // --- 1. Responsive layout calculation (retaining original adaptation logic) ---
        const isMobile = width < 768;
        const isLandscape = width > height && height < 600;
        const isDesktop = width >= 1024;

        let paperWidth = width * 0.94;
        if (width >= 768 && width < 1024) paperWidth = width * 0.85;
        if (isDesktop) paperWidth = Math.min(width * 0.7, 800);

        const paperHeight = isLandscape ? height * 0.98 : height * 0.92;
        const centerX = width / 2;
        const centerY = height / 2;
        const paperTop = centerY - paperHeight / 2;
        
        const titleFontSize = isLandscape ? Math.max(18, height * 0.07) : Math.max(22, Math.min(width * 0.05, 36));
        const bodyFontSize = isMobile ? (isLandscape ? 17 : 18) : 20;

        // --- 2. Visual Layer ---
        const background = this.add.rectangle(0, 0, width, height, 0x0a192f, 0.85).setOrigin(0).setInteractive();
        const paper = this.add.rectangle(centerX, centerY, paperWidth, paperHeight, 0xfdf6e3)
            .setOrigin(0.5)
            .setStrokeStyle(3, 0xc4973a);

        // --- 3. Title and Author ---
        const titleY = paperTop + (isLandscape ? 10 : paperHeight * 0.06);
        const titleTxt = this.add.text(centerX, titleY, this.bookData.title, {
            fontSize: `${titleFontSize}px`, color: '#1e3a5f', fontWeight: 'bold',
            wordWrap: { width: paperWidth - 80 }, align: 'center',
            fontFamily: '"Cinzel Decorative", serif',
            shadow: { offsetX: 0, offsetY: 2, color: 'rgba(30, 20, 5, 0.2)', blur: 3, fill: true }
        }).setOrigin(0.5, 0);

        const authorTxt = this.add.text(centerX, titleTxt.y + titleTxt.height + (isLandscape ? 2 : 10), `Kirjailija: ${this.bookData.author}`, {
            fontSize: `${bodyFontSize * 0.8}px`, color: '#8d6e63', fontFamily: 'Nunito, sans-serif'
        }).setOrigin(0.5, 0);

        // --- 4. Progress Bar (New location: below the author) ---
        const savedPct = ReadingState.bookProgress[this.bookData.id] || 0;
        const barY = authorTxt.y + authorTxt.height + (isLandscape ? 15 : 25);
        this.barW = paperWidth * 0.7; 
        
        const barBg = this.add.rectangle(centerX, barY, this.barW, 6, 0xe6e0d0).setOrigin(0.5);
        this.barFill = this.add.rectangle(centerX - this.barW / 2, barY, (savedPct / 100) * this.barW, 6, 0x1e3a5f).setOrigin(0, 0.5);
        
        this.progressLabel = this.add.text(centerX, barY + (isLandscape ? 14 : 20), `${savedPct}%`, {
            fontSize: isLandscape ? '12px' : '14px', color: '#1e3a5f', fontWeight: 'bold', fontFamily: 'Nunito'
        }).setOrigin(0.5);

        // Move the separator line below the progress bar
        const lineY = this.progressLabel.y + this.progressLabel.height + (isLandscape ? 5 : 10);
        const separator = this.add.rectangle(centerX, lineY, paperWidth * 0.8, 1, 0xc4973a, 0.6).setOrigin(0.5);

        // --- 5. Text Cleaning Logic (Completely Preserving Original Regular Expressions) ---
        const cleanedContent = this.bookData.content
            .replace(/\r\n/g, '\n')
            .replace(/(?<!\n)\n(?!\n)/g, ' ')
            .replace(/[ ]+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();

        // --- 6. Content Area (DOM) and HTML Close Button ---
        const contentStartY = lineY + (isLandscape ? 10 : 25);
        const bottomReserved = isLandscape ? 30 : 50; 
        const contentWindowHeight = Math.max(80, (paperTop + paperHeight - bottomReserved) - contentStartY);
        const horizontalPadding = isMobile ? 40 : 80;

        this.domElement = this.add.dom(centerX, contentStartY).createFromHTML(`
            <div style="position: relative; width: ${paperWidth}px; display: flex; flex-direction: column; align-items: center;">
                <button id="close-book-btn" style="
                    position: absolute;
                    right: ${isLandscape ? '10px' : '20px'};
                    top: -${isLandscape ? '50px' : '90px'}; 
                    background: #1e3a5f;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 22px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10001;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                ">✕</button>

                <div id="phaser-book-content" style="
                    width: ${paperWidth - horizontalPadding}px;
                    height: ${contentWindowHeight}px;
                    overflow-y: auto;
                    color: #2b2b2b;
                    font-family: 'Nunito', 'Georgia', serif;
                    font-size: ${bodyFontSize}px;
                    line-height: 1.6;
                    padding-right: 15px;
                    user-select: text;
                    white-space: pre-wrap; 
                    word-wrap: break-word;
                    text-align: justify;
                ">${cleanedContent}</div>
            </div>
        `).setOrigin(0.5, 0);

        // --- 7. Event Binding (Preserve Original Scrolling Logic) ---
        const htmlBtn = document.getElementById('close-book-btn');
        if (htmlBtn) {
            htmlBtn.onclick = () => this.handleExit(document.getElementById('phaser-book-content'));
        }

        const scrollDiv = document.getElementById('phaser-book-content');
        if (scrollDiv) {
            // Reserve a 50ms delay to restore position logic
            setTimeout(() => {
                const maxScroll = scrollDiv.scrollHeight - scrollDiv.clientHeight;
                if (maxScroll > 0) scrollDiv.scrollTop = maxScroll * (savedPct / 100);
            }, 50);

            scrollDiv.addEventListener('scroll', () => {
                const maxScroll = scrollDiv.scrollHeight - scrollDiv.clientHeight;
                const currentPct = maxScroll > 0 ? Math.round((scrollDiv.scrollTop / maxScroll) * 100) : 0;
                
                // Real-time UI synchronization
                this.barFill.width = (currentPct / 100) * this.barW;
                this.progressLabel.setText(`${currentPct}%`);
                
                // Real-time synchronization to ReadingState (preserving original logic)
                ReadingState.progress = currentPct;
                ReadingState.bookProgress[this.bookData.id] = currentPct;
            });
        }

        // --- 8. Composite Containers ---
        this.uiContainer.add([background, paper, titleTxt, authorTxt, barBg, this.barFill, this.progressLabel, separator]);
        this.isRendering = false;
    }

    handleExit(scrollDiv) {
        if (scrollDiv) {
            const maxScroll = scrollDiv.scrollHeight - scrollDiv.clientHeight;
            const finalPct = maxScroll > 0 ? Math.round((scrollDiv.scrollTop / maxScroll) * 100) : 0;
            ReadingState.bookProgress[this.bookData.id] = finalPct;
            
            if (!this.readOnly && this.sourceMap) {
                const cfg = ReadingState.mapConfig[this.sourceMap];
                if (cfg) {
                    ReadingState[cfg.storage] = finalPct;
                    if (finalPct >= 100) this.handleMapUnlock();
                }
            }
        }
        this.exitScene();
    }

    handleMapUnlock() {
        if (!ReadingState.completedBookIds[this.bookData.id]) {
            ReadingState.completedBookIds[this.bookData.id] = true;
            ReadingState.booksRead += 1;
        }
        const order = ReadingState.mapOrder || [];
        const idx = order.indexOf(this.sourceMap);
        if (idx !== -1 && idx < order.length - 1) {
            const nextMap = order[idx + 1];
            if (ReadingState.mapUnlock && nextMap) ReadingState.mapUnlock[nextMap] = true;
        }

        // Save level completion to backend (fire-and-forget)
        const userId = this.game.registry.get('userId');
        ReadingState.saveLevelComplete(this.sourceMap, userId);
    }

    exitScene() {
        this.scale.off('resize', this.initializeUI, this);
        this.scene.resume(this.sourceMap);
        const mapScene = this.scene.get(this.sourceMap);
        if (mapScene && mapScene.input) mapScene.input.enabled = true;
        this.scene.stop();
    }
}

export default ReadingScene;