import {
    book2,
    bookAntarctica,
    bookArctic,
    bookAsia,
    bookNorthAmerica,
    bookSouthAmerica,
    bookOceania
} from './data/index.js';

const ReadingState = {
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
     * 全局 10 本书列表（你原 main.js 的 globalBooks）
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
     * 每个洲的配置（合并你 React 版本的 book 数据）
     */
    mapConfig: {
        'EuropeMap': {
            storage: 'europeProgress',
            bookUrl: "https://api.allorigins.win/raw?url=https://www.gutenberg.org/cache/epub/11/pg11.txt",
            localBook: {
                title: "Kuka lohduttaisi nyytiä?",
                author: "Tove Jansson",
                content: "Oli kerran Nyyti, joka asui aivan yksin..."
            }
        },
        'AfricaMap': { book: book2, storage: 'africaProgress' },
        'AntarcticaMap': { book: bookAntarctica, storage: 'antarcticaProgress' },
        'ArcticMap': { book: bookArctic, storage: 'arcticProgress' },
        'AsiaMap': { book: bookAsia, storage: 'asiaProgress' },
        'NorthAmericaMap': { book: bookNorthAmerica, storage: 'northAmericaProgress' },
        'SouthAmericaMap': { book: bookSouthAmerica, storage: 'southAmericaProgress' },
        'OceaniaMap': { book: bookOceania, storage: 'oceaniaProgress' },
    },

    /**
     * 洲是否解锁
     */
    mapUnlock: {
        'ArcticMap': true,
        'EuropeMap': false,
        'AsiaMap': false,
        'NorthAmericaMap': false,
        'SouthAmericaMap': false,
        'AfricaMap': false,
        'OceaniaMap': false,
        'AntarcticaMap': false
    }
};

export default ReadingState;

