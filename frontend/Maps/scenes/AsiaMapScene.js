class AsiaMapScene extends BaseMapScene {
    constructor() {
        // 参数：Key, 资源Key, 芬兰语标题
        super('AsiaMap', 'asiaMap', 'AASIAN MATKA'); 
        
        // 亚洲主题色：橙黄色
        this.themeColor = 0xffa500; 

        // 11个点：北->南，西->东 曲线布局
        this.rawPoints = [
            { x: 200, y: 100 }, //starting point
            { x: 600, y: 100 }, 
            { x: 900, y: 120 }, 
            { x: 850, y: 300 }, 
            { x: 600, y: 350 }, 
            { x: 500, y: 500 }, 
            { x: 750, y: 550 }, 
            { x: 1000, y: 450 },
            { x: 1150, y: 300 }, 
            { x: 1200, y: 600 },
            { x: 1050, y: 800 } 
        ];
    }

    preload() {
        // 确保你的资源文件夹里有 asia.png
        this.load.image('asiaMap', 'assets/asia.png'); 
        this.load.image('token', 'assets/redtoken.png');
    }
}
