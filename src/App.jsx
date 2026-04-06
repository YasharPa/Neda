import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { vocabularyAPI } from "./lib/supabaseClient";
import HomePage from "./pages/HomePage";
import PracticePage from "./pages/PracticePage";
import StatsPage from "./pages/StatsPage";
import VocabularyPage from "./pages/VocabularyPage";
import DrivingPage from "./pages/DrivingPage";
import SentenceCompletionPage from "./pages/SentenceCompletionPage";
import AuthPage from "./pages/AuthPage";
import he from "./locales/hebrew.json";
import fa from "./locales/persian.json";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

export default function App() {
  const [lang, setLang] = useState("he");
  const [stats, setStatistics] = useState({});
  const { user, signOut } = useAuth();

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
    loadStats();
  }, []);

  const translate = lang === "he" ? he : fa;

  const handleLanguageChange = () => {
    setLang(lang === "he" ? "fa" : "he");
  };

  const handleSignOutChange = () => {
    signOut();
  };

  const navbarAnchor =
    "text=white no-underline font-bold px-[0.8rem] py-[0.4rem] rounded-md transition-colors duration-200 hover:bg-white/20";

  if (!user) {
    return <AuthPage translate={translate} />;
  } else {
    return (
      <div className="flex flex-col min-h-screen">
        <button
          className="fixed top-2.5 right-2.5 z-[1000] py-[0.4rem] px-[0.8rem] text-[0.9rem] bg-white text-[#2a7ae4] border-2 border-[#2a7ae4] rounded-md cursor-pointer transition-colors duration-200 hover:bg-[#2a7ae4] hover:text-white"
          onClick={handleLanguageChange}
        >
          🌐 {lang === "he" ? "עברית" : "فارسی"}
        </button>
        <header className="bg-[#2a7ae4] text-white p-[1rem] text-center shadow-sm">
          <h1 className="mb-2">{translate?.welcome} 💙</h1>
          <nav className="flex gap-4 justify-center flex-wrap">
            <Link className={navbarAnchor} to="/">
              {translate?.home}
            </Link>
            <Link className={navbarAnchor} to="/practice">
              {translate?.practice}
            </Link>
            <Link className={navbarAnchor} to="/stats">
              {translate?.stats}
            </Link>
            <button
              className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 bg-transparent border border-red-500 rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:bg-red-500 hover:text-white active:scale-95"
              onClick={handleSignOutChange}
            >
              {translate?.signOut}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </nav>
        </header>
        <main className="flex flex-col min-h-screen">
          <Routes>
            <Route
              path="/"
              element={<HomePage statistics={stats} translate={translate} />}
            />
            <Route path="/auth" element={<AuthPage translate={translate} />} />
            <Route
              path="/practice"
              element={<PracticePage translate={translate} />}
            />
            <Route
              path="/stats"
              element={<StatsPage translate={translate} />}
            />
            <Route
              path="/practice/vocabulary"
              element={<VocabularyPage translate={translate} />}
            />
            <Route
              path="/practice/driving"
              element={<DrivingPage translate={translate} language={lang} />}
            />
            <Route
              path="/practice/sentence-completion"
              element={
                <SentenceCompletionPage translate={translate} language={lang} />
              }
            />
          </Routes>
        </main>

        <footer className="bg-[#e4eaf1] text-center p-[0.8rem] text-[0.9rem]">
          <p>© 2026 {translate.allRightsReserved}</p>
        </footer>
      </div>
    );
  }
}
