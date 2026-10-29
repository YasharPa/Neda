import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useVocabulary } from "../hooks/useVocabulary";
import { useFlashcards } from "../hooks/useFlashcards";
import { useAuth } from "../hooks/useAuth";
import { flashcardsAPI, signsAPI } from "../lib/supabaseClient";
import Flashcard from "../components/Flashcard";
import Speaker from "../components/Speaker";
import LoadingSpinner from "../components/LoadingSpinner";
import LoginPrompt from "../components/LoginPrompt";
import { OptionButton, SettingRow } from "../components/SetupOptions";
import { shuffleArray } from "../lib/shuffle";
import { shouldIgnoreShortcut } from "../lib/keyboard";

const CARD_COUNTS = [10, 20, "all"];
const WORD_FILTERS = ["all", "unclassified", "easy", "medium", "hard"];

// דירוג כרטיס -> רמת קושי של מילה
const RATING_TO_DIFFICULTY = {
  known: "easy",
  partial: "medium",
  unknown: "hard",
};

const RATING_COLORS = {
  unknown: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
  partial: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400",
  known: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
};

const RATING_HOVER = {
  unknown: "hover:bg-red-500 dark:hover:bg-red-600",
  partial: "hover:bg-orange-500 dark:hover:bg-orange-600",
  known: "hover:bg-emerald-500 dark:hover:bg-emerald-600",
};

const wordToCard = (word) => ({
  id: `w-${word.id}`,
  kind: "word",
  wordId: word.id,
  hebrew: word.hebrew,
  persian: word.persian,
  example: word.example_sentence,
});

const signToCard = (sign) => ({
  id: `s-${sign.sign_code}`,
  kind: "sign",
  code: sign.sign_code,
  image: sign.image_url,
  hebrew: sign.hebrew_name,
  persian: sign.persian_name,
  category: sign.category,
});

// ─── FlashcardsPage ───────────────────────────────────────────────────────────

