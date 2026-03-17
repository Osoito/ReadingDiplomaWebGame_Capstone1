import Phaser from 'phaser';
import ReadingState from '../state.js';
import ModalBuilder from '../ui/ModalBuilder.js';
import { COLORS, CSS_COLORS, FONTS, uiScale as calcUiScale } from '../ui/constants.js';
import pandaIdlePng from '../../assets/buddyAvatar/panda/panda_idle.png';
import pandaIdleJson from '../../assets/buddyAvatar/panda/panda_idle.json';
import buddiesPortraitImg from '../../assets/buddyAvatar/buddies-0001.png';

class BaseMapScene extends Phaser.Scene {

    constructor(key, assetKey, title) {
        super(key);
        this.assetKey = assetKey;
        this.title = title;
        
        // --- 原始逻辑：功能锁与配置 ---
        this.isDoingQuiz = false; 

        // --- 原始逻辑：Video 检查点定义 ---
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

        // --- 原始逻辑：已观看视频记录 ---
        this.viewedVideos = new Set();
        
        // 动态对象容器
        this.dotObjects = [];
        this.dotTexts = [];
    }

    preloadBuddy() {
        this.load.atlas('buddy_panda_idle', pandaIdlePng, pandaIdleJson);
        this.load.spritesheet('buddies_portraits', buddiesPortraitImg, {
            frameWidth: 590, frameHeight: 779
        });
    }

