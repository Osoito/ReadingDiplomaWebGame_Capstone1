export default class BookFetcher {
    static async fetchAndLaunch(scene, book, config, readOnly, bookIconContainer) {
        // Switch to loading state on the book icon
        const bookG = bookIconContainer?.getByName('bookGraphic');
        const loadingI = bookIconContainer?.getByName('loadingIcon');

        if (bookG) bookG.setVisible(false);
        if (loadingI) {
            loadingI.setVisible(true);
            scene.tweens.add({
                targets: loadingI,
                angle: 360,
                duration: 1000,
                repeat: -1
            });
        }

        const proxies = [
            "https://api.allorigins.win/raw?url=",
            "https://corsproxy.io/?",
            "https://api.codetabs.com/v1/proxy/?quest="
        ];
        const targetUrl = `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.txt`;

        let success = false;
        let fetchedText = "";

        for (const proxy of proxies) {
            try {
                const response = await fetch(proxy + encodeURIComponent(targetUrl), {
                    signal: AbortSignal.timeout(5000)
                });
                if (response.ok) {
                    fetchedText = await response.text();
                    if (fetchedText.length > 1000) {
                        success = true;
                        break;
                    }
                }
            } catch (e) {
                console.error("Proxy error:", e);
            }
        }

        let bookData;
        if (success) {
            const startMarkers = ["*** START OF", "CHAPTER I", "Title:"];
            let cleanText = fetchedText;
            for (const m of startMarkers) {
                const idx = fetchedText.indexOf(m);
                if (idx !== -1) {
                    cleanText = fetchedText.substring(idx);
                    break;
                }
            }
            bookData = {
                id: book.id,
                title: book.title,
                author: book.author,
                content: cleanText.substring(0, 20000),
                readOnly
            };
        } else {
            bookData = {
                id: book.id,
                title: book.title + " (Demo Mode)",
                author: book.author,
                content: `[DEMO CONTENT]\n\nUnable to connect to Project Gutenberg.\n\n${"Preview ".repeat(100)}`,
                readOnly
            };
        }

        // Restore book icon
        if (loadingI) {
            scene.tweens.killTweensOf(loadingI);
            loadingI.setAngle(0).setVisible(false);
        }
        if (bookG) bookG.setVisible(true);

        return bookData;
    }
}
