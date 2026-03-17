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
    // Current reading progress (used internally by ReadingScene)
    progress: 0,

    // Progress in each continent (driving token)
    europeProgress: 0,
    africaProgress: 0,
    antarcticaProgress: 0,
    arcticProgress: 0,
    asiaProgress: 0,
    northAmericaProgress: 0,
    southAmericaProgress: 0,
    oceaniaProgress: 0,

    // Reading progress for each book: bookId -> 0-100
    bookProgress: {},

    // Books that have been "completely read" (used to exclude from the book list)
    completedBookIds: {},
    mapFinished: {},

    // The book currently bound to each continent: mapKey -> bookId
    mapSelectedBook: {},

    // Number of books completed & target number (8 continents)
    booksRead: 0,
    targetBooks: 8,

    /**
     * A global list of 10 books (from your original main.js's globalBooks).
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
     * Continent unlocking order: from north to south
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
     * Configuration for each continent (merging your React version of book data)
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
     * Is the continent unlocked?
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

