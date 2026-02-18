import { useState, useMemo } from 'react';
import { ArrowLeft, Search, BookOpen, Bookmark } from 'lucide-react';
import { addBookmark, removeBookmark, isBookmarked } from '../utils/bookmarks';

function HighlightText({ text, query }) {
    if (!query) return <>{text}</>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="search-highlight">{part}</mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
}

export default function BookView({ bookData, onBack }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChapter, setActiveChapter] = useState(null);
    // Track bookmark changes to force re-render
    const [bmVersion, setBmVersion] = useState(0);

    const filteredChapters = useMemo(() => {
        if (!bookData || !bookData.chapters) return [];
        const q = searchQuery.toLowerCase().trim();

        return bookData.chapters
            .filter((ch) => activeChapter === null || ch.ch === activeChapter)
            .map((chapter) => ({
                ...chapter,
                verses: chapter.verses.filter((verse) =>
                    !q || verse.t.toLowerCase().includes(q)
                ),
            }))
            .filter((chapter) => chapter.verses.length > 0);
    }, [bookData, searchQuery, activeChapter]);

    const totalVerses = filteredChapters.reduce((sum, ch) => sum + ch.verses.length, 0);

    const toggleBookmark = (chapter, verse) => {
        const bookName = bookData.book;
        if (isBookmarked(bookName, chapter, verse.v)) {
            removeBookmark(bookName, chapter, verse.v);
        } else {
            addBookmark({
                book: bookName,
                chapter,
                verse: verse.v,
                text: verse.t,
            });
        }
        setBmVersion(v => v + 1);
    };

    if (!bookData) return null;

    return (
        <div className="book-view">
            {/* Header */}
            <div className="book-view-header">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={18} />
                    <span>Library</span>
                </button>
                <h2 className="book-view-title">
                    <BookOpen size={24} style={{ color: 'var(--accent)' }} />
                    {bookData.book}
                </h2>
                <span className="verse-count">{totalVerses} verses</span>
            </div>

            {/* Search Bar */}
            <div className="controls-bar">
                <div className="search-container">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search verses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => setSearchQuery('')}>×</button>
                    )}
                </div>
            </div>

            {/* Chapter Pills */}
            <div className="chapter-pills">
                <button
                    className={`chapter-pill ${activeChapter === null ? 'active' : ''}`}
                    onClick={() => setActiveChapter(null)}
                >
                    All
                </button>
                {bookData.chapters.map((ch) => (
                    <button
                        key={ch.ch}
                        className={`chapter-pill ${activeChapter === ch.ch ? 'active' : ''}`}
                        onClick={() => setActiveChapter(ch.ch)}
                    >
                        Ch {ch.ch}
                    </button>
                ))}
            </div>

            {/* Verse Content */}
            <div className="chapters-container">
                {filteredChapters.length === 0 ? (
                    <div className="no-results">
                        <Search size={48} style={{ opacity: 0.2 }} />
                        <p>No verses match your search.</p>
                    </div>
                ) : (
                    filteredChapters.map((chapter) => (
                        <div key={chapter.ch} className="chapter-block">
                            <h3 className="chapter-heading">Chapter {chapter.ch}</h3>
                            <div className="verses-list">
                                {chapter.verses.map((verse) => {
                                    const saved = isBookmarked(bookData.book, chapter.ch, verse.v);
                                    return (
                                        <div key={verse.v} className="verse-row">
                                            <span className="verse-num">{verse.v}</span>
                                            <span className="verse-text">
                                                <HighlightText text={verse.t} query={searchQuery} />
                                            </span>
                                            <button
                                                className={`verse-bm-btn ${saved ? 'bookmarked' : ''}`}
                                                onClick={() => toggleBookmark(chapter.ch, verse)}
                                                title={saved ? 'Remove bookmark' : 'Bookmark this verse'}
                                            >
                                                <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
