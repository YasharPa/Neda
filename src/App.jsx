import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { vocabularyAPI } from "./lib/supabaseClient";
import HomePage from "./pages/HomePage";
import PracticePage from "./pages/PracticePage";
import StatsPage from "./pages/StatsPage";
import VocabularyPage from "./pages/VocabularyPage";
import DrivingPage from "./pages/DrivingPage";
import SentenceCompletionPage from "./pages/SentenceCompletionPage";
import AuthPage from "./pages/AuthPage";
import SignsPage from "./pages/SignsPage";
import he from "./locales/hebrew.json";
import fa from "./locales/persian.json";
import { useAuth } from "./hooks/useAuth";
import SettingsMenu from "./components/SettingsMenu";

export default function App() {
  const [lang, setLang] = useState("he");
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("fontSize");
    return saved ? parseInt(saved, 10) : 16;
  });
  const [stats, setStatistics] = useState({});
  const { user, signOut } = useAuth();
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

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

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
      {!user ? (
        <AuthPage translate={translate} />
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

          <div className="fixed bottom-6 right-6 z-[1000]">
            <SettingsMenu 
              isDark={isDark} 
              toggleTheme={toggleTheme} 
              fontSize={fontSize} 
              setFontSize={setFontSize}
              translate={translate}
            />
          </div>

          <header className="bg-gradient-to-l from-brand-700 to-brand-500 text-white px-6 py-6 shadow-md rounded-b-3xl mb-6 mx-2 mt-2">
            <div className="max-w-5xl mx-auto flex flex-col items-center">
              <h1 className="text-2xl font-bold mb-4">
                {translate?.welcome}, {user.user_metadata.full_name}
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

              <button
                className="absolute top-6 left-6 px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                onClick={handleSignOutChange}
              >
                {translate?.signOut}
              </button>
            </div>
          </header>

          <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage statistics={stats} translate={translate} user={user} />} />
              <Route path="/auth" element={<AuthPage translate={translate} />} />
              <Route path="/practice" element={<PracticePage translate={translate} />} />
              <Route path="/stats" element={<StatsPage translate={translate} />} />
              <Route path="/practice/vocabulary" element={<VocabularyPage translate={translate} />} />
              <Route path="/practice/driving" element={<DrivingPage translate={translate} language={lang} />} />
              <Route path="/practice/sentence-completion" element={<SentenceCompletionPage translate={translate} language={lang} />} />
              <Route path="/practice/driving/signs" element={<SignsPage translate={translate} language={lang} />} />
            </Routes>
          </main>

          <footer className="mt-auto py-6 text-center text-slate-500 dark:text-dark-muted text-sm border-t border-slate-200 dark:border-dark-border">
            <p>© 2026 {translate.allRightsReserved}</p>
          </footer>
        </>
      )}
    </div>
  );
}
