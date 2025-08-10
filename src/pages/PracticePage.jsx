import TopicCard from "../components/TopicCard";
import "../styles/PracticePage.css";

export default function PracticePage() {
  const topics = [
    {
      title: "📄 למידה לפי נושא",
      description: "בחר נושא (נהיגה, בישול וכו'..)",
      link: "/practice/driving",
    },
    {
      title: "✏️ השלמת משפטים",
      description: "השלם את המילה החסרה במשפט",
      link: "/practice/sentence-completion",
    },
    {
      title: "🖋 כתיבה נכונה",
      description: "תרגל כתיבה נכונה של מילים בעברית",
      link: "/practice/spelling",
    },
    {
      title: "📚 למידת מילים",
      description: "למד מילים חדשות והרחב את אוצר המילים שלך",
      link: "/practice/vocabulary",
    },
  ];

  return (
    <div className="practice-page">
      <h1>בחר סוג תרגול</h1>
      <div className="topics-grid">
        {topics.map((topic, index) => (
          <TopicCard key={index} {...topic} />
        ))}
      </div>
    </div>
  );
}
