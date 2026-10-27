import SentenceCompletion from "../components/SentenceCompletion";

function SentenceCompletionPage({ translate, language }) {
  return (
    <div className="w-full flex flex-col gap-6 animate-slide-up pb-10">
      <div className="glass-card p-6 md:p-8 text-center border-brand-200 dark:border-brand-900/50">
        <h1 className="m-0 text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-3">
          <span className="text-brand-500">✏️</span> {translate.topics.sentenceCompletion.title}
        </h1>
        <p className="text-slate-600 dark:text-dark-muted mt-2 mb-0">
          {translate.sentenceCompletion.description}
        </p>
      </div>
      <SentenceCompletion translate={translate} language={language} />
    </div>
  );
}
export default SentenceCompletionPage;
