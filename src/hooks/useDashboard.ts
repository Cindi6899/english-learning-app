
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { startOfDay, endOfDay } from 'date-fns';

interface DashboardStats {
  totalVocabulary: number;
  reviewsDue: number;
  reviewsCompletedToday: number;
  streakDays: number; // Placeholder for now
}

export function useDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalVocabulary: 0,
    reviewsDue: 0,
    reviewsCompletedToday: 0,
    streakDays: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      try {
        // 1. Total Vocabulary
        const { count: totalVocabulary } = await supabase
          .from('vocabularies')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // 2. Reviews Due (today or overdue)
        const todayStr = new Date().toISOString();
        const { count: reviewsDue } = await supabase
          .from('review_schedules')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .lte('review_date', todayStr)
          .eq('completed', false);

        // 3. Reviews Completed Today
        const start = startOfDay(new Date()).toISOString();
        const end = endOfDay(new Date()).toISOString();
        const { count: reviewsCompletedToday } = await supabase
          .from('review_schedules')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('completed_at', start)
          .lte('completed_at', end)
          .eq('completed', true);

        setStats({
          totalVocabulary: totalVocabulary || 0,
          reviewsDue: reviewsDue || 0,
          reviewsCompletedToday: reviewsCompletedToday || 0,
          streakDays: 1, // Mock value for now
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  return { stats, loading };
}
