import { useState, useEffect } from 'react';
import { BIBLE_BOOKS } from './data/books';
import BookView from './components/BookView';
import FlashcardView from './components/FlashcardView';
import VerseOfTheDay from './components/VerseOfTheDay';
import BookmarksView from './components/BookmarksView';
import ChatBot from './components/ChatBot';
import { BookOpen, Brain, ChevronUp, Sparkles, Bookmark, MessageCircle } from 'lucide-react';
import BOOK_DATA from './data/bookData';
import './index.css';

function App() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showVOTD, setShowVOTD] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const bookData = selectedBook ? BOOK_DATA[selectedBook] || null : null;

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const ScrollTopButton = () =>
    showScrollTop ? (
      <button className="scroll-top-btn" onClick={scrollToTop} title="Back to top">
        <ChevronUp size={20} />
      </button>
    ) : null;

  // Flashcard mode
  if (showFlashcards) {
    return (
      <div className="app-container">
        <FlashcardView onBack={() => setShowFlashcards(false)} />
        <ScrollTopButton />
      </div>
    );
  }

  // Verse of the Day
  if (showVOTD) {
    return (
      <div className="app-container">
        <VerseOfTheDay onBack={() => setShowVOTD(false)} />
        <ScrollTopButton />
      </div>
    );
  }

  // Book view
  if (selectedBook) {
    return (
      <div className="app-container">
        <BookView bookData={bookData} onBack={() => setSelectedBook(null)} />
        <ScrollTopButton />
      </div>
    );
  }

  // Bookmarks
  if (showBookmarks) {
    return (
      <div className="app-container">
        <BookmarksView onBack={() => setShowBookmarks(false)} />
        <ScrollTopButton />
      </div>
    );
  }

  // Chatbot
  if (showChat) {
    return (
      <div className="app-container">
        <ChatBot onBack={() => setShowChat(false)} />
      </div>
    );
  }

  // Home screen
  return (
    <div className="app-container">
      <header className="home-header">
        <h1 className="home-title">
          <span style={{ color: 'var(--accent)' }}>66</span> Books
        </h1>
        <p className="home-subtitle">Scripture Memorization App</p>

        <div className="home-actions">
          <button className="practice-btn" onClick={() => setShowFlashcards(true)}>
            <Brain size={20} />
            <span>Practice Flashcards</span>
          </button>
          <button className="practice-btn votd-btn" onClick={() => setShowVOTD(true)}>
            <Sparkles size={20} />
            <span>Verse of the Day</span>
          </button>
          <button className="practice-btn bm-btn" onClick={() => setShowBookmarks(true)}>
            <Bookmark size={20} />
            <span>My Verses</span>
          </button>
          <button className="practice-btn chat-btn" onClick={() => setShowChat(true)}>
            <MessageCircle size={20} />
            <span>Bible Assistant</span>
          </button>
        </div>
      </header>

      <div className="card-grid">
        {BIBLE_BOOKS.map((book, index) => (
          <div
            key={book}
            className="book-card"
            onClick={() => setSelectedBook(book)}
          >
            <div className="book-number">{index + 1}</div>
            <BookOpen size={22} style={{ marginBottom: '0.75rem', color: 'var(--accent)', opacity: 0.7 }} />
            <div className="book-title">{book}</div>
          </div>
        ))}
      </div>
      <ScrollTopButton />
    </div>
  );
}

export default App;
