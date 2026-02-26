
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Vocabulary } from './useNotebook';

interface ReviewItem {
  id: string; // schedule id
  review_stage: number;
  vocabulary: Vocabulary;
}

export function useReview() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchReviews();
  }, [user]);

  async function fetchReviews() {
    try {
      setLoading(true);
      const todayStr = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('review_schedules')
        .select(`
          id,
          review_stage,
          vocabulary:vocabularies (*)
        `)
        .eq('user_id', user!.id)
        .lte('review_date', todayStr)
        .eq('completed', false)
        .order('review_date', { ascending: true });

      if (error) throw error;
      
      // Transform data to match ReviewItem interface (Supabase returns arrays/objects differently based on join)
      // @ts-ignore
      const formattedReviews: ReviewItem[] = (data || []).map(item => ({
        id: item.id,
        review_stage: item.review_stage,
        vocabulary: item.vocabulary,
      }));

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }

  async function submitReview(success: boolean) {
    const currentReview = reviews[currentIndex];
    if (!currentReview) return;

    try {
      const { error } = await supabase.rpc('handle_review_update', {
        p_schedule_id: currentReview.id,
        p_success: success,
      });

      if (error) throw error;

      // Move to next card
      if (currentIndex < reviews.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Finished all loaded reviews
        setReviews([]); // Or fetch more/show completion screen
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  }

  return {
    reviews,
    loading,
    currentIndex,
    currentReview: reviews[currentIndex],
    totalReviews: reviews.length,
    submitReview,
  };
}
