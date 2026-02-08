class AntarcticaMapScene extends BaseMapScene {
    constructor() {
        // 参数：Key, 资源Key, 芬兰语标题
        super('AntarcticaMap', 'antarcticaMap', 'ETELÄMANNER: SUURI JÄÄRETKI'); 
        
        // 企鹅黑主题色
        this.themeColor = 0x2c3e50; 

        // 11个点：从南极半岛向南极点进发
        this.rawPoints = [
            { x: 200, y: 100 }, // 1. 起点：Etelänapamantereen niemimaa (南极半岛)
            { x: 300, y: 280 }, // 2. Weddellinmeri (威德尔海边缘)
            { x: 550, y: 400 }, // 3. Ronnen jäähylly
            { x: 450, y: 500 }, // 4. Ellsworthin maa
            { x: 700, y: 500}, // 5. Matkalla kohti etelänapaa (向极点进发)
            { x: 900, y: 600 }, // 6. ETELÄNAPA (地理南极点)
            { x: 1000, y: 700 }, // 7. Kuningatar Maudin maa
            { x: 1100, y: 550 }, // 8. Itä-Etelämanner
            { x: 900, y: 400 },// 9. Wilkesin maa
            { x: 1100, y: 250 }, // 10. Victorianmaa
            { x: 700, y: 300 }  // 11. 终点：Rossinmeri (罗斯海)
        ];
    }

    preload() {
        // 确保 assets 文件夹里有 antarctica.png
        this.load.image('antarcticaMap', 'assets/antarctica.png'); 
        this.load.image('token', 'assets/redtoken.png');
    }
}