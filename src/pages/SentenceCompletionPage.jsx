import SentenceCompletion from "../components/SentenceCompletion";

function SentenceCompletionPage({ translate, language }) {
  return (
    <div className="w-full flex flex-col gap-10 animate-slide-up pb-10 px-4 md:px-0">
      <div className="glass-card p-8 text-center border-brand-200 dark:border-brand-900/50">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 m-0">
          השלמת משפטים
        </h1>
      </div>
      <SentenceCompletion translate={translate} language={language} />
    </div>
  );
}
export default SentenceCompletionPage;
