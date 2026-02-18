import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import BOOK_DATA from '../data/bookData';
import { BIBLE_BOOKS } from '../data/books';

const VOTD_KEY = '66books_votd';

function getDayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

/**
 * Use the date as a seed to pick a deterministic "random" verse for the day.
 * Same date = same verse for all users.
 */
function pickVerseForDay(dayKey) {
    // Simple hash from the day string
    let hash = 0;
    for (let i = 0; i < dayKey.length; i++) {
        hash = ((hash << 5) - hash) + dayKey.charCodeAt(i);
        hash |= 0;
    }
    hash = Math.abs(hash);

    // Pick a book
    const bookIndex = hash % BIBLE_BOOKS.length;
    const bookName = BIBLE_BOOKS[bookIndex];
    const bookData = BOOK_DATA[bookName];

    if (!bookData || !bookData.chapters || bookData.chapters.length === 0) {
        return { book: bookName, chapter: 1, verse: 1, text: 'In the beginning God created the heaven and the earth.' };
    }

    // Pick a chapter
    const chapterIndex = hash % bookData.chapters.length;
    const chapter = bookData.chapters[chapterIndex];

    // Pick a verse
    const verseIndex = (hash >> 3) % chapter.verses.length;
    const verse = chapter.verses[verseIndex];

    return {
        book: bookName,
        chapter: chapter.ch,
        verse: verse.v,
        text: verse.t,
    };
}

function getOrCreateVOTD() {
    const today = getDayKey();

    try {
        const saved = localStorage.getItem(VOTD_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.dayKey === today) {
                return parsed;
            }
        }
    } catch { }

    // Generate new verse and save
    const verseData = pickVerseForDay(today);
    const votd = { dayKey: today, ...verseData };

    try {
        localStorage.setItem(VOTD_KEY, JSON.stringify(votd));
    } catch { }

    return votd;
}

export default function VerseOfTheDay({ onBack }) {
    const [votd, setVotd] = useState(() => getOrCreateVOTD());

    // Check if a new day has started (in case user keeps tab open)
    useEffect(() => {
        const interval = setInterval(() => {
            const today = getDayKey();
            if (votd.dayKey !== today) {
                setVotd(getOrCreateVOTD());
            }
        }, 60000); // check every minute
        return () => clearInterval(interval);
    }, [votd.dayKey]);

    return (
        <div className="votd-view">
            <button className="back-btn" onClick={onBack}>
                <ArrowLeft size={18} />
                <span>Library</span>
            </button>

            <div className="votd-card">
                <div className="votd-label">Verse of the Day</div>
                <blockquote className="votd-text">
                    "{votd.text}"
                </blockquote>
                <cite className="votd-ref">
                    — {votd.book} {votd.chapter}:{votd.verse}
                </cite>
                <div className="votd-meta">
                    <RefreshCw size={14} />
                    <span>Refreshes daily</span>
                </div>
            </div>
        </div>
    );
}
