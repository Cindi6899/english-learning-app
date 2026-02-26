
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useReview } from '../hooks/useReview';

export default function Review() {
  const { currentReview, totalReviews, loading, submitReview } = useReview();
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <div className="flex justify-center py-12">Loading reviews...</div>;
  }

  if (!currentReview) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
        <div className="p-4 bg-green-100 rounded-full mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h2>
        <p className="text-gray-500">You have no more words to review today.</p>
      </div>
    );
  }

  const handleResult = async (success: boolean) => {
    setSubmitting(true);
    await submitReview(success);
    setShowAnswer(false);
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Review Session</span>
        <span>{totalReviews} words remaining</span>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[400px] flex flex-col relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
          <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((totalReviews - 1) / totalReviews) * 100}%` }}></div>
        </div>

        {/* Card Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-8">
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Word</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">{currentReview.vocabulary.word}</h2>
            <p className="text-gray-500 mt-2">{currentReview.vocabulary.pronunciation}</p>
          </div>

          {showAnswer ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Meaning</span>
                <p className="text-xl font-medium text-gray-800 mt-1">{currentReview.vocabulary.translation}</p>
              </div>
              
              {currentReview.vocabulary.example_sentence && (
                <div className="bg-gray-50 p-4 rounded-lg text-left">
                  <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase block mb-1">Example</span>
                  <p className="text-gray-700 italic">"{currentReview.vocabulary.example_sentence}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 italic">
              Tap "Show Answer" to see the meaning
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Show Answer
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleResult(false)}
                disabled={submitting}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                <X className="w-5 h-5" />
                Forgot
              </button>
              <button
                onClick={() => handleResult(true)}
                disabled={submitting}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
              >
                <Check className="w-5 h-5" />
                Remembered
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
