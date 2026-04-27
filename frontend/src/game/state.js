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
    fetchSubmissions,
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
    /**
     * Load progress and books from backend. Called once before Phaser starts.
     * Fixed: Resolved issues with progress not being inherited, BookList disappearing, and Level data type matching.
     */
    async loadFromBackend() {
        try {
            const [submissionsData, progressData, booksData] = await Promise.allSettled([
                fetchSubmissions(),
                fetchProgress(),
                fetchBooks()
            ]);

            // --- 1. Prioritize handling the book list (ensure Book List does not disappear due to progress errors) ---
            if (booksData.status === 'fulfilled' && Array.isArray(booksData.value)) {
                if (booksData.value.length > 0) {
                    this.globalBooks = booksData.value.map(b => ({
                        title: b.title,
                        author: b.author,
                        id: String(b.id),
                        dbId: b.id
                    }));
                }
            }

            // --- 2. Handle progress and unlocking logic ---
            if (progressData.status === 'fulfilled' && Array.isArray(progressData.value)) {
                const progressEntries = progressData.value;

                let submissionEntries = {}
                if (submissionsData.status === 'fulfilled' && Array.isArray(submissionsData.value)) {
                    submissionEntries = submissionsData.value;
                }
                
                // If the backend returns no data at all, skip directly and keep the current frontend state
                if (progressEntries.length === 0) return;

                // Normalize Level indexing
                const progressByLevel = {};
                for (const entry of progressEntries) {
                    progressByLevel[Number(entry.level)] = entry;
                }

                const submissionByLevelId = {};
                for (const entry of submissionEntries) {
                    submissionByLevelId[Number(entry.completedLevel)] = entry;
                }

                // [Key Change 1]: Do not reset mapUnlock immediately.
                // Update based on the existing mapUnlock state.
                // Ensure the North Pole is at least unlocked
                this.mapUnlock[this.mapOrder[0]] = true;

                // Iterate according to mapOrder
                for (let i = 0; i < this.mapOrder.length; i++) {
                    const level = i + 1;
                    const mapKey = this.mapOrder[i]; // Name of level
                    const progressEntry = progressByLevel[level]; // Progress data for this level
                    const submissionEntry = submissionByLevelId[progressEntry.id]; // Submission data for this level
                    
                    if (!progressEntry) continue;

                    // Restore book binding
                    if (progressEntry.book) {
                        this.mapSelectedBook[mapKey] = String(progressEntry.book);
                    }

                    // Restore progress percentage
                    if (progressEntry.current_progress != null) {
                        const cfg = this.mapConfig[mapKey];
                        if (cfg) {
                            this[cfg.storage] = progressEntry.current_progress;
                        }
                        if (progressEntry.book) {
                            this.bookProgress[String(progressEntry.book)] = progressEntry.current_progress;
                        }
                    }

                    if (submissionEntry) {
                        // Restore submission answers on levels which have them
                        if (!ReadingState.quizAnswers) ReadingState.quizAnswers = {};
                        this.quizAnswers[mapKey] = [String(submissionEntry.answer1), String(submissionEntry.answer2), String(submissionEntry.answer3)];
                    }

                    // [Key Change 2]: Core unlocking logic
                    // As long as the backend indicates this level is not incomplete (the level is complete or reviewed),
                    // the next level must be unlocked
                    if (progressEntry.level_status !== 'incomplete') {
                        if (!this._continentCompletedFlags) this._continentCompletedFlags = {};
                        this._continentCompletedFlags[mapKey] = true;
                        
                        this.booksRead = Math.max(this.booksRead, level);
                        
                        // Unlock the next level
                        if (i + 1 < this.mapOrder.length) {
                            const nextMapKey = this.mapOrder[i + 1];
                            this.mapUnlock[nextMapKey] = true; 
                            console.log(`Detected level ${level} completed, auto-unlocking: ${nextMapKey}`);
                        }
                    }
                }
                
                // [Note]: Directly modifying properties of this.mapUnlock is sufficient,
                // no need to reassign a newUnlocks object,
                // this avoids assignment failure caused by variable scope issues.
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
