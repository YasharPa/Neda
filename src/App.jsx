import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PracticePage from "./pages/PracticePage";
import StatsPage from "./pages/StatsPage";
import VocabularyPage from "./pages/VocabularyPage";
import DrivingPage from "./pages/DrivingPage";
import { useState } from "react";
import he from "./locales/hebrew.json";
import fa from "./locales/persian.json";
import "./App.css";

export default function App() {
  const [lang, setLang] = useState("he");
  const translate = lang === "he" ? he : fa;

  const handleLanguageChange = () => {
    setLang(lang === "he" ? "fa" : "he");
  };

  return (
    <div className="app-container">
      <button className="lang-button" onClick={handleLanguageChange}>
        🌐 {lang === "he" ? "עברית" : "فارسی"}
      </button>

      <header className="app-header">
        <h1>💙 {translate.welcome}</h1>
        <nav className="app-nav">
          <Link to="/">{translate.home}</Link>
          <Link to="/practice">{translate.practice}</Link>
          <Link to="/stats">{translate.stats}</Link>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={<HomePage translate={translate} language={lang} />}
          />
          <Route
            path="/practice"
            element={<PracticePage translate={translate} language={lang} />}
          />
          <Route
            path="/stats"
            element={<StatsPage translate={translate} language={lang} />}
          />
          <Route
            path="/practice/vocabulary"
            element={<VocabularyPage translate={translate} language={lang} />}
          />
          <Route
            path="/practice/driving"
            element={<DrivingPage translate={translate} language={lang} />}
          />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>© 2025 {translate.allRightsReserved}</p>
      </footer>
    </div>
  );
}
