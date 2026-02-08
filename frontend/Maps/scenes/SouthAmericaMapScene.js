class SouthAmericaMapScene extends BaseMapScene {
    constructor() {
        // 参数：Key, 资源Key, 芬兰语标题
        super('SouthAmericaMap', 'southAmericaMap', 'ETELÄ-AMERIKAN MATKA'); 
        
        // 南美主题色：热带雨林绿
        this.themeColor = 0x27ae60; 

        // 10个点：模拟沿安第斯山脉南下，再转向大西洋岸
        this.rawPoints = [
            { x: 350, y: 100 }, // 1. 起点 (Kolumbia)
            { x: 300, y: 200 }, // 2. Ecuador
            { x: 280, y: 350 }, 
            { x: 500, y: 400 },
            { x: 250, y: 600 },// 3. Peru (Machu Picchu alue)
            { x: 700, y: 650 }, // 4. Amazonin sademetsä
            { x: 600, y: 750 }, // 5. Bolivia
            { x: 350, y: 850 }, // 6. Chile (Andit)
            { x: 400, y: 1000 }, // 7. Patagonia
            { x: 350, y: 1200 }, // 8. Argentiina (Pampas)
             // 9. Uruguayn suunta
              // 10. Brasilia (Rio de Janeiro)
        ];
    }

    preload() {
        // 确保 assets 文件夹里有 south_america.png
        this.load.image('southAmericaMap', 'assets/southamerica.png'); 
        this.load.image('token', 'assets/redtoken.png');
    }
}