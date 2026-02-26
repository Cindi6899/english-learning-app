
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

export default function Home() {
  const { stats, loading } = useDashboard();

  if (loading) {
    return <div className="flex justify-center py-12">Loading dashboard...</div>;
  }

  const totalReviews = stats.reviewsDue + stats.reviewsCompletedToday;
  const completedReviews = stats.reviewsCompletedToday;
  const progressText = totalReviews === 0 ? '0/0' : `${completedReviews}/${totalReviews}`;
  const progressPercentage = totalReviews === 0 ? 0 : Math.round((completedReviews / totalReviews) * 100);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Daily Review</h1>
        <p className="mt-2 text-gray-600">You're making great progress. Keep it up!</p>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Today's Progress</span>
            <span className="text-sm font-medium text-blue-600">{progressText}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="mt-6 flex justify-start">
            <Link
              to="/review"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              Start Review Session
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Words</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalVocabulary}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 rounded-full text-orange-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">To Review</p>
            <p className="text-2xl font-bold text-gray-900">{stats.reviewsDue}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
