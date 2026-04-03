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

  if (!user) {
    return <AuthPage translate={translate} />;
  } else {
    return (
      <div className="app-container">
        <button className="lang-button" onClick={handleLanguageChange}>
          🌐 {lang === "he" ? "עברית" : "فارسی"}
        </button>
        <header className="app-header">
          <h1>{translate?.welcome} 💙</h1>
          <nav className="app-nav">
            <Link to="/">{translate?.home}</Link>
            <Link to="/practice">{translate?.practice}</Link>
            <Link to="/stats">{translate?.stats}</Link>
            <button className="logout-button" onClick={handleSignOutChange}>
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
        <main className="app-container">
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

        <footer className="app-footer">
          <p>© 2025 {translate.allRightsReserved}</p>
        </footer>
      </div>
    );
  }
}
