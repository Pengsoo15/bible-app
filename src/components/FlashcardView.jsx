import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Shuffle, X, Check, Lightbulb, ArrowLeft } from 'lucide-react';
import { BIBLE_BOOKS } from '../data/books';

function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

const STORAGE_KEY = '66books_progress';

function loadProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : { knownNames: [], bestScore: 0 };
    } catch {
        return { knownNames: [], bestScore: 0 };
    }
}

function saveProgress(knownCards, bestScore) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            knownNames: knownCards.map(c => c.name),
            bestScore,
        }));
    } catch { }
}

export default function FlashcardView({ onBack }) {
    const [cards, setCards] = useState(() =>
        BIBLE_BOOKS.map((name, i) => ({ name, number: i + 1 }))
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState([]);
    const [learningCards, setLearningCards] = useState([]);
    const [history, setHistory] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [bestScore, setBestScore] = useState(() => loadProgress().bestScore);
    const [backCard, setBackCard] = useState(null);

    const currentCard = cards[currentIndex];
    const remaining = cards.length - currentIndex;

    const goToNext = useCallback(() => {
        if (currentIndex + 1 >= cards.length) {
            setIsComplete(true);
        } else {
            setCurrentIndex((prev) => prev + 1);
            setIsFlipped(false);
            setShowHint(false);
        }
    }, [currentIndex, cards.length]);

    const markKnown = useCallback(() => {
        if (!currentCard) return;
        setHistory((prev) => [...prev, { card: currentCard, action: 'known', index: currentIndex }]);
        setKnownCards((prev) => [...prev, currentCard]);
        goToNext();
    }, [currentCard, currentIndex, goToNext]);

    const markLearning = useCallback(() => {
        if (!currentCard) return;
        setHistory((prev) => [...prev, { card: currentCard, action: 'learning', index: currentIndex }]);
        setLearningCards((prev) => [...prev, currentCard]);
        goToNext();
    }, [currentCard, currentIndex, goToNext]);

    const handleUndo = useCallback(() => {
        if (history.length === 0) return;
        const lastAction = history[history.length - 1];
        setHistory((prev) => prev.slice(0, -1));

        if (lastAction.action === 'known') {
            setKnownCards((prev) => prev.slice(0, -1));
        } else {
            setLearningCards((prev) => prev.slice(0, -1));
        }

        setCurrentIndex(lastAction.index);
        setIsFlipped(false);
        setShowHint(false);
        setIsComplete(false);
        setBackCard(null);
    }, [history]);

    const handleShuffle = () => {
        const shuffled = shuffleArray(BIBLE_BOOKS.map((name, i) => ({ name, number: i + 1 })));
        setCards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowHint(false);
        setKnownCards([]);
        setLearningCards([]);
        setHistory([]);
        setIsComplete(false);
        setIsShuffled(true);
        setBackCard(null);
    };

    const handleReset = () => {
        setCards(BIBLE_BOOKS.map((name, i) => ({ name, number: i + 1 })));
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowHint(false);
        setKnownCards([]);
        setLearningCards([]);
        setHistory([]);
        setIsComplete(false);
        setIsShuffled(false);
        setBackCard(null);
    };

    const toggleFlip = useCallback(() => {
        if (!isFlipped) {
            setBackCard(currentCard);
        }
        setIsFlipped((prev) => !prev);
    }, [isFlipped, currentCard]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isComplete) return;
            if (e.code === 'Space') {
                e.preventDefault();
                toggleFlip();
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                if (isFlipped) markKnown();
            } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                if (isFlipped) markLearning();
            } else if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
                handleUndo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isComplete, isFlipped, toggleFlip, markKnown, markLearning, handleUndo]);

    // Save progress when round completes
    useEffect(() => {
        if (isComplete && knownCards.length > 0) {
            const newBest = Math.max(bestScore, knownCards.length);
            setBestScore(newBest);
            saveProgress(knownCards, newBest);
        }
    }, [isComplete]);

    const getHint = () => {
        if (!currentCard) return '';
        const name = currentCard.name;
        return name[0] + name.slice(1).replace(/[a-zA-Z]/g, '_');
    };

    // Completion screen
    if (isComplete) {
        return (
            <div className="flashcard-view">
                <div className="fc-complete">
                    <div className="fc-complete-icon">🎉</div>
                    <h2>Round Complete!</h2>
                    <div className="fc-complete-stats">
                        <div className="fc-stat fc-stat--know">
                            <Check size={20} />
                            <span>{knownCards.length} Known</span>
                        </div>
                        <div className="fc-stat fc-stat--learning">
                            <X size={20} />
                            <span>{learningCards.length} Still Learning</span>
                        </div>
                    </div>
                    {bestScore > 0 && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                            🏆 Best score: <strong style={{ color: '#22c55e' }}>{bestScore}/66</strong> known
                        </p>
                    )}
                    {learningCards.length > 0 && (
                        <button
                            className="fc-btn fc-btn--primary"
                            onClick={() => {
                                setCards(shuffleArray(learningCards));
                                setCurrentIndex(0);
                                setIsFlipped(false);
                                setShowHint(false);
                                setKnownCards([]);
                                setLearningCards([]);
                                setHistory([]);
                                setIsComplete(false);
                            }}
                        >
                            Practice "Still Learning" ({learningCards.length})
                        </button>
                    )}
                    <button className="fc-btn fc-btn--secondary" onClick={handleReset}>
                        Start Over (All 66)
                    </button>
                    <button className="fc-btn fc-btn--ghost" onClick={onBack}>
                        ← Back to Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flashcard-view">
            {/* Top Bar: Progress Counters */}
            <div className="fc-top-bar">
                <button className="fc-back-btn" onClick={onBack}>
                    <ArrowLeft size={18} />
                    <span>Library</span>
                </button>
                <div className="fc-counters">
                    <div className="fc-counter fc-counter--learning">
                        <span className="fc-counter-num">{learningCards.length}</span>
                        <span className="fc-counter-label">Still learning</span>
                    </div>
                    <div className="fc-counter fc-counter--remaining">
                        <span className="fc-counter-num">{remaining}</span>
                        <span className="fc-counter-label">Remaining</span>
                    </div>
                    <div className="fc-counter fc-counter--know">
                        <span className="fc-counter-num">{knownCards.length}</span>
                        <span className="fc-counter-label">Know</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="fc-progress-bar">
                <div
                    className="fc-progress-fill fc-progress-fill--learning"
                    style={{ width: `${(learningCards.length / cards.length) * 100}%` }}
                />
                <div
                    className="fc-progress-fill fc-progress-fill--know"
                    style={{ width: `${(knownCards.length / cards.length) * 100}%` }}
                />
            </div>

            {/* Flashcard */}
            <div className="fc-card-container" onClick={toggleFlip}>
                <div className={`fc-card ${isFlipped ? 'fc-card--flipped' : ''}`}>
                    {/* Front: Book Number */}
                    <div className="fc-card-face fc-card-front">
                        {showHint && (
                            <div className="fc-hint">
                                <Lightbulb size={14} />
                                <span>{getHint()}</span>
                            </div>
                        )}
                        <div className="fc-card-content">
                            <span className="fc-card-label">Book</span>
                            <span className="fc-card-number">#{currentCard.number}</span>
                        </div>
                        {!showHint && (
                            <button
                                className="fc-hint-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowHint(true);
                                }}
                            >
                                <Lightbulb size={16} />
                                <span>Get a hint</span>
                            </button>
                        )}
                    </div>

                    {/* Back: Book Name */}
                    <div className="fc-card-face fc-card-back">
                        <div className="fc-card-content">
                            <span className="fc-card-label">Book #{(backCard || currentCard).number}</span>
                            <span className="fc-card-answer">{(backCard || currentCard).name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shortcut Bar */}
            <div className="fc-shortcut-bar">
                <span>⌨️ <strong>Shortcut</strong> Press <kbd>Space</kbd> or click the card to flip</span>
            </div>

            {/* Action Buttons */}
            <div className="fc-actions">
                <button
                    className="fc-action-btn fc-action-btn--learning"
                    onClick={markLearning}
                    disabled={!isFlipped}
                    title="Still Learning (← or A)"
                >
                    <X size={22} />
                </button>
                <button
                    className="fc-action-btn fc-action-btn--know"
                    onClick={markKnown}
                    disabled={!isFlipped}
                    title="Know (→ or D)"
                >
                    <Check size={22} />
                </button>
            </div>

            {/* Bottom Controls */}
            <div className="fc-bottom-controls">
                <button
                    className="fc-control-btn"
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    title="Undo (Ctrl+Z)"
                >
                    <RotateCcw size={18} />
                </button>
                <button
                    className="fc-control-btn"
                    onClick={handleShuffle}
                    title="Shuffle"
                >
                    <Shuffle size={18} />
                </button>
            </div>
        </div>
    );
}
