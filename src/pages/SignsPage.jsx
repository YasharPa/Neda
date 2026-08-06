import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import SignCard from "../components/SignCard";
import SignModal from "../components/SignModal";
import LoadingSpinner from "../components/LoadingSpinner";

const PAGE_SIZE = 12;

const SignsPage = ({ translate, language = "he" }) => {
  const [signs, setSigns] = useState([]);
  const [selectedSign, setSelectedSign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const pageRef = useRef(0);
  const sentinelRef = useRef(null);

  const fetchSigns = useCallback(async (pageIndex) => {
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("road_signs")
      .select("*")
      .range(from, to);

    if (error) throw error;

    if (data.length < PAGE_SIZE) setHasMore(false);

    setSigns((prev) => (pageIndex === 0 ? data : [...prev, ...data]));
  }, []);

  useEffect(() => {
    fetchSigns(0)
      .catch(() => setError("שגיאה בטעינת התמרורים"))
      .finally(() => setLoading(false));
  }, [fetchSigns]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          const nextPage = pageRef.current + 1;
          pageRef.current = nextPage;
          setLoadingMore(true);
          fetchSigns(nextPage)
            .catch(() => setError("שגיאה בטעינת תמרורים נוספים"))
            .finally(() => setLoadingMore(false));
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, fetchSigns]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    pageRef.current = 0;
    setHasMore(true);
    fetchSigns(0)
      .catch(() => setError("שגיאה בטעינת התמרורים"))
      .finally(() => setLoading(false));
  };

  if (loading) return <LoadingSpinner translate={translate} />;

  if (error) {
    return (
      <div
        dir="rtl"
        className="flex flex-col items-center justify-center gap-4 p-10 text-center"
      >
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={handleRetry}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-4 py-6">
      {/* כותרת */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">תמרורים וסימני דרך</h1>
      </div>

      {signs.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <p>לא נמצאו תמרורים</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {signs.map((sign) => (
            <SignCard
              key={sign.sign_code}
              sign={sign}
              language={language}
              onClick={setSelectedSign}
            />
          ))}
        </div>
      )}

      <div
        ref={sentinelRef}
        className="flex justify-center items-center py-8 min-h-[60px]"
      >
        {loadingMore && (
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        )}
      </div>

      {/* סוף הרשימה */}
      {!hasMore && signs.length > 0 && (
        <p className="text-center text-gray-400 text-xs pb-8">
          ✓ כל {signs.length} התמרורים נטענו
        </p>
      )}

      {/* Modal */}
      {selectedSign && (
        <SignModal
          sign={selectedSign}
          language={language}
          onClose={() => setSelectedSign(null)}
        />
      )}
    </div>
  );
};

export default SignsPage;
