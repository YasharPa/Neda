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
    <div className="p-[20px] text-center">
      <h1 className="text-center mb-8 text-[#333] text-3xl">
        {translate?.choosePracticeType}
      </h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-5">
        {topics.map((topic, index) => (
          <TopicCard key={index} {...topic} />
        ))}
      </div>
    </div>
  );
}
