import SentenceCompletion from "../components/SentenceCompletion";

function SentenceCompletionPage({ translate, language }) {
  return (
    <div>
      <h2>השלמת משפטים</h2>
      <SentenceCompletion translate={translate} language={language} />
    </div>
  );
}
export default SentenceCompletionPage;
