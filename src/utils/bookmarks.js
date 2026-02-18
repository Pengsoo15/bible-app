/**
 * Bookmarks utility — localStorage-backed bookmark management
 */

const BOOKMARKS_KEY = '66books_bookmarks';

export function getBookmarks() {
    try {
        const saved = localStorage.getItem(BOOKMARKS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function addBookmark(bookmark) {
    const bookmarks = getBookmarks();
    // Avoid duplicates (same book + chapter + verse)
    const exists = bookmarks.some(
        b => b.book === bookmark.book && b.chapter === bookmark.chapter && b.verse === bookmark.verse
    );
    if (!exists) {
        bookmarks.unshift({ ...bookmark, savedAt: Date.now() });
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }
    return bookmarks;
}

export function removeBookmark(book, chapter, verse) {
    const bookmarks = getBookmarks().filter(
        b => !(b.book === book && b.chapter === chapter && b.verse === verse)
    );
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return bookmarks;
}

export function isBookmarked(book, chapter, verse) {
    return getBookmarks().some(
        b => b.book === book && b.chapter === chapter && b.verse === verse
    );
}

export function clearAllBookmarks() {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]));
    return [];
}
