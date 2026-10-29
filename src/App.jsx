import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { vocabularyAPI } from "./lib/supabaseClient";
import HomePage from "./pages/HomePage";
import PracticePage from "./pages/PracticePage";
import StatsPage from "./pages/StatsPage";
import VocabularyPage from "./pages/VocabularyPage";
import DrivingPage from "./pages/DrivingPage";
import SentenceCompletionPage from "./pages/SentenceCompletionPage";
import SignsPage from "./pages/SignsPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import WritingPage from "./pages/WritingPage";
import he from "./locales/hebrew.json";
import fa from "./locales/persian.json";
import { useAuth } from "./hooks/useAuth";
import SettingsMenu from "./components/SettingsMenu";
import AuthModal from "./components/AuthModal";
import LoadingSpinner from "./components/LoadingSpinner";

export default function App() {
  const [lang, setLang] = useState("he");
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("fontSize");
    return saved ? parseInt(saved, 10) : 16;
  });
  const [stats, setStatistics] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  // שחרור נעילת גלילה ואיפוס מיקום למעלה בכל מעבר דף
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'unset';
  }, [location.pathname]);

  const loadStats = async () => {
    try {
      const { data: stats, error } = await vocabularyAPI.getStats();
      if (error) {
        console.error("Error loading stats:", error);
        return;
      }
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // אורח - לא נטענות ולא נספרות סטטיסטיקות
  useEffect(() => {
    if (user) {
      loadStats();
      // התחברות (גם בהרשמה או מלשונית אחרת) סוגרת את חלון ההתחברות
      setShowAuthModal(false);
    } else {
      setStatistics({});
    }
  }, [user]);

  const openAuthModal = useCallback(() => setShowAuthModal(true), []);
  const closeAuthModal = useCallback(() => setShowAuthModal(false), []);

  const translate = lang === "he" ? he : fa;

  const handleLanguageChange = () => {
    setLang(lang === "he" ? "fa" : "he");
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleSignOutChange = () => {
    signOut();
  };

  const headerAuthBtnClasses =
    "absolute top-5 left-5 flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white/95 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow";

  // בדיקה אם הלינק הנוכחי פעיל בשביל להוסיף סגנון
  const getNavClass = (path) => {
    const isActive = location.pathname === path;
    return `px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
      isActive 
        ? 'bg-white/20 text-white shadow-sm' 
        : 'text-white/90 hover:bg-white/10 hover:text-white'
    }`;
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner translate={translate} />
        </div>
      ) : (
        <>
          {/* כפתורי שליטה צפים (שפה ונושא) */}
          <div className="fixed top-4 right-4 z-[1000] flex gap-2">
            <button
              onClick={handleLanguageChange}
              className="glass-card flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-dark-surface transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              <span>{lang === "he" ? "עברית" : "فارسی"}</span>
            </button>
          </div>

          <header className="bg-gradient-to-l from-brand-700 to-brand-500 text-white px-6 py-6 shadow-md rounded-b-3xl mb-6 mx-2 mt-2">
            <div className="max-w-5xl mx-auto flex flex-col items-center">
              <h1 className="text-2xl font-bold mb-4">
                {user
                  ? `${translate?.welcome}, ${user.user_metadata?.full_name || ""}`
                  : translate?.guest?.welcome}
              </h1>
              <nav className="flex gap-2 flex-wrap justify-center bg-black/10 p-1.5 rounded-2xl backdrop-blur-sm">
                <Link className={getNavClass("/")} to="/">
                  {translate?.home}
                </Link>
                <Link className={getNavClass("/practice")} to="/practice">
                  {translate?.practice}
                </Link>
                <Link className={getNavClass("/stats")} to="/stats">
                  {translate?.stats}
                </Link>
              </nav>

              {user ? (
                <button
                  className={headerAuthBtnClasses}
                  onClick={handleSignOutChange}
                  aria-label={translate?.signOut}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  {translate?.signOut}
                </button>
              ) : (
                <button
                  className={headerAuthBtnClasses}
                  onClick={openAuthModal}
                  aria-label={translate?.auth?.signIn}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                  {translate?.auth?.signIn}
                </button>
              )}
            </div>
          </header>

          <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage statistics={stats} translate={translate} user={user} language={lang} onLogin={openAuthModal} />} />
              <Route path="/practice" element={<PracticePage translate={translate} />} />
              <Route path="/stats" element={<StatsPage translate={translate} onLogin={openAuthModal} />} />
              <Route path="/practice/vocabulary" element={<VocabularyPage translate={translate} onLogin={openAuthModal} />} />
              <Route path="/practice/driving" element={<DrivingPage translate={translate} language={lang} />} />
              <Route path="/practice/sentence-completion" element={<SentenceCompletionPage translate={translate} language={lang} />} />
              <Route path="/practice/flashcards" element={<FlashcardsPage translate={translate} language={lang} onLogin={openAuthModal} />} />
              <Route path="/practice/spelling" element={<WritingPage translate={translate} onLogin={openAuthModal} />} />
              <Route path="/practice/driving/signs"element={<SignsPage translate={translate} language={lang} />} />
              {/* נתיבים לא קיימים (כולל /auth הישן) חוזרים לדף הבית */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="mt-auto py-6 border-t border-slate-200 dark:border-dark-border">
            <div className="max-w-5xl mx-auto px-4 md:px-6 w-full flex items-center justify-between">
              <div className="flex-1 flex justify-start relative z-50">
                <SettingsMenu 
                  isDark={isDark} 
                  toggleTheme={toggleTheme} 
                  fontSize={fontSize} 
                  setFontSize={setFontSize}
                  translate={translate}
                />
              </div>
              <div className="flex-[2] text-center text-slate-500 dark:text-dark-muted text-sm">
                <p>© 2026 {translate.allRightsReserved}</p>
              </div>
              <div className="flex-1"></div>
            </div>
          </footer>

          {showAuthModal && !user && (
            <AuthModal translate={translate} onClose={closeAuthModal} />
          )}
        </>
      )}
    </div>
  );
}
