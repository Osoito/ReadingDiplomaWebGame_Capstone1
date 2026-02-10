import { book2, bookAntarctica, bookArctic, bookAsia, bookNorthAmerica, bookSouthAmerica, bookOceania } from './data/index.js';

const ReadingState = {
    progress: 0,
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
        'AsiaMap': { book: bookAsia, storage: 'AsiaProgress' },
        'NorthAmericaMap': { book: bookNorthAmerica, storage: 'northAmericaProgress' },
        'SouthAmericaMap': { book: bookSouthAmerica, storage: 'southAmericaProgress' },
        'OceaniaMap': { book: bookOceania, storage: 'oceaniaProgress' },
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

export default ReadingState;
