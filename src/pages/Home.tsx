
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

export default function Home() {
  const { stats, loading } = useDashboard();

  if (loading) {
    return <div className="flex justify-center py-12">Loading dashboard...</div>;
  }

  const progressPercentage =
    stats.reviewsDue + stats.reviewsCompletedToday === 0
      ? 0
      : Math.round((stats.reviewsCompletedToday / (stats.reviewsDue + stats.reviewsCompletedToday)) * 100);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="mt-2 text-gray-600">You're making great progress. Keep it up!</p>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Today's Progress</span>
            <span className="text-sm font-medium text-blue-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Day Streak</p>
            <p className="text-2xl font-bold text-gray-900">{stats.streakDays}</p>
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

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/review"
          className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold mb-2">Start Review Session</h3>
              <p className="text-blue-100 text-sm mb-4">
                {stats.reviewsDue} words waiting for review today.
              </p>
              <span className="inline-flex items-center text-sm font-medium bg-white/20 px-3 py-1 rounded-full group-hover:bg-white/30 transition-colors">
                Start Now &rarr;
              </span>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-200" />
          </div>
        </Link>

        <Link
          to="/listening"
          className="group bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold mb-2">Daily Listening</h3>
              <p className="text-indigo-100 text-sm mb-4">
                Practice with today's featured audio clip.
              </p>
              <span className="inline-flex items-center text-sm font-medium bg-white/20 px-3 py-1 rounded-full group-hover:bg-white/30 transition-colors">
                Listen Now &rarr;
              </span>
            </div>
            <Clock className="w-8 h-8 text-indigo-200" />
          </div>
        </Link>
      </div>
    </div>
  );
}
