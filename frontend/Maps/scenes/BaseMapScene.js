class BaseMapScene extends Phaser.Scene {
    constructor(key, assetKey, title) {
        super(key);
        this.assetKey = assetKey;
        this.title = title;
    }

    create() {
        const { width, height } = this.scale;
        
        // 1. 背景与缩放
        const bg = this.add.image(0, 0, this.assetKey).setOrigin(0);
        this.baseScale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(this.baseScale);
        this.cameras.main.setBounds(0, 0, bg.displayWidth, bg.displayHeight);

        // 2. 路径绘制层
        this.pathGraphics = this.add.graphics().setDepth(5);

        // 3. 坐标点位转换
        this.pointPositions = this.rawPoints.map(p => ({
            x: p.x * this.baseScale,
            y: p.y * this.baseScale
        }));

        // 绘制关卡点
        this.pointPositions.forEach(pos => {
            this.add.circle(pos.x, pos.y, 18 * this.baseScale, this.themeColor || 0xffffff, 1)
                .setStrokeStyle(2, 0xffffff);
        });

        // 4. Token 角色
        this.token = this.add.image(this.pointPositions[0].x, this.pointPositions[0].y, 'token')
            .setScale(0.12 * this.baseScale)
            .setDepth(10);

        // 5. UI 文本
        this.add.text(width / 2, 20, this.title, { 
            fontSize: '32px', color: '#fff', stroke: '#000', strokeThickness: 4 
        }).setOrigin(0.5, 0).setScrollFactor(0);
        
        // 返回按钮
        this.add.text(20, 20, '← TAKAISIN', { 
            fontSize: '18px', color: '#fff', backgroundColor: '#444', padding: 10 
        })
            .setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(2000)
            .on('pointerdown', () => {
                this.scene.stop(this.scene.key);
                this.scene.start('WorldMap');
            });

        // 阅读按钮 (API 加载版)
        this.bookBtn = this.add.text(20, height - 20, '📖 AVAA KIRJA', { 
            fontSize: '28px', color: '#ffcc00', backgroundColor: '#000', padding: 10 
        })
            .setOrigin(0, 1).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(2000)
            .on('pointerdown', () => this.handleOpenBook());

        // 6. 交互逻辑 (拖拽地图)
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                this.cameras.main.stopFollow();
                this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
                this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
            }
        });

        // 7. 唤醒时更新位置
        this.events.on('resume', () => {
            this.input.enabled = true;
            this.time.delayedCall(100, () => this.updateTokenPosition(true));
        });

        this.updateTokenPosition(false);
    }

    /**
     * 处理书籍打开：根据配置动态加载 API
     */
    async handleOpenBook() {
    const config = window.ReadingState.mapConfig[this.scene.key];
    if (!config) return;

    this.bookBtn.setText('⏳ Ladataan...');

    try {
        // 如果有 URL 就尝试联网
        if (config.bookUrl) {
            const response = await fetch(config.bookUrl);
            if (response.ok) {
                const fullText = await response.text();
                this.launchReading(config, {
                    title: this.title,
                    author: "Online Library",
                    content: fullText.substring(0, 8000)
                });
                return; // 成功后直接返回
            }
        }
        throw new Error("API unavailable"); // 没 URL 或联网失败
    } catch (error) {
        console.warn("API 失败，切换到本地数据");
        // 使用配置里的本地书籍，如果没有就用默认占位符
        const fallback = config.localBook || { 
            title: "Lukuseikkailu", 
            author: "Opettaja", 
            content: "Tervetuloa lukemaan! [cite: 1, 2]" 
        };
        this.launchReading(config, fallback);
    } finally {
        this.bookBtn.setText('📖 AVAA KIRJA');
    }
}

// 提取一个通用的跳转方法
launchReading(config, bookData) {
    window.ReadingState.progress = window.ReadingState[config.storage] || 0;
    this.scene.pause();
    this.scene.launch('ReadingScene', { 
        prevScene: this.scene.key, 
        mapTitle: this.title,
        bookContent: bookData 
    });
}

    /**
     * 更新 Token 位置与路径连线逻辑
     */
    updateTokenPosition(animate = true) {
        if (!this.token || !this.pointPositions || !this.pointPositions.length) return;

        const config = window.ReadingState.mapConfig[this.scene.key];
        const storageKey = config ? config.storage : 'progress';
        const currentProg = window.ReadingState[storageKey] || 0;

        let targetIndex = Math.floor((currentProg / 100) * (this.pointPositions.length - 1));
        targetIndex = Phaser.Math.Clamp(targetIndex, 0, this.pointPositions.length - 1);

        // 绘制路径 (不画 0 -> 1 段)
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