
import { Trash2, Volume2 } from 'lucide-react';
import { useNotebook, Vocabulary } from '../hooks/useNotebook';

export default function Notebook() {
  const { words, loading, deleteWord } = useNotebook();

  if (loading) {
    return <div className="flex justify-center py-12">Loading notebook...</div>;
  }

  const getLevelColor = (level: Vocabulary['mastery_level']) => {
    switch (level) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'learning':
        return 'bg-yellow-100 text-yellow-800';
      case 'mastered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to process definition text
  const renderDefinition = (text: string, translation: string) => {
    // If text contains JSON-like structure or specific delimiters from our previous Search logic, parse it
    // For now, assuming simple text. If it's a long definition, we truncate it.
    // If text is same as translation (e.g. fallback case), don't show it to avoid duplication
    if (text === translation) return null;

    return (
      <div className="text-sm text-gray-700 mt-3 space-y-1">
         {/* Using line-clamp-2 to reduce height as requested "不要展示这么长" */}
         <p className="line-clamp-2 leading-relaxed">
           {text}
         </p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Notebook</h1>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{words.length} words</span>
      </div>

      {words.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">Your notebook is empty.</p>
          <p className="text-gray-400 text-sm mt-2">Go to Search to add your first word!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {words.map((word) => (
            <div key={word.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group relative">
              
              {/* Header: Word & Pronunciation */}
              <div className="mb-2">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{word.word}</h3>
                {word.pronunciation && (
                  <span className="text-gray-500 font-normal text-base mt-1 block font-mono">{word.pronunciation}</span>
                )}
              </div>

              {/* Part of speech & Translation */}
              <div className="flex items-baseline gap-3 mb-3">
                <span className="italic text-gray-500 font-medium">noun</span> 
                {/* Note: 'noun' is hardcoded for demo style match, ideally should come from DB if stored */}
                <span className="text-base font-medium text-gray-900">{word.translation}</span>
              </div>

              {/* Definition / Example */}
              {word.example_sentence && renderDefinition(word.example_sentence, word.translation)}

              {/* Mastery Level Badge (Optional, kept for functionality but styled minimally) */}
              <div className="absolute top-6 right-6">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getLevelColor(word.mastery_level)} bg-opacity-50`}>
                  {word.mastery_level}
                </span>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this word?')) deleteWord(word.id);
                }}
                className="absolute bottom-6 right-6 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                title="Delete word"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
