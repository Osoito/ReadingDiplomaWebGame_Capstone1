class EuropeMapScene extends BaseMapScene {
    constructor() {
        super('EuropeMap', 'europeMap', 'EUROOPAN SEIKKAILU'); 
        
        // 皇家紫主题色
        this.themeColor = 0x9b59b6; 

        // 11个点：根据你的插画地标排布
        this.rawPoints = [
            { x: 200, y: 100 }, // 1. 起点：英国大本钟附近
             // 2. 海上的海盗船
            { x: 425, y: 400 },
            { x: 350, y: 750 },
            { x: 550, y: 600 },
            
            { x: 1000, y: 700 }, // 7. 北部雪山下的城堡
             // 8. 东部洋葱头城堡 (类似圣瓦西里大教堂)
            { x: 775, y: 560 }, // 9. 希腊帕特农神庙
            { x: 1150, y: 500 },
            { x: 850, y: 400 },
             // 10. 南部意大利风格水城
            { x: 1200, y: 300 },  // 11. 终点：东南部的火山区域
            { x: 1050, y: 200 },
            { x: 790, y: 245 }
            
        ];
    }

    preload() {
        this.load.image('europeMap', 'assets/europe.png'); 
        this.load.image('token', 'assets/redtoken.png');
    }
}