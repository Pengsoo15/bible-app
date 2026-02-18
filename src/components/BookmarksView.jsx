import { useState } from 'react';
import { ArrowLeft, BookmarkX, Trash2 } from 'lucide-react';
import { getBookmarks, removeBookmark, clearAllBookmarks } from '../utils/bookmarks';

export default function BookmarksView({ onBack }) {
    const [bookmarks, setBookmarks] = useState(() => getBookmarks());

    const handleRemove = (b) => {
        setBookmarks(removeBookmark(b.book, b.chapter, b.verse));
    };

    const handleClearAll = () => {
        if (window.confirm('Remove all bookmarks?')) {
            setBookmarks(clearAllBookmarks());
        }
    };

    // Group bookmarks by book
    const grouped = bookmarks.reduce((acc, b) => {
        if (!acc[b.book]) acc[b.book] = [];
        acc[b.book].push(b);
        return acc;
    }, {});

    return (
        <div className="bookmarks-view">
            <div className="bookmarks-header">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={18} />
                    <span>Library</span>
                </button>
                <h2 className="bookmarks-title">
                    🔖 My Verses
                </h2>
                <span className="verse-count">{bookmarks.length} saved</span>
            </div>

            {bookmarks.length > 0 && (
                <button className="bm-clear-btn" onClick={handleClearAll}>
                    <Trash2 size={14} />
                    <span>Clear All</span>
                </button>
            )}

            {bookmarks.length === 0 ? (
                <div className="bm-empty">
                    <BookmarkX size={56} style={{ opacity: 0.15 }} />
                    <p>No bookmarks yet</p>
                    <p className="bm-empty-hint">
                        Tap the 🔖 icon next to any verse to save it here.
                    </p>
                </div>
            ) : (
                <div className="bm-groups">
                    {Object.entries(grouped).map(([bookName, verses]) => (
                        <div key={bookName} className="bm-group">
                            <h3 className="bm-group-title">{bookName}</h3>
                            <div className="bm-verses">
                                {verses.map((b) => (
                                    <div key={`${b.book}-${b.chapter}-${b.verse}`} className="bm-verse">
                                        <div className="bm-verse-content">
                                            <span className="bm-verse-ref">
                                                {b.chapter}:{b.verse}
                                            </span>
                                            <span className="bm-verse-text">{b.text}</span>
                                        </div>
                                        <button
                                            className="bm-remove-btn"
                                            onClick={() => handleRemove(b)}
                                            title="Remove bookmark"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
