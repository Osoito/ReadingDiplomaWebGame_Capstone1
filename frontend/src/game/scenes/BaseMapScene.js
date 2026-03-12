import Phaser from 'phaser';
import ReadingState from '../state.js';

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

        // 6. 初始化 Token
        const savedIndex = ReadingState.tokenPositions?.[this.scene.key] ?? 0;
        this.token = this.add.image(0, 0, 'token');
        this.token.setScale(0.12);
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

        this.pointPositions.forEach((pos, index) => {
            const isVideo = this.videoCheckpoints[index];
            const dotColor = isVideo ? 0xffcc00 : (this.themeColor || 0xffffff);
            const dotRadius = 18 * this.baseScale;
            
            const dot = this.add.circle(pos.x, pos.y, dotRadius, dotColor, 1);
            dot.setStrokeStyle(2, 0xffffff);
            this.dotObjects.push(dot);

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
        this.token.setScale(0.12 * this.baseScale);
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

      const { width, height } = this.scale;
      const uiScale = Phaser.Math.Clamp(width / 1200, 0.8, 1.1);

      // 如果已有旧列表，先销毁并卸载 resize 监听
      if (this.listUI) {
          this.listUI.destroy(true);
          if (this._resizeBookListHandler) {
              this.scale.off('resize', this._resizeBookListHandler, this);
              this._resizeBookListHandler = null;
          }
          this.listUI = null;
      }

      // 1. 容器
      this.listUI = this.add.container(0, 0)
          .setDepth(10000)
          .setScrollFactor(0);

      // 当 this.listUI 被 destroy 时，自动卸载 resize 监听
      this.listUI.once('destroy', () => {
          if (this._resizeBookListHandler) {
              this.scale.off('resize', this._resizeBookListHandler, this);
              this._resizeBookListHandler = null;
          }
          this.listUI = null;
      });

      // 2. 遮罩
      const overlay = this.add.rectangle(0, 0, width, height, 0x0a192f, 0.9)
          .setOrigin(0)
          .setInteractive()
          .setScrollFactor(0);
      this.listUI.add(overlay);

      // 3. 标题
      const title = this.add.text(width / 2, 60 * uiScale, "Valitse klassikkokirja", {
          fontSize: `${32 * uiScale}px`,
          color: '#c4973a',
          fontFamily: '"Cinzel Decorative", serif',
          fontWeight: 'bold'
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
      this.listUI.add(title);

      // 4. 列表滚动区
      const listY = 130 * uiScale;
      const viewH = height - (220 * uiScale);

      this.scrollContainer = this.add.container(0, listY)
          .setScrollFactor(0);
      this.listUI.add(this.scrollContainer);

      const maskG = this.add.graphics()
          .setScrollFactor(0)
          .fillStyle(0xffffff, 1)
          .fillRect(0, listY, width, viewH)
          .setVisible(false);
      const mask = maskG.createGeometryMask();
      this.scrollContainer.setMask(mask);

      // 数据
      const availableBooks = globalBooks.map(book => ({
          ...book,
          isCompleted: !!completedBookIds[book.id],
          isCurrent: book.id === currentBookId
      }));

      // 5. 渲染
      availableBooks.forEach((book, idx) => {
          const itemH = 100 * uiScale;
          const y = idx * itemH;
          let bg = 0x1e3a5f, bd = 0xc4973a, α = 1;
          if (book.isCompleted) { bg = 0x1a2a44; bd = 0x4a5568; α = 0.6; }
          if (book.isCurrent)   { bg = 0x2d4a77; bd = 0xffffff; }

          const btnBg = this.add.rectangle(width/2, y+itemH/2, width*0.8, itemH*0.9, bg, α)
              .setStrokeStyle(2, bd)
              .setInteractive({ useHandCursor: true })
              .setScrollFactor(0);

          const pct = ReadingState.bookProgress[book.id] || 0;
          const pctLabel = book.isCompleted ? "✔ DONE" : `${pct}%`;

          const text = this.add.text(
              width*0.15, y+itemH/2,
              `${book.title}\nBy: ${book.author}`,
              {
                  fontSize:`${18*uiScale}px`,
                  color: book.isCompleted ? '#888888' : '#fdf6e3',
                  fontFamily:'Nunito, Arial',
                  align:'left'
              }
          ).setOrigin(0,0.5).setScrollFactor(0);

          const pctText = this.add.text(
              width*0.85, y+itemH/2,
              pctLabel,
              {
                  fontSize:`${20*uiScale}px`,
                  color: book.isCompleted ? '#00ff88' : '#c4973a',
                  fontFamily:'Nunito',
                  fontWeight:'bold'
              }
          ).setOrigin(1,0.5).setScrollFactor(0);

          btnBg.on('pointerdown', () => {
              const dragDist = Math.abs(this.input.activePointer.upY - this.input.activePointer.downY);
              if (dragDist >= 15) return;

              this.listUI.destroy(true);
              if (book.isCompleted) {
                  this.fetchGutenbergBook(book, mapCfg, true);
              } else {
                  ReadingState.mapSelectedBook[mapKey] = book.id;
                  this.fetchGutenbergBook(book, mapCfg, false);
              }
          });

          this.scrollContainer.add([btnBg, text, pctText]);
      });

      // 6. 滚动惯性（保持原逻辑）
      const contentH = availableBooks.length * (100 * uiScale);
      const maxY = listY;
      
      // ⭐⭐⭐ BUG 修复：移除了固定的 "- 40" ⭐⭐⭐
      const minY = contentH <= viewH
          ? maxY
          : listY - (contentH - viewH); // 之前是: listY - (contentH - viewH) - 40;

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
              delay:16, repeat:40,
              callback: () => {
                  if (Math.abs(vel) < 0.5) return;
                  this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y + vel, minY, maxY);
                  vel *= 0.9;
              }
          });
      });
      this.input.on('wheel',(_,__,dx,dy) => {
          if (this.listUI && this.listUI.active) {
              this.scrollContainer.y = Phaser.Math.Clamp(
                  this.scrollContainer.y - dy*0.5, minY, maxY
              );
          }
      });

      // 7. 取消按钮
      const closeBtn = this.add.text(width/2, height - (40*uiScale), "[ Peruuta ]", {
          fontSize:`${20*uiScale}px`,
          color:'#ffffff',
          backgroundColor:'#1e3a5f',
          padding:10,
          fontFamily:'Nunito'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);

      closeBtn.on('pointerover', () => closeBtn.setBackgroundColor('#c4973a'));
      closeBtn.on('pointerout',  () => closeBtn.setBackgroundColor('#1e3a5f'));
      closeBtn.on('pointerdown', () => this.listUI.destroy(true));

      this.listUI.add(closeBtn);

      // 8. 注册 resize 重建
      this._resizeBookListHandler = () => {
          if (this.listUI) this.listUI.destroy(true);
          this.showBookList();
      };
      this.scale.on('resize', this._resizeBookListHandler, this);
  }

    async fetchGutenbergBook(book, config, readOnly = false) {
        this.bookBtn.setText("⏳ LADATAAN…");

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

        // 绘制路径线条
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

        // 1) 清理旧的弹窗（如果存在），防止重复
        if (this.videoPopupUI) {
            this.videoPopupUI.destroy(true);
        }

        // 2) 基础配置
        const { width, height } = this.scale;
        const uiScale = Phaser.Math.Clamp(width / 1200, 0.7, 1.2);
        const depthBase = 9999999;

        // 3) 创建组 (就像你的 celebrationUI 一样)
        this.videoPopupUI = this.add.group();

        // 4) 遮罩层 (Overlay)
        const overlay = this.add.rectangle(0, 0, width, height, 0x0a192f, 0.85)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(depthBase)
            .setInteractive();
        this.videoPopupUI.add(overlay);

        // 5) 背景主框
        const boxW = 450 * uiScale;
        const boxH = 300 * uiScale;
        const box = this.add.rectangle(width / 2, height / 2, boxW, boxH, 0x1e3a5f)
            .setStrokeStyle(4, 0xc4973a)
            .setScrollFactor(0)
            .setDepth(depthBase + 1);
        this.videoPopupUI.add(box);

        // 6) 标题
        const title = this.add.text(width / 2, height / 2 - (100 * uiScale), "💡 LUKUVINKKI AVATTU", {
            fontFamily: '"Cinzel Decorative", serif',
            fontSize: (26 * uiScale) + 'px',
            color: '#c4973a',
            shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 2);
        this.videoPopupUI.add(title);

        // 7) 副标题
        const subTitle = this.add.text(width / 2, height / 2 - (40 * uiScale), videoData.title, {
            fontFamily: 'Nunito, sans-serif',
            fontSize: (18 * uiScale) + 'px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: boxW - 50 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 2);
        this.videoPopupUI.add(subTitle);

        // 8) 观看按钮背景
        const btnW = 260 * uiScale;
        const btnH = 60 * uiScale;
        const btnBg = this.add.rectangle(width / 2, height / 2 + (50 * uiScale), btnW, btnH, 0xc4973a)
            .setScrollFactor(0)
            .setDepth(depthBase + 2)
            .setInteractive({ useHandCursor: true });
        this.videoPopupUI.add(btnBg);

        // 9) 按钮文字
        const btnLabel = this.add.text(width / 2, height / 2 + (50 * uiScale), "KATSO YOUTUBESSA", {
            fontFamily: 'Nunito',
            fontSize: (20 * uiScale) + 'px',
            color: '#1e3a5f',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 3);
        this.videoPopupUI.add(btnLabel);

        // 10) 关闭文字
        const closeBtn = this.add.text(width / 2, height / 2 + (120 * uiScale), "[ Sulje ]", {
            fontFamily: 'Nunito',
            fontSize: (18 * uiScale) + 'px',
            color: '#a9c1de',
            padding: 10
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depthBase + 2)
        .setInteractive({ useHandCursor: true });
        this.videoPopupUI.add(closeBtn);

        // --- 核心清理逻辑 (包含 viewedVideos 记录) ---
        const cleanup = () => {
            if (this.videoPopupUI) {
                this.videoPopupUI.destroy(true);
                this.videoPopupUI = null;
            }
            this.viewedVideos.add(index);
            this.scale.off('resize', this._resizeVideoHandler);
            window.removeEventListener('keydown', escHandler);
        };

        // --- 交互绑定 ---
        btnBg.on('pointerover', () => { btnBg.setFillStyle(0xd4a74a); });
        btnBg.on('pointerout', () => { btnBg.setFillStyle(0xc4973a); });
        
        btnBg.on('pointerdown', () => {
            const url = videoData.url;
            cleanup(); // 先关窗，解决跳转后的残留问题
            if (url) {
                this.time.delayedCall(10, () => window.open(url, '_blank'));
            }
        });

        closeBtn.on('pointerdown', () => cleanup());

        // ESC 支持
        const escHandler = (e) => { if (e.key === 'Escape') cleanup(); };
        window.addEventListener('keydown', escHandler);

        // 11) 注册 Resize 处理器：模仿 showFinalCelebration 的销毁重绘逻辑
        this._resizeVideoHandler = () => {
            if (this.videoPopupUI) {
                // 传入 isManual = true 确保重绘时不会因为 viewedVideos 检查而被拦截
                this.showVideoPopup(videoData, index, true);
            }
        };
        this.scale.on('resize', this._resizeVideoHandler);
    }

    showStoryQuiz() {
      const mapKey = this.scene.key;

      // 1) 初始化状态（保存旧答案 & 步骤）
      if (!ReadingState.quizAnswers) ReadingState.quizAnswers = {};
      const saved = ReadingState.quizAnswers[mapKey];
      if (saved) {
          this.tempAnswers = [...saved];
      } else if (!this.tempAnswers) {
          this.tempAnswers = ["", "", ""];
      }
      // 当前题目索引
      this._quizStep = this._quizStep != null ? this._quizStep : 0;
      const currentStep = this._quizStep;
      const isReadOnly = !!saved;
      this.isDoingQuiz = true;

      // 2) 如果已有旧弹窗，先销毁并卸载监听
      if (this.quizContainer) {
          this.quizContainer.destroy(true);
          if (this._quizResizeHandler) {
              this.scale.off('resize', this._quizResizeHandler, this);
              this._quizResizeHandler = null;
          }
      }

      // 3) 计算布局参数
      const { width, height } = this.scale;
      const uiScale = Phaser.Math.Clamp(width / 1200, 0.8, 1.2);

      // 4) 创建总容器
      this.quizContainer = this.add.container(0, 0)
          .setDepth(100000)
          .setScrollFactor(0);

      // 容器一旦被销毁，就自动卸载 resize 监听
      this.quizContainer.once('destroy', () => {
          if (this._quizResizeHandler) {
              this.scale.off('resize', this._quizResizeHandler, this);
              this._quizResizeHandler = null;
          }
          this.quizContainer = null;
      });

      // 5) 半透明遮罩
      const overlay = this.add.rectangle(0, 0, width, height, 0x0a192f, 0.85)
          .setOrigin(0)
          .setInteractive()
          .setScrollFactor(0);
      this.quizContainer.add(overlay);

      // 6) 弹窗背景框
      const boxW = width * 0.85;
      const boxH = 480 * uiScale;
      const box = this.add.rectangle(width/2, height/2, boxW, boxH, 0x1e3a5f)
          .setStrokeStyle(4, 0xc4973a)
          .setScrollFactor(0);
      this.quizContainer.add(box);

      // 7) 标题
      const titleTxt = this.add.text(
          width/2,
          height/2 - (180 * uiScale),
          isReadOnly ? "YOUR REFLECTIONS" : "STORY QUIZ",
          {
              fontSize: `${32 * uiScale}px`,
              color: '#c4973a',
              fontFamily: '"Cinzel Decorative", serif',
              fontWeight: 'bold',
              shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 4, fill: true }
          }
      )
      .setOrigin(0.5)
      .setScrollFactor(0);
      this.quizContainer.add(titleTxt);

      // 8) 子标题（书名）
      const bookData = ReadingState.globalBooks?.find(b => b.id === ReadingState.mapSelectedBook?.[mapKey]);
      const bookTitle = bookData ? bookData.title : "The Classic Story";
      const bookLabel = this.add.text(
          width/2,
          height/2 - (135 * uiScale),
          `Book: ${bookTitle}`,
          {
              fontSize: `${18 * uiScale}px`,
              color: '#fdf6e3',
              fontFamily: 'Nunito',
              fontStyle: 'italic'
          }
      )
      .setOrigin(0.5)
      .setScrollFactor(0);
      this.quizContainer.add(bookLabel);

      // 9) 问题文本
      const questions = [
          "What is the plot of this story?",
          "Who are the main characters?",
          "What are your thoughts or feelings about this story?"
      ];
      const qText = this.add.text(
          width/2,
          height/2 - (80 * uiScale),
          questions[currentStep],
          {
              fontSize: `${20 * uiScale}px`,
              color: '#ffffff',
              fontFamily: 'Nunito',
              align: 'center',
              wordWrap: { width: width * 0.75 }
          }
      )
      .setOrigin(0.5)
      .setScrollFactor(0);
      this.quizContainer.add(qText);

      // 10) DOM TextArea
      const textarea = document.createElement('textarea');
      textarea.style.width           = `${width * 0.65}px`;
      textarea.style.height          = `${140 * uiScale}px`;
      textarea.style.fontSize        = `${16 * uiScale}px`;
      textarea.style.padding         = '12px';
      textarea.style.fontFamily      = 'Nunito, sans-serif';
      textarea.style.border          = '2px solid #c4973a';
      textarea.style.borderRadius    = '4px';
      textarea.style.backgroundColor = isReadOnly ? '#dcd7ca' : '#fdf6e3';
      textarea.style.color           = "#1e3a5f";
      textarea.placeholder           = "Write your reflections here...";
      if (isReadOnly) {
          textarea.value    = this.tempAnswers[currentStep];
          textarea.readOnly = true;
          textarea.style.opacity = '0.8';
      }
      const domInput = this.add.dom(
          width/2,
          height/2 + (40 * uiScale),
          textarea
      )
      .setScrollFactor(0);
      this.quizContainer.add(domInput);

      // 11) 下一步/提交 按钮
      const isLast = (currentStep === questions.length - 1);
      const btnText = isReadOnly
          ? (isLast ? "CLOSE" : "CLOSE")
          : (isLast ? "SUBMIT" : "NEXT");
      const nextBtn = this.add.text(
          width/2,
          height/2 + (190 * uiScale),
          btnText,
          {
              fontSize: `${22 * uiScale}px`,
              color: '#ffffff',
              backgroundColor: '#c4973a',
              padding: { x: 40, y: 12 },
              fontFamily: 'Nunito',
              fontWeight: 'bold'
          }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);

      nextBtn.on('pointerover', () => nextBtn.setBackgroundColor('#d4a74a'));
      nextBtn.on('pointerout',  () => nextBtn.setBackgroundColor('#c4973a'));
      nextBtn.on('pointerdown', () => {
          // 非只读状态下，先存当前答案
          if (!isReadOnly) {
              this.tempAnswers[currentStep] = textarea.value;
          }
          // 准备下一步
          this._quizStep++;
          if (this._quizStep < questions.length) {
              // 还没到最后一题，更新问题与清空/填充输入框
              qText.setText(questions[this._quizStep]);
              if (isReadOnly) {
                  textarea.value = this.tempAnswers[this._quizStep];
              } else {
                  textarea.value = '';
              }
              // 如果到最后一题，改按钮文案
              if (this._quizStep === questions.length - 1) {
                  nextBtn.setText(isReadOnly ? "CLOSE" : "SUBMIT");
              }
          } else {
              // 全部答完，存储并关闭
              if (!isReadOnly) {
                  ReadingState.quizAnswers[mapKey] = this.tempAnswers;
              }
              this.quizContainer.destroy(true);
              this.isDoingQuiz = false;
              if (!isReadOnly) this.showFinalCelebration();
          }
      });
      this.quizContainer.add(nextBtn);

      // 12) 注册 resize：销毁旧弹窗并重新 build
      this._quizResizeHandler = () => {
          if (this.quizContainer) {
              this.quizContainer.destroy(true);
          }
          this.showStoryQuiz();
      };
      this.scale.on('resize', this._quizResizeHandler, this);
  }
    showFinalCelebration() {
        const mapKey = this.scene.key;
        // 1) 更新完成状态
        if (!ReadingState._continentCompletedFlags) {
            ReadingState._continentCompletedFlags = {};
        }
        ReadingState._continentCompletedFlags[mapKey] = true;

        // 2) 如果已有旧弹窗，先销毁并卸载监听（防止 Resize 时叠加）
        if (this.celebrationUI) {
            this.celebrationUI.destroy(true);
            if (this._resizeCelebrationHandler) {
                this.scale.off('resize', this._resizeCelebrationHandler, this);
                this._resizeCelebrationHandler = null;
            }
        }

        // 3) 计算布局参数
        const { width, height } = this.scale;
        const uiScale = Phaser.Math.Clamp(width / 1200, 0.8, 1.2);

        // 4) 创建总容器
        this.celebrationUI = this.add.container(0, 0)
            .setDepth(100000)
            .setScrollFactor(0);

        // 容器被销毁时自动移除 resize 监听
        this.celebrationUI.once('destroy', () => {
            if (this._resizeCelebrationHandler) {
                this.scale.off('resize', this._resizeCelebrationHandler, this);
                this._resizeCelebrationHandler = null;
            }
            this.celebrationUI = null;
        });

        // 5) 半透明遮罩 (与 VideoPopup 一致)
        const overlay = this.add.rectangle(0, 0, width, height, 0x0a192f, 0.85)
            .setOrigin(0)
            .setInteractive()
            .setScrollFactor(0);
        this.celebrationUI.add(overlay);

        // 6) 弹窗背景框 (自适应宽度，固定高度比例)
        const boxW = Math.min(width * 0.85, 500 * uiScale);
        const boxH = 300 * uiScale;
        const box = this.add.rectangle(width / 2, height / 2, boxW, boxH, 0x1e3a5f)
            .setStrokeStyle(4, 0xc4973a)
            .setScrollFactor(0);
        this.celebrationUI.add(box);

        // 7) 祝贺标题 (使用 Cinzel Decorative 字体)
        const titleMsg = this.add.text(width / 2, height / 2 - (60 * uiScale), "🎉 ONNISTUKSIA!", {
            fontSize: `${32 * uiScale}px`,
            color: '#c4973a',
            fontFamily: '"Cinzel Decorative", serif',
            fontWeight: 'bold',
            shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);
        this.celebrationUI.add(titleMsg);

        // 8) 描述正文
        const subMsg = this.add.text(width / 2, height / 2 + (15 * uiScale), "Olet suorittanut tutkimusmatkan loppuun!", {
            fontSize: `${20 * uiScale}px`,
            color: '#ffffff',
            fontFamily: 'Nunito, sans-serif',
            align: 'center',
            wordWrap: { width: boxW - 40 }
        }).setOrigin(0.5).setScrollFactor(0);
        this.celebrationUI.add(subMsg);

        // 9) 确认按钮 (与 Quiz 按钮风格一致)
        const okBtn = this.add.text(width / 2, height / 2 + (90 * uiScale), " SELVÄ ", {
            fontSize: `${22 * uiScale}px`,
            color: '#ffffff',
            backgroundColor: '#c4973a',
            padding: { x: 40, y: 12 },
            fontFamily: 'Nunito',
            fontWeight: 'bold'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0);

        okBtn.on('pointerover', () => okBtn.setBackgroundColor('#d4a74a'));
        okBtn.on('pointerout', () => okBtn.setBackgroundColor('#c4973a'));
        okBtn.on('pointerdown', () => this.celebrationUI.destroy(true));
        this.celebrationUI.add(okBtn);

        // 10) 注册 Resize 处理器：销毁旧弹窗并重绘
        this._resizeCelebrationHandler = () => {
            if (this.celebrationUI) {
                this.showFinalCelebration();
            }
        };
        this.scale.on('resize', this._resizeCelebrationHandler, this);

        // 入场小动画
        box.setScale(0.5);
        this.tweens.add({
            targets: [box, titleMsg, subMsg, okBtn],
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }
}

export default BaseMapScene;