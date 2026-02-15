class OceaniaMapScene extends BaseMapScene {
    constructor() {
        // 参数：Key, 资源Key, 芬兰语标题
        super('OceaniaMap', 'oceaniaMap', 'OSEANIAN MATKA'); 
        
        // 大洋洲主题色：海洋蓝
        this.themeColor = 0x3498db; 

        this.rawPoints = [
            { x: 200, y: 100 }, // staring point
            { x: 450, y: 150 },
            { x: 300, y: 300 },  
            { x: 250, y: 400 }, 
            { x: 500, y: 400}, 
            { x: 600, y: 500 }, 
            { x: 600, y: 600 }, 
            { x: 950, y: 750 }, // 7 
            { x: 1000, y: 500 },// 8. 
            { x: 1150, y: 300 },// 9
            { x: 1000, y: 200 } // 10.
        ];
    }

    preload() {
        // 确保 assets 文件夹里有 oceania.png
        this.load.image('oceaniaMap', 'assets/oceania.png'); 
        this.load.image('token', 'assets/redtoken.png');
    }
}