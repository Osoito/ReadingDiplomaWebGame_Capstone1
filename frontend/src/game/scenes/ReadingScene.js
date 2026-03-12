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

        // --- 1. 响应式布局计算 ---
        const isMobile = width < 768;
        const isLandscape = width > height && height < 600; // 特别针对手机横屏
        const isDesktop = width >= 1024;

        let paperWidth = width * 0.94;
        if (width >= 768 && width < 1024) paperWidth = width * 0.85;
        if (isDesktop) paperWidth = Math.min(width * 0.7, 800);

        // 横屏下利用更多的高度空间
        const paperHeight = isLandscape ? height * 0.98 : height * 0.92;
        const centerX = width / 2;
        const centerY = height / 2;
        const paperTop = centerY - paperHeight / 2;
        
        // 动态字体大小
        const titleFontSize = isLandscape ? Math.max(18, height * 0.07) : Math.max(22, Math.min(width * 0.05, 36));
        const bodyFontSize = isMobile ? (isLandscape ? 17 : 18) : 20;

        // --- 2. 视觉层 ---
        const background = this.add.rectangle(0, 0, width, height, 0x0a192f, 0.85).setOrigin(0).setInteractive();
        const paper = this.add.rectangle(centerX, centerY, paperWidth, paperHeight, 0xfdf6e3)
            .setOrigin(0.5)
            .setStrokeStyle(3, 0xc4973a);

        // --- 3. 标题与作者 (横屏下大幅压缩间距) ---
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

        const lineY = authorTxt.y + authorTxt.height + (isLandscape ? 5 : 15);
        const separator = this.add.rectangle(centerX, lineY, paperWidth * 0.8, 1, 0xc4973a, 0.6).setOrigin(0.5);

        // --- 文本清洗逻辑 ---
        const cleanedContent = this.bookData.content
            .replace(/\r\n/g, '\n')
            .replace(/(?<!\n)\n(?!\n)/g, ' ')
            .replace(/[ ]+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();

        // --- 4. 正文区域 (核心适配逻辑) ---
        const contentStartY = lineY + (isLandscape ? 10 : 25);
        
        // 横屏下预留空间必须精确计算：进度条(20px) + 百分比(15px) + 按钮(45px) + 边距(20px) = 约 100px
        const bottomReserved = isLandscape ? 100 : (isMobile ? 135 : 155);
        const contentWindowHeight = Math.max(80, (paperTop + paperHeight - bottomReserved) - contentStartY);
        const horizontalPadding = isMobile ? 40 : 80;

        this.domElement = this.add.dom(centerX, contentStartY).createFromHTML(`
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
                scrollbar-width: thin;
                scrollbar-color: #c4973a transparent;
            ">${cleanedContent}</div>
        `).setOrigin(0.5, 0);

        // --- 5. 进度条逻辑 (横屏下位置紧凑化) ---
        const savedPct = ReadingState.bookProgress[this.bookData.id] || 0;
        this.barW = paperWidth * 0.75;
        
        // barY 紧贴文本区域下方
        const barY = contentStartY + contentWindowHeight + (isLandscape ? 15 : 35);
        
        const barBg = this.add.rectangle(centerX, barY, this.barW, 6, 0xe6e0d0).setOrigin(0.5);
        this.barFill = this.add.rectangle(centerX - this.barW / 2, barY, (savedPct / 100) * this.barW, 6, 0x1e3a5f).setOrigin(0, 0.5);
        
        // 百分比标签在横屏下缩小字号并调近距离
        this.progressLabel = this.add.text(centerX, barY + (isLandscape ? 14 : 20), `${savedPct}%`, {
            fontSize: isLandscape ? '12px' : '14px', 
            color: '#1e3a5f', 
            fontWeight: 'bold', 
            fontFamily: 'Nunito'
        }).setOrigin(0.5);

        const scrollDiv = document.getElementById('phaser-book-content');
        if (scrollDiv) {
            setTimeout(() => {
                const maxScroll = scrollDiv.scrollHeight - scrollDiv.clientHeight;
                if (maxScroll > 0) scrollDiv.scrollTop = maxScroll * (savedPct / 100);
            }, 50);

            scrollDiv.addEventListener('scroll', () => {
                const maxScroll = scrollDiv.scrollHeight - scrollDiv.clientHeight;
                const currentPct = maxScroll > 0 ? Math.round((scrollDiv.scrollTop / maxScroll) * 100) : 0;
                this.barFill.width = (currentPct / 100) * this.barW;
                this.progressLabel.setText(`${currentPct}%`);
                ReadingState.progress = currentPct;
                ReadingState.bookProgress[this.bookData.id] = currentPct;
            });
        }

        // --- 6. 返回按钮 (横屏下微调位置和大小) ---
        const closeBtnY = paperTop + paperHeight - (isLandscape ? 28 : 45);
        const closeBtn = this.add.text(centerX, closeBtnY, ' TAKAISIN KARTALLE ', {
            fontSize: isLandscape ? '14px' : `${Math.max(16, bodyFontSize * 0.9)}px`, 
            color: '#ffffff',
            backgroundColor: '#1e3a5f', 
            padding: { x: 30, y: isLandscape ? 8 : 12 },
            fontFamily: 'Nunito, Arial', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerover', () => closeBtn.setBackgroundColor('#c4973a'));
        closeBtn.on('pointerout', () => closeBtn.setBackgroundColor('#1e3a5f'));
        closeBtn.on('pointerdown', () => this.handleExit(scrollDiv), this);
        
        this.uiContainer.add([background, paper, titleTxt, authorTxt, separator, barBg, this.barFill, this.progressLabel, closeBtn]);
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