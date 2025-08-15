import TopicCard from "../components/TopicCard";
import "../styles/PracticePage.css";

export default function PracticePage({ translate }) {
  const topics = [
    {
      title: `📄 ${translate.topics.byTopic.title}`,
      description: `${translate.topics.byTopic.description}`,
      link: "/practice/driving",
    },
    {
      title: `✏️ ${translate.topics.sentenceCompletion.title}`,
      description: `${translate.topics.sentenceCompletion.description}`,
      link: "/practice/sentence-completion",
    },
    {
      title: `🖋 ${translate.topics.spelling.title}`,
      description: `${translate.topics.spelling.description}`,
      link: "/practice/spelling",
    },
    {
      title: `📚 ${translate.topics.vocabulary.title}`,
      description: `${translate.topics.vocabulary.description}`,
      link: "/practice/vocabulary",
    },
  ];

  return (
    <div className="practice-page">
      <h1>{translate?.choosePracticeType}</h1>
      <div className="topics-grid">
        {topics.map((topic, index) => (
          <TopicCard key={index} {...topic} />
        ))}
      </div>
    </div>
  );
}
