class NorthAmericaMapScene extends BaseMapScene {
    constructor() {
        // 参数：Key, 资源Key, 芬兰语标题
        super('NorthAmericaMap', 'northAmericaMap', 'POHJOIS-AMERIKAN MATKA'); 
        
        // 北美主题色：红色或深蓝色
        this.themeColor = 0xe74c3c; 

        // 定义北美洲的探险路径 (从西北向东南延伸)
        this.rawPoints = [
            { x: 200, y: 100 },
            { x: 150, y: 350 }, // 1. Alaska
            { x: 300, y: 400 }, // 2. Länsi-Kanada
            { x: 500, y: 450 }, // 3. Hudsoninlahti ympäristö
            { x: 800, y: 550 }, // 4. Itä-Kanada
            { x: 650, y: 600 }, // 5. Suuret järvet
            { x: 450, y: 650 }, // 6. Keski-Yhdysvallat
            { x: 300, y: 600 }, // 7. Kalliovuoret
            { x: 250, y: 750 }, // 8. Kalifornia / Lounaisrannikko
            { x: 450, y: 850 }, // 9. Texas / Meksikonlahti
            { x: 450, y: 1000 }  // 10. Meksiko / Väli-Amerikka
        ];
    }

    preload() {
        // 确保 assets 文件夹里有 north_america.png
        this.load.image('northAmericaMap', 'assets/northamerica.png'); 
        this.load.image('token', 'assets/redtoken.png');
    }
}