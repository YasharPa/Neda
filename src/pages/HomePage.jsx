import { Link } from "react-router-dom";
import "../styles/HomePage.css";
import StatsCard from "../components/StatCard";

export default function HomePage({ translate }) {
  const stats = [
    { title: translate.statistics.totalPracticeSessions, value: 12 },
    { title: translate.statistics.totalWordsLearned, value: 34 },
    { title: translate.statistics.completedSentences, value: 8 },
  ];

  return (
    <div className="home-container">
      <section className="stats-section">
        <div className="stats-row">
          {stats.map((stat, i) => (
            <StatsCard key={i} {...stat} />
          ))}
        </div>
      </section>

      <section className="topics-section">
        <h2>📚 {translate.chooseSubject}</h2>
        <div className="topics-grid">
          <Link to="/practice/driving" className="topic-card">
            🚗 {translate.topics.driving}
          </Link>
          <Link to="/practice/sentences" className="topic-card">
            ✏️ {translate.topics.sentences}
          </Link>
          <Link to="/practice/vocabulary" className="topic-card">
            📖 {translate.topics.words}
          </Link>
        </div>
      </section>
    </div>
  );
}
