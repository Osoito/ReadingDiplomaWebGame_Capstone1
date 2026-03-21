import {
    book2,
    bookAntarctica,
    bookArctic,
    bookAsia,
    bookNorthAmerica,
    bookSouthAmerica,
    bookOceania
} from './data/index.js';

import {
    fetchProgress,
    fetchBooks,
    completeLevel,
    addBookToLevel,
    submitQuiz,
    addReward
} from '../services/api.js';

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
    },

    /**
     * Return the mapKey of the first unlocked-but-not-completed continent.
     */
    getCurrentContinent() {
        for (const mapKey of this.mapOrder) {
            if (!this.mapUnlock[mapKey]) continue;
            if (!this._continentCompletedFlags?.[mapKey]) return mapKey;
        }
        return this.mapOrder[this.mapOrder.length - 1];
    },

    // ── Backend sync methods ──

    /**
     * Load progress and books from backend. Called once before Phaser starts.
     * On failure: console.warn, keep default client-side values (graceful degradation).
     */
    async loadFromBackend() {
        try {
            const [progressData, booksData] = await Promise.allSettled([
                fetchProgress(),
                fetchBooks()
            ]);

            // Populate from progress API
            if (progressData.status === 'fulfilled' && Array.isArray(progressData.value)) {
                const entries = progressData.value;

                // Index entries by level for ordered unlock logic
                const byLevel = {};
                for (const entry of entries) {
                    byLevel[entry.level] = entry;
                }

                // Reset unlocks — only first is unlocked by default
                for (const key of this.mapOrder) {
                    this.mapUnlock[key] = false;
                }
                this.mapUnlock[this.mapOrder[0]] = true;

                // Walk in order: unlock next only if previous is completed
                for (let i = 0; i < this.mapOrder.length; i++) {
                    const level = i + 1;
                    const mapKey = this.mapOrder[i];
                    const entry = byLevel[level];
                    if (!entry) continue;

                    // Map completion
                    if (entry.completed) {
                        if (!this._continentCompletedFlags) this._continentCompletedFlags = {};
                        this._continentCompletedFlags[mapKey] = true;
                        this.booksRead = Math.max(this.booksRead, level);
                        // Unlock next continent
                        if (i + 1 < this.mapOrder.length) {
                            this.mapUnlock[this.mapOrder[i + 1]] = true;
                        }
                    }

                    // Book assignment
                    if (entry.book) {
                        this.mapSelectedBook[mapKey] = String(entry.book);
                    }

                    // Progress percentage
                    if (entry.current_progress != null) {
                        const cfg = this.mapConfig[mapKey];
                        if (cfg) {
                            this[cfg.storage] = entry.current_progress;
                        }
                        if (entry.book) {
                            this.bookProgress[String(entry.book)] = entry.current_progress;
                        }
                    }
                }
            }

            // Populate from books API
            if (booksData.status === 'fulfilled' && Array.isArray(booksData.value) && booksData.value.length > 0) {
                this.globalBooks = booksData.value.map(b => ({
                    title: b.title,
                    author: b.author,
                    id: String(b.id),
                    dbId: b.id
                }));
            }

        } catch (err) {
            console.warn('Failed to load from backend, using client defaults:', err);
        }
    },

    /**
     * Save book selection to backend (optimistic update).
     */
    async saveBookSelection(mapKey, bookId) {
        const level = this.mapOrder.indexOf(mapKey) + 1;
        if (level < 1) return;
        this.mapSelectedBook[mapKey] = bookId;
        try {
            await addBookToLevel(level, bookId);
        } catch (err) {
            console.warn('Failed to save book selection:', err);
        }
    },

    /**
     * Mark level as complete in backend (optimistic update).
     */
    async saveLevelComplete(mapKey, userId) {
        const level = this.mapOrder.indexOf(mapKey) + 1;
        if (level < 1) return;
        if (!this._continentCompletedFlags) this._continentCompletedFlags = {};
        this._continentCompletedFlags[mapKey] = true;
        // Unlock next level
        if (level < this.mapOrder.length) {
            this.mapUnlock[this.mapOrder[level]] = true;
        }
        try {
            await completeLevel(level, userId);
        } catch (err) {
            console.warn('Failed to save level completion:', err);
        }
    },

    /**
     * Submit quiz answers to backend.
     */
    async submitQuizAnswers(mapKey, questions, answers) {
        try {
            await submitQuiz({
                question1: questions[0], answer1: answers[0],
                question2: questions[1], answer2: answers[1],
                question3: questions[2], answer3: answers[2]
            });
        } catch (err) {
            console.warn('Failed to submit quiz:', err);
        }
    },

    /**
     * Add completion reward to backend.
     */
    async addCompletionReward(userId, rewardType, reward) {
        try {
            await addReward(userId, rewardType, reward);
        } catch (err) {
            console.warn('Failed to add reward:', err);
        }
    }
};

export default ReadingState;
