class ReadingScene extends Phaser.Scene {
    constructor() {
        super('ReadingScene');
    }

    init(data) {
        this.sourceMap = data.prevScene;
        this.bookTitle = data.mapTitle;
        // 接收书籍内容
        this.bookData = data.bookContent || { title: "Unknown Book", author: "Unknown", content: "No content available." };
    }

    create() {
        const { width, height } = this.scale;

        // 1. 全屏黑色半透明遮罩
        this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
            .setOrigin(0)
            .setInteractive();

        // 2. 书本背景（纸张）
        const paperWidth = Math.min(width * 0.9, 550);
        const paperHeight = Math.min(height * 0.85, 750);
        const centerX = width / 2;
        const centerY = height / 2;

        const paper = this.add.rectangle(centerX, centerY, paperWidth, paperHeight, 0xffffff)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xdddddd);

        // 3. 顶部固定区域：书名与作者
        const headerY = centerY - paperHeight * 0.42;
        this.add.text(centerX, headerY, this.bookData.title, { 
            fontSize: '26px', color: '#2c3e50', fontWeight: 'bold', wordWrap: { width: paperWidth - 40 }
        }).setOrigin(0.5);
        
        const authorText = this.add.text(centerX, headerY + 35, `Kirjailija: ${this.bookData.author || 'Tuntematon'}`, {
            fontSize: '16px', color: '#7f8c8d'
        }).setOrigin(0.5);

        // 4. --- 滚动内容区域设置 ---
        
        // 设定文字显示的裁剪区域 (Mask)，防止文字滚到纸张外面
        const maskMargin = 100; // 留出顶部和底部的空白
        const maskGraphics = this.make.graphics();
        maskGraphics.fillRect(centerX - paperWidth/2, centerY - paperHeight/2 + maskMargin, paperWidth, paperHeight - maskMargin * 2);
        const contentMask = maskGraphics.createGeometryMask();

        // 创建正文对象
        this.contentBody = this.add.text(centerX, centerY - paperHeight/2 + maskMargin, this.bookData.content, { 
            fontSize: '20px', 
            color: '#34495e', 
            lineSpacing: 12,
            align: 'left',
            wordWrap: { width: paperWidth - 60 }
        }).setOrigin(0.5, 0); // 注意：Origin设置为 (0.5, 0) 方便从顶部开始滚动

        this.contentBody.setMask(contentMask);

        // 计算滚动的极限数值
        // 可视窗口高度
        const viewHeight = paperHeight - maskMargin * 2;
        // 文字起始Y坐标
        this.startY = centerY - paperHeight / 2 + maskMargin;
        // 最大滚动位移
        const maxScroll = Math.max(0, this.contentBody.height - viewHeight);

        // 5. --- 底部固定区域：进度条 ---
        const barW = paperWidth * 0.8;
        const barY = centerY + paperHeight * 0.38;
        
        this.add.rectangle(centerX, barY, barW, 10, 0xeeeeee).setOrigin(0.5); // 背景
        this.barFill = this.add.rectangle(centerX - barW/2, barY, 0, 10, 0x27ae60).setOrigin(0, 0.5); // 填充
        this.progressLabel = this.add.text(centerX + barW/2 + 10, barY, '0%', { fontSize: '14px', color: '#7f8c8d' }).setOrigin(0, 0.5);

        // 6. --- 滚动监听逻辑 ---
        
        this.currentScrollOffset = 0; // 记录当前滚了多少

        const updateScroll = (deltaY) => {
            this.currentScrollOffset += deltaY;
            // 限制滚动范围
            this.currentScrollOffset = Phaser.Math.Clamp(this.currentScrollOffset, 0, maxScroll);
            
            // 移动文字坐标
            this.contentBody.y = this.startY - this.currentScrollOffset;

            // 计算进度百分比：已滚动的位移 / 总可滚动位移
            let pct = maxScroll > 0 ? (this.currentScrollOffset / maxScroll) : 1;
            let progressValue = Math.round(pct * 100);
            
            // 更新 UI 和全局状态
            this.barFill.width = pct * barW;
            this.progressLabel.setText(`${progressValue}%`);
            window.ReadingState.progress = progressValue;
        };

        // 鼠标滚轮
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            updateScroll(deltaY);
        });

        // 触摸/鼠标点击拖拽
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                const diffY = pointer.prevPosition.y - pointer.y; // 计算拖动方向
                updateScroll(diffY);
            }
        });

        // 7. --- 关闭按钮 ---
        const closeBtn = this.add.text(centerX, centerY + paperHeight * 0.45, '[ TALLENNA JA SULJE ]', { 
            fontSize: '20px', color: '#ffffff', backgroundColor: '#2c3e50', padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            if (this.sourceMap) {
                const config = window.ReadingState.mapConfig[this.sourceMap];
                if (config) {
                    // 将阅读产生的进度保存回地图
                    window.ReadingState[config.storage] = window.ReadingState.progress;
                    console.log(`进度已同步: ${window.ReadingState.progress}%`);
                }
                this.scene.resume(this.sourceMap);
                this.scene.get(this.sourceMap).input.enabled = true; 
            }
            this.scene.stop();
        });
    }
}