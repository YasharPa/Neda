import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PracticePage from "./pages/PracticePage";
import StatsPage from "./pages/StatsPage";
import "./App.css";

export default function App() {
  const handleLanguageChange = () => {
    alert("שינוי שפה יגיע בהמשך 😉");
  };

  return (
    <div className="app-container">
      <button className="lang-button" onClick={handleLanguageChange}>
        🌐 שפה
      </button>

      <header className="app-header">
        <h1>💙 ברוכים הבאים</h1>
        <nav className="app-nav">
          <Link to="/">בית</Link>
          <Link to="/practice">תרגול</Link>
          <Link to="/stats">סטטיסטיקות</Link>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>© 2025 כל הזכויות שמורות</p>
      </footer>
    </div>
  );
}
