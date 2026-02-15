class ArcticMapScene extends BaseMapScene {
    constructor() {
        super('ArcticMap', 'arcticMap', 'POHJOISNAVON TUTKIMUSMATKA'); 
        
        this.themeColor = 0x00ffff; 

        // 重新排布的10个点：第六点开始往回（左）往下走
        this.rawPoints = [
            { x: 100, y: 200 },  //starting point
            { x: 700, y: 350 },  
            { x: 600, y: 400 },  
            { x: 250, y: 450 }, 
            { x: 350, y: 500 }, 
            { x: 540, y: 500 },  
            { x: 490, y: 600 },  
            { x: 300, y: 750 },  
            { x: 600, y: 800 },  
            { x: 750, y: 900 },
            { x: 900, y: 850 }
        ];
    }

    preload() {
        this.load.image('arcticMap', 'assets/arctic.png'); 
        this.load.image('token', 'assets/redtoken.png');
    }
}