import SentenceCompletion from "../components/SentenceCompletion";

function SentenceCompletionPage({ translate }) {
  return (
    <div>
      <h2>השלמת משפטים</h2>
      <SentenceCompletion translate={translate} />
    </div>
  );
}
export default SentenceCompletionPage;
