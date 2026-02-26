
import { PlayCircle, FileText, CheckCircle } from 'lucide-react';
import { useListening } from '../hooks/useListening';

export default function Listening() {
  const { resource, loading } = useListening();

  if (loading) {
    return <div className="flex justify-center py-12">Loading listening exercise...</div>;
  }

  if (!resource) {
    return <div>No listening resource available today.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{resource.title}</h1>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>{resource.duration}</span>
              <span>•</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium uppercase tracking-wide">
                {resource.level}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-6">{resource.description}</p>

        {/* Video Player */}
        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg mb-8">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${resource.videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Exercises / Transcript Placeholder */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Transcript & Exercises</h3>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200 border-dashed">
            <p className="text-gray-500 mb-4">
              Transcript and interactive exercises would appear here.
              Listen to the video carefully and try to summarize it!
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
