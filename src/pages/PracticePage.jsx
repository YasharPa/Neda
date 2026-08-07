import TopicCard from "../components/TopicCard";

export default function PracticePage({ translate }) {
  const topics = [
    {
      title: `${translate.topics.byTopic.title}`,
      description: `${translate.topics.byTopic.description}`,
      link: "/practice/driving",
    },
    {
      title: `${translate.topics.sentenceCompletion.title}`,
      description: `${translate.topics.sentenceCompletion.description}`,
      link: "/practice/sentence-completion",
    },
    {
      title: `${translate.topics.spelling.title}`,
      description: `${translate.topics.spelling.description}`,
      link: "/practice/spelling",
    },
    {
      title: `${translate.topics.vocabulary.title}`,
      description: `${translate.topics.vocabulary.description}`,
      link: "/practice/vocabulary",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-10 animate-slide-up pb-10 px-4 md:px-0">
      <div className="glass-card p-8 text-center border-brand-200 dark:border-brand-900/50">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 m-0">
          {translate?.choosePracticeType}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topics.map((topic, index) => (
          <TopicCard key={index} {...topic} />
        ))}
      </div>
    </div>
  );
}