const FlashcardsPage = ({ translate, language = "he", onLogin }) => {
  const t = translate.flashcards;
  const { user } = useAuth();
  const { words, loading: wordsLoading, updateWordDifficulty, refreshStats } = useVocabulary();
  const {
    current,
    remaining,
    totalCards,
    reviewed,
    isFinished,
    summary,
    missedCards,
    start,
    rate,
    finish,
    reset,
  } = useFlashcards();

  // לאורח אין מילים אישיות, ולכן מתחילים מחפיסת התמרורים
  const [deckType, setDeckType] = useState(user ? "words" : "signs");
  const [wordFilter, setWordFilter] = useState("all");
  const [frontSide, setFrontSide] = useState("hebrew");
  const [signCategory, setSignCategory] = useState("all");
  const [cardCount, setCardCount] = useState(20);
  const [shuffle, setShuffle] = useState(true);

  const [signs, setSigns] = useState([]);
  const [signsLoading, setSignsLoading] = useState(false);
  const [signsError, setSignsError] = useState(null);

  const [isFlipped, setIsFlipped] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savedRef = useRef(false);
  // סבב חוזר על טעויות לא נשמר כסבב חדש בסטטיסטיקה
  const isRetryRef = useRef(false);
  // עדכוני רמת קושי שעדיין בדרך, ומספר העדכונים שנכשלו
  const pendingUpdatesRef = useRef([]);
  const [failedSaves, setFailedSaves] = useState(0);

  const inSession = totalCards > 0;

  const loadSigns = useCallback(() => {
    setSignsLoading(true);
    setSignsError(null);
    signsAPI
      .getAll()
      .then(({ data, error }) => {
        if (error) setSignsError(t.loadError);
        else setSigns(data);
      })
      .finally(() => setSignsLoading(false));
  }, [t.loadError]);

  // טעינת תמרורים רק כשבוחרים בחפיסת תמרורים
  useEffect(() => {
    if (deckType === "signs" && signs.length === 0) loadSigns();
  }, [deckType, signs.length, loadSigns]);

  const signCategories = useMemo(
    () => [...new Set(signs.map((s) => s.category).filter(Boolean))],
    [signs],
  );

  const availableCards = useMemo(() => {
    if (deckType === "words") {
      const filtered = words.filter((w) => {
        if (wordFilter === "all") return true;
        if (wordFilter === "unclassified") return w.difficulty === null;
        return w.difficulty === wordFilter;
      });
      return filtered.map(wordToCard);
    }
    return signs
      .filter((s) => signCategory === "all" || s.category === signCategory)
      .map(signToCard);
  }, [deckType, words, wordFilter, signs, signCategory]);

  const startSession = (cards, { isRetry = false } = {}) => {
    savedRef.current = false;
    isRetryRef.current = isRetry;
    pendingUpdatesRef.current = [];
    setFailedSaves(0);
    setSaveError(false);
    setIsFlipped(false);
    start(cards);
  };

  const handleStart = () => {
    const ordered = shuffle ? shuffleArray(availableCards) : availableCards;
    const limited = cardCount === "all" ? ordered : ordered.slice(0, cardCount);
    startSession(limited);
  };

  const handleRate = (rating) => {
    const { card, isFirst } = rate(rating);
    setIsFlipped(false);
    if (card?.kind === "word" && isFirst) {
      const update = updateWordDifficulty(card.wordId, RATING_TO_DIFFICULTY[rating], {
        refreshStats: false,
      }).then((ok) => {
        if (!ok) setFailedSaves((n) => n + 1);
      });
      pendingUpdatesRef.current.push(update);
    }
  };

  // שמירת הסבב בסיומו
  useEffect(() => {
    if (!isFinished || savedRef.current) return;
    savedRef.current = true;
    if (reviewed === 0) {
      reset();
      return;
    }
    // רענון סטטיסטיקות המילים פעם אחת, אחרי שכל העדכונים הסתיימו
    if (deckType === "words") {
      Promise.allSettled(pendingUpdatesRef.current).then(() => refreshStats());
    }
    // סבב חוזר, או אורח – לא נשמר בסטטיסטיקה
    if (isRetryRef.current || !user) return;
    flashcardsAPI
      .saveSession({ deckType, ...summary }, user?.id)
      .then(({ error }) => setSaveError(Boolean(error)));
  }, [isFinished, reviewed, summary, deckType, user, reset, refreshStats]);

  // קיצורי מקלדת: רווח להפיכה, 1/2/3 לדירוג
  useEffect(() => {
    if (!current) return;
    const handleKey = (e) => {
      if (shouldIgnoreShortcut(e)) return;
      if (e.key === " ") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (isFlipped && e.key === "1") {
        handleRate("unknown");
      } else if (isFlipped && e.key === "2") {
        handleRate("partial");
      } else if (isFlipped && e.key === "3") {
        handleRate("known");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // ── תוכן הכרטיסים ──

  const renderWordSide = (card, side) => {
    if (side === "hebrew") {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
            {card.hebrew}
          </div>
          <Speaker text={card.hebrew} lang="he-IL" />
        </div>
      );
    }
    return (
      <div className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
        {card.persian}
      </div>
    );
  };

  const renderFront = (card) => {
    if (card.kind === "sign") {
      return (
        <img
          src={card.image}
          alt={card.code}
          draggable={false}
          className="max-h-48 md:max-h-60 object-contain drop-shadow-sm"
        />
      );
    }
    return renderWordSide(card, frontSide);
  };

  const renderBack = (card) => {
    if (card.kind === "sign") {
      // השם בעברית תמיד מוצג ומוקרא; בממשק פרסי מתווסף התרגום
      return (
        <div className="relative flex flex-col items-center gap-3">
          <img
            src={card.image}
            alt={card.code}
            draggable={false}
            className="max-h-24 object-contain opacity-80"
          />
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {card.code}
          </span>
          <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
            {card.hebrew}
          </div>
          {language !== "he" && card.persian && (
            <div className="text-base text-slate-500 dark:text-slate-400">{card.persian}</div>
          )}
          <Speaker text={card.hebrew} lang="he-IL" />
        </div>
      );
    }
    const backSide = frontSide === "hebrew" ? "persian" : "hebrew";
    return (
      <div className="relative flex flex-col items-center gap-4 w-full">
        <div className="text-base text-slate-500 dark:text-slate-400">
          {frontSide === "hebrew" ? card.hebrew : card.persian}
        </div>
        {renderWordSide(card, backSide)}
        {card.example && (
          <div className="text-sm px-4 py-2 bg-white/50 dark:bg-black/20 rounded-xl border-r-4 border-emerald-400 text-slate-700 dark:text-slate-300 max-w-full">
            {card.example}
          </div>
        )}
      </div>
    );
  };

  // ── מסך סיכום ──

  if (inSession && isFinished) {
    const percentage = reviewed > 0 ? Math.round((summary.known / reviewed) * 100) : 0;
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-slide-up pb-10">
        <div className="glass-card p-8 text-center flex flex-col items-center gap-4">
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 m-0">
            {t.summaryTitle}
          </h1>
          <div className="text-5xl font-bold text-brand-600 dark:text-brand-400">{percentage}%</div>
          <div className="grid grid-cols-3 gap-3 w-full mt-2">
            {["known", "partial", "unknown"].map((rating) => (
              <div key={rating} className={`rounded-2xl p-4 ${RATING_COLORS[rating]}`}>
                <div className="text-2xl font-bold">{summary[rating]}</div>
                <div className="text-sm font-semibold">{t[rating]}</div>
              </div>
            ))}
          </div>
          {saveError && <p className="text-sm text-red-600 dark:text-red-400 m-0">{t.saveError}</p>}
          {failedSaves > 0 && (
            <p className="text-sm text-red-600 dark:text-red-400 m-0">
              {failedSaves} {t.ratingsNotSaved}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {missedCards.length > 0 && (
            <button
              onClick={() =>
                startSession(shuffle ? shuffleArray(missedCards) : missedCards, { isRetry: true })
              }
              className="bg-brand-600 text-white rounded-xl py-3 px-6 font-bold transition-all duration-300 hover:bg-brand-500 shadow-md shadow-brand-500/20"
            >
              {t.repeatMissed} ({missedCards.length})
            </button>
          )}
          <button
            onClick={reset}
            className="glass-card-interactive py-3 px-6 font-bold text-slate-700 dark:text-slate-200"
          >
            {t.newSession}
          </button>
        </div>
      </div>
    );
  }

  // ── מסך תרגול ──

  if (inSession && current) {
    const progress = Math.round((reviewed / totalCards) * 100);
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-slide-up pb-10">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-medium text-slate-600 dark:text-dark-muted">
            {t.card} {Math.min(reviewed + 1, totalCards)} {t.of} {totalCards}
            {remaining > totalCards - reviewed && (
              <span className="mx-2 text-slate-400">· {t.inQueue}: {remaining}</span>
            )}
          </div>
          <button
            onClick={finish}
            className="text-sm font-medium px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t.endSession}
          </button>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {!user && (
          <p className="m-0 -mt-4 text-xs text-slate-500 dark:text-dark-muted">
            {translate?.guest?.progressNotSaved}
          </p>
        )}

        <Flashcard
          key={`${current.id}-${remaining}`}
          front={renderFront(current)}
          back={renderBack(current)}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((f) => !f)}
          onSwipe={(direction) => handleRate(direction === "right" ? "known" : "unknown")}
          tapHint={t.tapToFlip}
        />

        {isFlipped ? (
          <div className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto">
            {["unknown", "partial", "known"].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRate(rating)}
                className={`py-3 rounded-xl font-bold transition-all duration-200 hover:-translate-y-0.5 hover:text-white ${RATING_COLORS[rating]} ${RATING_HOVER[rating]}`}
              >
                {t[rating]}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full max-w-md mx-auto bg-brand-600 text-white rounded-xl py-3 font-bold transition-all duration-300 hover:bg-brand-500 shadow-md shadow-brand-500/20"
          >
            {t.flip}
          </button>
        )}

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 m-0">
          {isFlipped ? t.swipeHint : t.keyboardHint}
        </p>
      </div>
    );
  }

  // ── מסך הגדרות ──

  const isLoading = deckType === "words" ? wordsLoading : signsLoading;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-slide-up pb-10">
      <div className="glass-card p-6 md:p-8 text-center border-brand-200 dark:border-brand-900/50">
        <h1 className="m-0 text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-3">
          <span className="text-brand-500">🃏</span> {t.title}
        </h1>
        <p className="text-slate-600 dark:text-dark-muted mt-2 mb-0">{t.description}</p>
      </div>

      <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
        <h2 className="m-0 text-xl font-bold text-slate-800 dark:text-slate-100">{t.setupTitle}</h2>

        <SettingRow label={t.deck}>
          <OptionButton active={deckType === "words"} onClick={() => setDeckType("words")}>
            📖 {t.deckWords}
          </OptionButton>
          <OptionButton active={deckType === "signs"} onClick={() => setDeckType("signs")}>
            🚦 {t.deckSigns}
          </OptionButton>
        </SettingRow>

        {deckType === "words" ? (
          <>
            <SettingRow label={t.wordsFilter}>
              {WORD_FILTERS.map((filter) => (
                <OptionButton
                  key={filter}
                  active={wordFilter === filter}
                  onClick={() => setWordFilter(filter)}
                >
                  {translate.filterBar[filter]}
                </OptionButton>
              ))}
            </SettingRow>
            <SettingRow label={t.frontSide}>
              <OptionButton active={frontSide === "hebrew"} onClick={() => setFrontSide("hebrew")}>
                {t.frontHebrew}
              </OptionButton>
              <OptionButton active={frontSide === "persian"} onClick={() => setFrontSide("persian")}>
                {t.frontPersian}
              </OptionButton>
            </SettingRow>
          </>
        ) : (
          signCategories.length > 0 && (
            <SettingRow label={t.category}>
              <OptionButton active={signCategory === "all"} onClick={() => setSignCategory("all")}>
                {t.allCategories}
              </OptionButton>
              {signCategories.map((category) => (
                <OptionButton
                  key={category}
                  active={signCategory === category}
                  onClick={() => setSignCategory(category)}
                >
                  {category}
                </OptionButton>
              ))}
            </SettingRow>
          )
        )}

        <SettingRow label={t.cardCount}>
          {CARD_COUNTS.map((count) => (
            <OptionButton key={count} active={cardCount === count} onClick={() => setCardCount(count)}>
              {count === "all" ? t.all : count}
            </OptionButton>
          ))}
        </SettingRow>

        <label className="flex items-center gap-3 cursor-pointer font-medium text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={shuffle}
            onChange={(e) => setShuffle(e.target.checked)}
            className="w-5 h-5 accent-brand-600"
          />
          {t.shuffle}
        </label>

        {deckType === "words" && (
          <p className="text-sm text-slate-500 dark:text-slate-400 m-0">{t.ratingUpdatesDifficulty}</p>
        )}
      </div>

      {deckType === "words" && !user ? (
        // המילים אישיות – לאורח מוצגת בקשת התחברות
        <LoginPrompt
          translate={translate}
          message={translate?.guest?.flashcardsLoginMessage}
          onLogin={onLogin}
        />
      ) : isLoading ? (
        <LoadingSpinner translate={translate} size="small" />
      ) : signsError && deckType === "signs" ? (
        <div className="flex flex-col items-center gap-3">
          <p className="m-0 text-center text-red-600 dark:text-red-400">{signsError}</p>
          <button
            onClick={loadSigns}
            className="bg-brand-600 text-white rounded-xl py-2 px-6 font-bold hover:bg-brand-500 transition-colors"
          >
            {translate.errors.tryAgain}
          </button>
        </div>
      ) : deckType === "words" && words.length === 0 ? (
        <div className="glass-card p-8 text-center flex flex-col items-center gap-4">
          <p className="m-0 text-slate-600 dark:text-dark-muted">{t.noWords}</p>
          <Link
            to="/practice/vocabulary"
            className="bg-brand-600 text-white rounded-xl py-3 px-6 font-bold hover:bg-brand-500 transition-colors"
          >
            {t.goToVocabulary}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <span className="text-sm font-medium text-slate-600 dark:text-dark-muted">
            {availableCards.length > 0 ? `${availableCards.length} ${t.available}` : t.noCards}
          </span>
          <button
            onClick={handleStart}
            disabled={availableCards.length === 0}
            className="w-full sm:w-auto bg-brand-600 text-white rounded-xl py-4 px-12 text-lg font-bold transition-all duration-300 hover:bg-brand-500 shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.start}
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