        create() {
        const { width, height } = this.scale;

        // 1. 初始化背景
        this.bg = this.add.image(0, 0, this.assetKey).setOrigin(0);
        
        // 2. 初始化路径图形层（必须在 Token 下方）
        this.pathGraphics = this.add.graphics();
        this.pathGraphics.setDepth(5);

        // 3. 初始化标题文本 (带原始 Stroke 样式)
        this.titleText = this.add.text(0, 0, this.title, {
            fontSize: '32px', 
            color: '#fff', 
            stroke: '#000', 
            strokeThickness: 4
        });
        this.titleText.setOrigin(0.5, 0);
        this.titleText.setScrollFactor(0);
        this.titleText.setDepth(2000);

        // 4. 初始化返回按钮 (带原始颜色和 Padding)
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

        // 5. 初始化书籍按钮 (带原始颜色和 📖 符号)
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
            const mapKey = this.scene.key;
            const cfg = ReadingState.mapConfig[mapKey];
            const storageKey = cfg.storage;
            const continentProg = ReadingState[storageKey] || 0;

            if (continentProg >= 100) {
                this.showStoryQuiz();
                return;
            }
            this.showBookList();
        });

        // 6. Initialize buddy token
        const savedIndex = ReadingState.tokenPositions?.[this.scene.key] ?? 0;
        const buddyId = this.game.registry.get('buddyId') || 'buddy_1';
        const BUDDY_FRAME = { buddy_2: 1, buddy_3: 2 };

        if (buddyId === 'buddy_1') {
            this.token = this.add.sprite(0, 0, 'buddy_panda_idle');
            if (!this.anims.exists('panda_idle')) {
                this.anims.create({
                    key: 'panda_idle',
                    frames: this.anims.generateFrameNames('buddy_panda_idle'),
                    frameRate: 1000 / 300,
                    repeat: -1
                });
            }
            this.token.play('panda_idle');
            this.tokenBaseScale = 0.1;
        } else if (BUDDY_FRAME[buddyId] != null) {
            this.token = this.add.sprite(0, 0, 'buddies_portraits', BUDDY_FRAME[buddyId]);
            this.tokenBaseScale = 0.1;
        } else {
            this.token = this.add.sprite(0, 0, 'buddies_portraits', 0);
            this.tokenBaseScale = 0.1;
        }

        this.token.setScale(this.tokenBaseScale);
        this.token.setDepth(10);
        this.token.lastPointIndex = savedIndex;

        // 7. 原始交互监听：拖拽摄像机
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                this.cameras.main.stopFollow();
                this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
                this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
            }
        });

        // 8. 音频上下文恢复
        this.input.once('pointerdown', () => {
            if (this.sound.context && this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
        });

        // 9. 场景恢复监听
        this.events.on('resume', () => {
            this.input.enabled = true;
            this.time.delayedCall(100, () => {
                this.updateTokenPosition(true);
            });
        });

        // Book button gentle bounce to attract attention
        this.tweens.add({
            targets: this.bookBtn,
            y: height - 24,
            duration: 1600,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // ⭐⭐⭐ 核心修复：调整初始化顺序 ⭐⭐⭐
        // 1. 现在标记场景已完全就绪，这样 handleResize 内部的 camera 调用就不会失败
        this.isReady = true;

        // 2. 安全地进行第一次布局计算，这会创建 pointPositions 数组
        this.handleResize();

        // 3. 然后再设置未来的 resize 事件监听
        this.scale.on('resize', this.handleResize, this);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scale.off('resize', this.handleResize, this);
        });

        // 4. 最后，安全地调用 updateTokenPosition，因为它现在可以确定 pointPositions 存在
        this.time.delayedCall(50, () => {
            this.updateTokenPosition(false);
        });
    }

    // ⭐ 适配微调逻辑：确保在各种设备上 UI 大小和位置都正确，并解决重合问题
    handleResize() {
        const { width, height } = this.scale;
        
        // A. 背景 Cover 适配
        this.baseScale = Math.max(width / this.bg.width, height / this.bg.height);
        this.bg.setScale(this.baseScale);
        this.cameras.main.setBounds(0, 0, this.bg.displayWidth, this.bg.displayHeight);

        // B. UI 缩放因子：根据屏幕宽度自适应文字大小
        const uiScale = Phaser.Math.Clamp(width / 1200, 0.7, 1.2);

        // C. 更新地图坐标点（根据 baseScale 重算）
        this.pointPositions = this.rawPoints.map(p => ({
            x: p.x * this.baseScale,
            y: p.y * this.baseScale
        }));

        // D. 销毁并重建地图点图标
        this.dotObjects.forEach(d => d.destroy());
        this.dotTexts.forEach(t => t.destroy());
        this.dotObjects = [];
        this.dotTexts = [];

        // Stop old dot tweens
        if (this._dotTweens) this._dotTweens.forEach(t => t.stop());
        this._dotTweens = [];

        const currentIdx = this.token?.lastPointIndex ?? 0;

        this.pointPositions.forEach((pos, index) => {
            const isVideo = this.videoCheckpoints[index];
            const dotRadius = Math.max(12, 18 * this.baseScale);
            const isVisited = index <= currentIdx;
            const isCurrent = index === currentIdx;

            // Visual differentiation: visited = bright, unvisited = faded outline
            let dotColor, dotAlpha, strokeColor;
            if (isVideo) {
                dotColor = 0xffcc00;
                dotAlpha = isVisited ? 1 : 0.4;
                strokeColor = 0xffffff;
            } else if (isVisited) {
                dotColor = this.themeColor || 0xc4973a;
                dotAlpha = 1;
                strokeColor = 0xffd700;
            } else {
                dotColor = 0xffffff;
                dotAlpha = 0.3;
                strokeColor = 0xaaaaaa;
            }

            const dot = this.add.circle(pos.x, pos.y, dotRadius, dotColor, dotAlpha);
            dot.setStrokeStyle(2, strokeColor);
            this.dotObjects.push(dot);

            // Current position: pulsing glow
            if (isCurrent && !isVideo) {
                const tw = this.tweens.add({
                    targets: dot,
                    scaleX: 1.3, scaleY: 1.3,
                    alpha: 0.5,
                    duration: 800, ease: 'Sine.easeInOut',
                    yoyo: true, repeat: -1
                });
                this._dotTweens.push(tw);
            }

            // Last waypoint: flag emoji
            if (index === this.pointPositions.length - 1) {
                const flag = this.add.text(pos.x, pos.y - dotRadius - 6 * this.baseScale, '🏁', {
                    fontSize: `${Math.round(16 * this.baseScale)}px`
                }).setOrigin(0.5, 1);
                this.dotTexts.push(flag);
            }

            if (isVideo) {
                const iconSize = (14 * this.baseScale) + 'px';
                const txt = this.add.text(pos.x, pos.y, '▶', {
                    fontSize: iconSize,
                    color: '#000'
                });
                txt.setOrigin(0.5);
                this.dotTexts.push(txt);

                dot.setInteractive({ useHandCursor: true });
                dot.on('pointerdown', () => {
                    if (this.token && this.token.lastPointIndex >= index) {
                        this.showVideoPopup(this.videoCheckpoints[index], index, true);
                    }
                });
            }
        });

        // E. 重新定位固定 UI 元素并调整字体大小
        this.titleText.setFontSize(32 * uiScale);
        this.backBtn.setFontSize(18 * uiScale);
        this.bookBtn.setFontSize(28 * uiScale);

        // ⭐ 错开位置逻辑：解决标题和返回按钮重合问题
        const isNarrowScreen = width < 600; // 判定是否为窄屏（手机竖屏）

        if (isNarrowScreen) {
            // --- 窄屏模式：垂直布局 ---
            // 1. 返回按钮在最上方左侧
            this.backBtn.setOrigin(0, 0); // 确保 Origin 在左上角
            this.backBtn.setPosition(15, 15); // 留出一点边距

            // 2. 标题下移，位于返回按钮下方，且居中
            // 计算返回按钮的高度（ Phraser Text 的高度受 FontSize 和 Padding 影响）
            const backBtnHeight = this.backBtn.height;
            const titleY = 15 + backBtnHeight + 10; // 按钮下方留 10px 间距

            this.titleText.setOrigin(0.5, 0); // Origin 在顶部居中
            this.titleText.setPosition(width / 2, titleY);
        } else {
            // --- 宽屏模式：原始布局 ---
            // 1. 返回按钮在左上角
            this.backBtn.setOrigin(0, 0);
            this.backBtn.setPosition(20, 20);

            // 2. 标题在最上方正中间
            this.titleText.setOrigin(0.5, 0);
            this.titleText.setPosition(width / 2, 20);
        }

        // 书籍按钮始终在左下角
        this.bookBtn.setPosition(20, height - 20);

        // F. 更新 Token 位置
        this.token.setScale((this.tokenBaseScale || 0.1) * this.baseScale);
        const curIdx = this.token.lastPointIndex ?? 0;
        this.token.setPosition(this.pointPositions[curIdx].x, this.pointPositions[curIdx].y);
        
        // G. 重新绘制路径
        this.updateTokenPosition(false);
    }

    // --- 以下为原始业务逻辑，严禁删减 ---

    showBookList() {
      const mapKey = this.scene.key;
      const mapCfg = ReadingState.mapConfig[mapKey];
      const globalBooks = ReadingState.globalBooks;
      const completedBookIds = ReadingState.completedBookIds || {};
      const mapSelectedBook = ReadingState.mapSelectedBook || {};
      const currentBookId = mapSelectedBook[mapKey] || null;

      if (!mapCfg || !globalBooks) return;

      // Cleanup previous
      if (this._bookListModal) this._bookListModal.destroy();

      const { width, height } = this.scale;
      const s = Phaser.Math.Clamp(width / 1200, 0.8, 1.1);

      // Use a simple container (book list has custom scroll, not a standard modal box)
      const modal = new ModalBuilder(this);
      this._bookListModal = modal;

      this.listUI = this.add.container(0, 0).setDepth(10000).setScrollFactor(0);
      modal.container = this.listUI; // let ModalBuilder manage resize cleanup

      // Overlay
      const overlay = this.add.rectangle(0, 0, width, height, COLORS.DARK_NAVY, 0.9)
          .setOrigin(0).setInteractive().setScrollFactor(0);
      this.listUI.add(overlay);

      // Title
      const title = this.add.text(width / 2, 60 * s, "Valitse klassikkokirja", {
          fontSize: `${32 * s}px`, color: CSS_COLORS.GOLD,
          fontFamily: FONTS.HEADING, fontWeight: 'bold'
      }).setOrigin(0.5).setScrollFactor(0);
      this.listUI.add(title);

      // Scroll area
      const listY = 130 * s;
      const viewH = height - (220 * s);

      this.scrollContainer = this.add.container(0, listY).setScrollFactor(0);
      this.listUI.add(this.scrollContainer);

      const maskG = this.add.graphics().setScrollFactor(0)
          .fillStyle(0xffffff, 1).fillRect(0, listY, width, viewH).setVisible(false);
      this.scrollContainer.setMask(maskG.createGeometryMask());

      const availableBooks = globalBooks.map(book => ({
          ...book,
          isCompleted: !!completedBookIds[book.id],
          isCurrent: book.id === currentBookId
      }));

      availableBooks.forEach((book, idx) => {
          const itemH = 100 * s;
          const y = idx * itemH;
          let bg = COLORS.NAVY, bd = COLORS.GOLD, a = 1;
          if (book.isCompleted) { bg = 0x1a2a44; bd = 0x4a5568; a = 0.6; }
          if (book.isCurrent)   { bg = 0x2d4a77; bd = COLORS.WHITE; }

          const btnBg = this.add.rectangle(width/2, y+itemH/2, width*0.8, itemH*0.9, bg, a)
              .setStrokeStyle(2, bd).setInteractive({ useHandCursor: true }).setScrollFactor(0);

          const pct = ReadingState.bookProgress[book.id] || 0;
          const pctLabel = book.isCompleted ? "✔ VALMIS" : `${pct}%`;

          const text = this.add.text(width*0.15, y+itemH/2, `${book.title}\n${book.author}`, {
              fontSize: `${18*s}px`, color: book.isCompleted ? CSS_COLORS.GREY : CSS_COLORS.PARCHMENT,
              fontFamily: FONTS.BODY, align: 'left'
          }).setOrigin(0, 0.5).setScrollFactor(0);

          const pctText = this.add.text(width*0.85, y+itemH/2, pctLabel, {
              fontSize: `${20*s}px`, color: book.isCompleted ? '#00ff88' : CSS_COLORS.GOLD,
              fontFamily: FONTS.BODY, fontWeight: 'bold'
          }).setOrigin(1, 0.5).setScrollFactor(0);

          btnBg.on('pointerdown', () => {
              const dragDist = Math.abs(this.input.activePointer.upY - this.input.activePointer.downY);
              if (dragDist >= 15) return;
              if (this._bookListModal) { this._bookListModal.destroy(); this._bookListModal = null; }
              if (book.isCompleted) {
                  this.fetchGutenbergBook(book, mapCfg, true);
              } else {
                  ReadingState.mapSelectedBook[mapKey] = book.id;
                  this.fetchGutenbergBook(book, mapCfg, false);
              }
          });

          this.scrollContainer.add([btnBg, text, pctText]);
      });

      // Scroll inertia
      const contentH = availableBooks.length * (100 * s);
      const maxY = listY;
      const minY = contentH <= viewH ? maxY : listY - (contentH - viewH);

      let dragging = false, startY = 0, last = 0, vel = 0;
      overlay.on('pointerdown', p => { dragging = true; startY = p.y; vel = 0; });
      overlay.on('pointermove', p => {
          if (!dragging) return;
          const d = p.y - startY; startY = p.y;
          this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y + d, minY, maxY);
          last = d;
      });
      overlay.on('pointerup', () => {
          dragging = false; vel = last;
          this.time.addEvent({
              delay: 16, repeat: 40,
              callback: () => {
                  if (Math.abs(vel) < 0.5) return;
                  this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y + vel, minY, maxY);
                  vel *= 0.9;
              }
          });
      });
      this.input.on('wheel', (_, __, dx, dy) => {
          if (this.listUI && this.listUI.active) {
              this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y - dy * 0.5, minY, maxY);
          }
      });

      // Close button
      const closeBtn = this.add.text(width/2, height - (40*s), "[ Peruuta ]", {
          fontSize: `${20*s}px`, color: CSS_COLORS.WHITE,
          backgroundColor: '#1e3a5f', padding: 10, fontFamily: FONTS.BODY
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);

      closeBtn.on('pointerover', () => closeBtn.setBackgroundColor('#c4973a'));
      closeBtn.on('pointerout',  () => closeBtn.setBackgroundColor('#1e3a5f'));
      closeBtn.on('pointerdown', () => {
          if (this._bookListModal) { this._bookListModal.destroy(); this._bookListModal = null; }
      });
      this.listUI.add(closeBtn);

      modal.enableAutoResize(() => {
          if (this._bookListModal) {
              this._bookListModal.destroy();
              this._bookListModal = null;
              this.showBookList();
          }
      });
  }

    async fetchGutenbergBook(book, config, readOnly = false) {
        // Show playful loading overlay
        const { width, height } = this.scale;
        const spinnerGroup = this.add.container(0, 0).setDepth(10000).setScrollFactor(0);
        const spinnerOverlay = this.add.rectangle(0, 0, width, height, 0x0a192f, 0.7)
            .setOrigin(0).setScrollFactor(0).setInteractive();
        spinnerGroup.add(spinnerOverlay);

        // Bouncing book emoji
        const bookEmoji = this.add.text(width / 2, height / 2 - 20, '📖', {
            fontSize: '48px'
        }).setOrigin(0.5).setScrollFactor(0);
        spinnerGroup.add(bookEmoji);
        this.tweens.add({
            targets: bookEmoji,
            y: height / 2 - 40,
            angle: { from: -8, to: 8 },
            duration: 600, ease: 'Sine.easeInOut',
            yoyo: true, repeat: -1
        });

        // Animated dots text
        const spinnerText = this.add.text(width / 2, height / 2 + 35, 'Ladataan kirjaa', {
            fontSize: '20px', color: '#fdf6e3', fontFamily: 'Nunito, sans-serif',
            fontStyle: 'italic'
        }).setOrigin(0.5).setScrollFactor(0);
        spinnerGroup.add(spinnerText);

        let dotCount = 0;
        const spinnerTimer = this.time.addEvent({
            delay: 400, loop: true,
            callback: () => {
                dotCount = (dotCount + 1) % 4;
                spinnerText.setText('Ladataan kirjaa' + '.'.repeat(dotCount));
            }
        });

        // Sparkle ring around book
        const arc = this.add.graphics().setScrollFactor(0);
        let angle = 0;
        const arcTimer = this.time.addEvent({
            delay: 30, loop: true,
            callback: () => {
                arc.clear();
                arc.lineStyle(3, 0xffd700, 0.7);
                arc.beginPath();
                arc.arc(width / 2, height / 2 - 20, 38, Phaser.Math.DegToRad(angle), Phaser.Math.DegToRad(angle + 90), false);
                arc.strokePath();
                arc.beginPath();
                arc.arc(width / 2, height / 2 - 20, 38, Phaser.Math.DegToRad(angle + 180), Phaser.Math.DegToRad(angle + 270), false);
                arc.strokePath();
                angle = (angle + 5) % 360;
            }
        });
        spinnerGroup.add(arc);

        const destroySpinner = () => {
            spinnerTimer.remove();
            arcTimer.remove();
            spinnerGroup.destroy(true);
        };

        // Parallel proxy fetch with Promise.any
        const proxies = [
            "https://api.allorigins.win/raw?url=",
            "https://corsproxy.io/?",
            "https://api.codetabs.com/v1/proxy/?quest="
        ];
        const targetUrl = `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.txt`;

        let success = false;
        let fetchedText = "";

        try {
            fetchedText = await Promise.any(
                proxies.map(async (proxy) => {
                    const response = await fetch(proxy + encodeURIComponent(targetUrl), {
                        signal: AbortSignal.timeout(5000)
                    });
                    if (!response.ok) throw new Error('Not OK');
                    const text = await response.text();
                    if (text.length <= 1000) throw new Error('Too short');
                    return text;
                })
            );
            success = true;
        } catch (e) {
            console.error("All proxies failed:", e);
        }

        destroySpinner();

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

        // Draw path: faded full trail + bright walked trail
        if (this.pathGraphics) {
            this.pathGraphics.clear();
            const tc = this.themeColor || 0xffffff;

            // Full path (faded dotted line)
            if (this.pointPositions.length >= 2) {
                this.pathGraphics.lineStyle(2, tc, 0.15);
                for (let i = 0; i < this.pointPositions.length - 1; i++) {
                    const a = this.pointPositions[i];
                    const b = this.pointPositions[i + 1];
                    const dx = b.x - a.x, dy = b.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const dashLen = 8, gapLen = 6;
                    let drawn = 0;
                    while (drawn < dist) {
                        const s = drawn / dist;
                        const e = Math.min((drawn + dashLen) / dist, 1);
                        this.pathGraphics.beginPath();
                        this.pathGraphics.moveTo(a.x + dx * s, a.y + dy * s);
                        this.pathGraphics.lineTo(a.x + dx * e, a.y + dy * e);
                        this.pathGraphics.strokePath();
                        drawn += dashLen + gapLen;
                    }
                }
            }

            // Walked path (bright solid line)
            if (targetIndex >= 1) {
                this.pathGraphics.lineStyle(4, tc, 0.6);
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
        // Video 触发
        if (this.videoCheckpoints[index]) {
            this.showVideoPopup(this.videoCheckpoints[index], index, false);
        }

        // 终点 Quiz 触发
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
        if (!isManual && this.viewedVideos.has(index)) return;

        // Cleanup previous popup
        if (this._videoModal) this._videoModal.destroy();

        const modal = new ModalBuilder(this);
        this._videoModal = modal;

        const { width, height, uiScale: s } = modal.createFrame({
            title: '💡 LUKUVINKKI AVATTU',
            maxWidth: 450,
            boxHeight: 300,
            depth: 9999999,
            useContainer: false
        });

        const depthBase = 9999999;

        // Subtitle
        const subTitle = this.add.text(width / 2, height / 2 - (40 * s), videoData.title, {
            fontFamily: FONTS.BODY, fontSize: (18 * s) + 'px', color: CSS_COLORS.WHITE,
            align: 'center', wordWrap: { width: width * 0.6 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 2);
        modal.container.add(subTitle);

        // Watch button
        const btnBg = this.add.rectangle(width / 2, height / 2 + (50 * s), 260 * s, 60 * s, COLORS.GOLD)
            .setScrollFactor(0).setDepth(depthBase + 2).setInteractive({ useHandCursor: true });
        const btnLabel = this.add.text(width / 2, height / 2 + (50 * s), "KATSO YOUTUBESSA", {
            fontFamily: FONTS.BODY, fontSize: (20 * s) + 'px', color: CSS_COLORS.NAVY, fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 3);
        modal.container.addMultiple([btnBg, btnLabel]);

        // Close button
        const closeBtn = this.add.text(width / 2, height / 2 + (120 * s), "[ Sulje ]", {
            fontFamily: FONTS.BODY, fontSize: (18 * s) + 'px', color: CSS_COLORS.LIGHT_BLUE, padding: 10
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 2).setInteractive({ useHandCursor: true });
        modal.container.add(closeBtn);

        const cleanup = () => {
            this.viewedVideos.add(index);
            if (this._videoModal) { this._videoModal.destroy(); this._videoModal = null; }
        };

        btnBg.on('pointerover', () => btnBg.setFillStyle(COLORS.GOLD_HOVER));
        btnBg.on('pointerout',  () => btnBg.setFillStyle(COLORS.GOLD));
        btnBg.on('pointerdown', () => {
            const url = videoData.url;
            cleanup();
            if (url) this.time.delayedCall(10, () => window.open(url, '_blank'));
        });
        closeBtn.on('pointerdown', () => cleanup());

        modal.enableEscClose(cleanup);
        modal.enableAutoResize(() => {
            if (this._videoModal) this.showVideoPopup(videoData, index, true);
        });
    }

    showStoryQuiz() {
      const mapKey = this.scene.key;

      // Initialize quiz state
      if (!ReadingState.quizAnswers) ReadingState.quizAnswers = {};
      const saved = ReadingState.quizAnswers[mapKey];
      if (saved) {
          this.tempAnswers = [...saved];
      } else if (!this.tempAnswers) {
          this.tempAnswers = ["", "", ""];
      }
      this._quizStep = this._quizStep != null ? this._quizStep : 0;
      const currentStep = this._quizStep;
      const isReadOnly = !!saved;
      this.isDoingQuiz = true;

      // Cleanup previous
      if (this._quizModal) this._quizModal.destroy();

      const modal = new ModalBuilder(this);
      this._quizModal = modal;

      const { container, width, height, uiScale: s } = modal.createFrame({
          title: isReadOnly ? "POHDINTASI" : "TARINAKYSELY",
          widthRatio: 0.85,
          boxHeight: 480,
          depth: 100000
      });

      // Book subtitle
      const bookData = ReadingState.globalBooks?.find(b => b.id === ReadingState.mapSelectedBook?.[mapKey]);
      const bookTitle = bookData ? bookData.title : "The Classic Story";
      const bookLabel = this.add.text(width / 2, height / 2 - (135 * s), `Kirja: ${bookTitle}`, {
          fontSize: `${18 * s}px`, color: CSS_COLORS.PARCHMENT,
          fontFamily: FONTS.BODY, fontStyle: 'italic'
      }).setOrigin(0.5).setScrollFactor(0);
      container.add(bookLabel);

      // Questions in Finnish
      const questions = [
          "Mikä on tarinan juoni?",
          "Ketkä ovat tarinan päähenkilöt?",
          "Mitä ajatuksia tai tunteita tarina herätti sinussa?"
      ];

      const qText = this.add.text(width / 2, height / 2 - (80 * s), questions[currentStep], {
          fontSize: `${20 * s}px`, color: CSS_COLORS.WHITE,
          fontFamily: FONTS.BODY, align: 'center', wordWrap: { width: width * 0.75 }
      }).setOrigin(0.5).setScrollFactor(0);
      container.add(qText);

      // DOM textarea
      const textarea = document.createElement('textarea');
      textarea.style.width           = `${width * 0.65}px`;
      textarea.style.height          = `${140 * s}px`;
      textarea.style.fontSize        = `${16 * s}px`;
      textarea.style.padding         = '12px';
      textarea.style.fontFamily      = 'Nunito, sans-serif';
      textarea.style.border          = '2px solid #c4973a';
      textarea.style.borderRadius    = '4px';
      textarea.style.backgroundColor = isReadOnly ? '#dcd7ca' : '#fdf6e3';
      textarea.style.color           = '#1e3a5f';
      textarea.placeholder           = 'Kirjoita pohdintasi tähän...';
      if (isReadOnly) {
          textarea.value = this.tempAnswers[currentStep];
          textarea.readOnly = true;
          textarea.style.opacity = '0.8';
      }
      const domInput = this.add.dom(width / 2, height / 2 + (40 * s), textarea).setScrollFactor(0);
      container.add(domInput);

      // Next / Submit button
      const isLast = (currentStep === questions.length - 1);
      const btnText = isReadOnly ? "SULJE" : (isLast ? "LÄHETÄ" : "SEURAAVA");
      const nextBtn = this.add.text(width / 2, height / 2 + (190 * s), btnText, {
          fontSize: `${22 * s}px`, color: CSS_COLORS.WHITE,
          backgroundColor: '#c4973a', padding: { x: 40, y: 12 },
          fontFamily: FONTS.BODY, fontWeight: 'bold'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);

      nextBtn.on('pointerover', () => nextBtn.setBackgroundColor('#d4a74a'));
      nextBtn.on('pointerout',  () => nextBtn.setBackgroundColor('#c4973a'));
      nextBtn.on('pointerdown', () => {
          if (!isReadOnly) this.tempAnswers[currentStep] = textarea.value;
          this._quizStep++;
          if (this._quizStep < questions.length) {
              qText.setText(questions[this._quizStep]);
              textarea.value = isReadOnly ? this.tempAnswers[this._quizStep] : '';
              if (this._quizStep === questions.length - 1) {
                  nextBtn.setText(isReadOnly ? "SULJE" : "LÄHETÄ");
              }
          } else {
              if (!isReadOnly) ReadingState.quizAnswers[mapKey] = this.tempAnswers;
              if (this._quizModal) { this._quizModal.destroy(); this._quizModal = null; }
              this.isDoingQuiz = false;
              if (!isReadOnly) this.showFinalCelebration();
          }
      });
      container.add(nextBtn);

      modal.enableAutoResize(() => {
          if (this._quizModal) {
              this._quizModal.destroy();
              this._quizModal = null;
              this.showStoryQuiz();
          }
      });
  }
    showFinalCelebration() {
        const mapKey = this.scene.key;
        if (!ReadingState._continentCompletedFlags) ReadingState._continentCompletedFlags = {};
        ReadingState._continentCompletedFlags[mapKey] = true;

        // Cleanup previous
        if (this._celebrationModal) this._celebrationModal.destroy();

        const modal = new ModalBuilder(this);
        this._celebrationModal = modal;

        const { container, box, width, height, uiScale: s } = modal.createFrame({
            title: '🎉 ONNISTUKSIA!',
            maxWidth: 500,
            boxHeight: 300,
            depth: 100000
        });

        // Subtitle
        const subMsg = this.add.text(width / 2, height / 2 + (15 * s),
            "Olet suorittanut tutkimusmatkan loppuun!", {
            fontSize: `${20 * s}px`, color: CSS_COLORS.WHITE,
            fontFamily: FONTS.BODY, align: 'center', wordWrap: { width: width * 0.7 }
        }).setOrigin(0.5).setScrollFactor(0);
        container.add(subMsg);

        // OK button
        const okBtn = this.add.text(width / 2, height / 2 + (90 * s), " SELVÄ ", {
            fontSize: `${22 * s}px`, color: CSS_COLORS.WHITE,
            backgroundColor: '#c4973a', padding: { x: 40, y: 12 },
            fontFamily: FONTS.BODY, fontWeight: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);

        okBtn.on('pointerover', () => okBtn.setBackgroundColor('#d4a74a'));
        okBtn.on('pointerout',  () => okBtn.setBackgroundColor('#c4973a'));
        okBtn.on('pointerdown', () => {
            if (this._celebrationModal) { this._celebrationModal.destroy(); this._celebrationModal = null; }
        });
        container.add(okBtn);

        modal.enableAutoResize(() => {
            if (this._celebrationModal) this.showFinalCelebration();
        });

        // Entry animation
        box.setScale(0.5);
        this.tweens.add({
            targets: [box, subMsg, okBtn],
            scaleX: 1, scaleY: 1,
            duration: 400, ease: 'Back.easeOut'
        });

        // Confetti celebration particles
        const confettiEmojis = ['🎉', '⭐', '🌟', '✨', '🎊', '💫', '🏆'];
        for (let i = 0; i < 12; i++) {
            const emoji = confettiEmojis[i % confettiEmojis.length];
            const startX = width / 2 + (Math.random() - 0.5) * width * 0.6;
            const startY = height / 2 - 50;
            const confetti = this.add.text(startX, startY, emoji, {
                fontSize: `${16 + Math.random() * 14}px`
            }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);
            container.add(confetti);

            this.tweens.add({
                targets: confetti,
                x: startX + (Math.random() - 0.5) * 120,
                y: startY + 100 + Math.random() * 150,
                alpha: { from: 1, to: 0 },
                angle: (Math.random() - 0.5) * 360,
                duration: 1500 + Math.random() * 1000,
                delay: 200 + i * 80,
                ease: 'Cubic.easeOut'
            });
        }
    }
}

export default BaseMapScene;