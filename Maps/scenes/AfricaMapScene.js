class AfricaMapScene extends BaseMapScene {
    constructor() {
        super('AfricaMap', 'africaMap', 'AFRIKAN SEIKKAILU');
        this.themeColor = 0xe67e22; 
        this.rawPoints = [
            { x: 200, y: 100 }, 
            { x: 400, y: 350 },
            { x: 800, y: 500 },
            { x: 350, y: 550 },  
            { x: 600, y: 600 },
            { x: 800, y: 680 },  
            { x: 500, y: 750 },  
            { x: 600, y: 850 },
            { x: 700, y: 950 },
            { x: 500, y: 950 },         
            { x: 600, y: 1200 },
        ];
    }

    preload() {
        // 确保路径正确
        this.load.image('africaMap', 'assets/africa.png');
        this.load.image('token', 'assets/redtoken.png');
    }
}