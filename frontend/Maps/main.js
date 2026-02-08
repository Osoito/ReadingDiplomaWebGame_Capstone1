window.ReadingState = {
    progress: 0,
    mapConfig: {
        'EuropeMap': { 
            storage: 'europeProgress', 
            // 方案 A：继续尝试 API（带代理）
            bookUrl: "https://api.allorigins.win/raw?url=https://www.gutenberg.org/cache/epub/11/pg11.txt",
            // 方案 B：本地备用数据 (如果 API 挂了，就读这个)
            localBook: {
                title: "Kuka lohduttaisi nyytiä? [cite: 15]",
                author: "Tove Jansson [cite: 14]",
                content: "Oli kerran Nyyti, joka asui aivan yksin... [cite: 15]" 
            }
        },
        'AfricaMap': { book: window.book2, storage: 'africaProgress' },
        'AntarcticaMap': { book: window.bookAntarctica, storage: 'antarcticaProgress' },
        'ArcticMap': { book: window.bookArctic, storage: 'arcticProgress' },
        'AsiaMap': { book: window.bookAsia, storage: 'AsiaProgress' },
        'NorthAmericaMap': { book: window.bookNorthAmerica, storage: 'northAmericaProgress' },
        'SouthAmericaMap': { book: window.bookSouthAmerica, storage: 'southAmericaProgress' },
        'OceaniaMap': { book: window.bookOceania, storage: 'oceaniaProgress' },
    },
    europeProgress: 0,
    africaProgress: 0,
    antarcticaProgress: 0,
    arcticProgress: 0,
    asiaProgress: 0,
    northAmericaProgress: 0,
    southAmericaProgress: 0,
    oceaniaProgress: 0,
    booksRead: 0,
    targetBooks: 8
};

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
    },
    scene: [
        WorldMapScene, 
        EuropeMapScene, 
        AsiaMapScene, 
        AfricaMapScene, 
        AntarcticaMapScene,
        ArcticMapScene, 
        NorthAmericaMapScene,
        SouthAmericaMapScene,
        OceaniaMapScene,
        ReadingScene
    ]
};

const game = new Phaser.Game(config);