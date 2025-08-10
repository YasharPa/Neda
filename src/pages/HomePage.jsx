import { Link } from "react-router-dom";
import "../HomePage.css";

export default function HomePage() {
  return (
    <div className="home-container">
      <section className="stats-section">
        <h2>📊 הסטטיסטיקות שלי</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">85%</span>
            <span className="stat-label">דיוק כללי</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">12</span>
            <span className="stat-label">תרגולים הושלמו</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">3</span>
            <span className="stat-label">ימים רצופים</span>
          </div>
        </div>
      </section>

      <section className="topics-section">
        <h2>📚 בחר נושא ללמידה</h2>
        <div className="topics-grid">
          <Link to="/practice/driving" className="topic-card">
            🚗 נהיגה
          </Link>
          <Link to="/practice/sentences" className="topic-card">
            ✏️ השלמת משפטים
          </Link>
          <Link to="/practice/words" className="topic-card">
            📖 לימוד מילים
          </Link>
        </div>
      </section>
    </div>
  );
}
