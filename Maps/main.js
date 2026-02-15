window.ReadingState = {
    // 当前阅读进度（用于 ReadingScene 内部）
    progress: 0,

    // 各洲进度（驱动 token）
    europeProgress: 0,
    africaProgress: 0,
    antarcticaProgress: 0,
    arcticProgress: 0,
    asiaProgress: 0,
    northAmericaProgress: 0,
    southAmericaProgress: 0,
    oceaniaProgress: 0,

    // 每本书的阅读进度：bookId -> 0-100
    bookProgress: {},

    // 已经“完整读完”的书（用于从书单中排除）
    completedBookIds: {},

    // 每个洲当前绑定的书：mapKey -> bookId
    mapSelectedBook: {},

    // 完成的书本数量 & 目标数量（8 个洲）
    booksRead: 0,
    targetBooks: 8,

    /**
     * 全局 10 本书列表
     * 你可以按喜好调整顺序和内容
     */
    globalBooks: [
        { title: "The Frozen Pirate", author: "W. Clark Russell", id: "34346" },
        { title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", id: "11" },
        { title: "The Jungle Book", author: "Rudyard Kipling", id: "19379" },
        { title: "The Adventures of Tom Sawyer", author: "Mark Twain", id: "74" },
        { title: "Bomba the Jungle Boy", author: "Roy Rockwood", id: "14294" },
        { title: "Pinocchio in Africa", author: "E. Cherubini", id: "26084" },
        { title: "The Coral Island", author: "R. M. Ballantyne", id: "646" },
        { title: "Lost in the Land of Ice", author: "Edward Stratemeyer", id: "21575" },
        { title: "Peter Pan", author: "James M. Barrie", id: "16" },
        { title: "Anne of Green Gables", author: "L. M. Montgomery", id: "45" }
    ],

    /**
     * 洲解锁顺序：从北到南
     */
    mapOrder: [
        'ArcticMap',
        'EuropeMap',
        'AsiaMap',
        'NorthAmericaMap',
        'SouthAmericaMap',
        'AfricaMap',
        'OceaniaMap',
        'AntarcticaMap'
    ],

    /**
     * 每个洲的配置：
     * - storage: 对应的进度字段（用于 token）
     */
    mapConfig: {
        'EuropeMap': {
            storage: 'europeProgress'
        },
        'AfricaMap': {
            storage: 'africaProgress'
        },
        'AntarcticaMap': {
            storage: 'antarcticaProgress'
        },
        'ArcticMap': {
            storage: 'arcticProgress'
        },
        'AsiaMap': {
            storage: 'asiaProgress'
        },
        'NorthAmericaMap': {
            storage: 'northAmericaProgress'
        },
        'SouthAmericaMap': {
            storage: 'southAmericaProgress'
        },
        'OceaniaMap': {
            storage: 'oceaniaProgress'
        }
    },

    /**
     * 洲是否解锁
     * WorldMapScene 里可以根据这个来决定能不能点击进入
     */
    mapUnlock: {
        'ArcticMap': true,          // 起点：北极已解锁
        'EuropeMap': false,
        'AsiaMap': false,
        'NorthAmericaMap': false,
        'SouthAmericaMap': false,
        'AfricaMap': false,
        'OceaniaMap': false,
        'AntarcticaMap': false
    }
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

