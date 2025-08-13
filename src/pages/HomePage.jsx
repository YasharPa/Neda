import { Link } from "react-router-dom";
import "../styles/HomePage.css";
import StatCard from "../components/StatCard";

export default function HomePage({ translate }) {
  const stats = [
    {
      title: translate.statistics.totalPracticeSessions,
      value: 0,
      icon: "📝",
    },
    {
      title: translate.statistics.totalWordsLearned,
      value: 0,
      icon: "📚",
    },
    {
      title: translate.statistics.completedSentences,
      value: 0,
      icon: "✅",
    },
  ];

  return (
    <div className="home-container">
      <section className="stats-section">
        <div className="stats-row">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </section>

      <section className="topics-section">
        <h2>📚 {translate.chooseSubject}</h2>
        <div className="topics-grid">
          <Link to="/practice/driving" className="topic-card">
            🚗 {translate.topics.driving.title}
          </Link>
          <Link to="/practice/sentences" className="topic-card">
            ✏️ {translate.topics.sentenceCompletion.title}
          </Link>
          <Link to="/practice/vocabulary" className="topic-card">
            📖 {translate.topics.vocabulary.title}
          </Link>
        </div>
      </section>
    </div>
  );
}
