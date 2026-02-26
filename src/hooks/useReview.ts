import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Vocabulary } from './useNotebook';
import { addDays } from 'date-fns';

interface ReviewItem {
  id: string; // schedule id
  review_stage: number;
  vocabulary: Vocabulary;
}

interface GuestReviewSchedule {
  id: string;
  vocabulary_id: string;
  review_date: string;
  review_stage: number;
  completed: boolean;
}

export function useReview() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (user) {
      fetchReviews();
    } else {
      fetchGuestReviews();
    }
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
      
      // Transform data to match ReviewItem interface
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

  function fetchGuestReviews() {
    try {
      setLoading(true);
      const today = new Date();
      const storedReviews = localStorage.getItem('guest_reviews');
      const storedVocabs = localStorage.getItem('guest_vocabularies');
      
      if (!storedReviews || !storedVocabs) {
        setReviews([]);
        return;
      }

      const schedules: GuestReviewSchedule[] = JSON.parse(storedReviews);
      const vocabularies: Vocabulary[] = JSON.parse(storedVocabs);
      const vocabMap = new Map(vocabularies.map(v => [v.id, v]));

      const dueReviews = schedules
        .filter(s => !s.completed && new Date(s.review_date) <= today)
        .map(s => {
          const vocab = vocabMap.get(s.vocabulary_id);
          if (!vocab) return null;
          return {
            id: s.id,
            review_stage: s.review_stage,
            vocabulary: vocab,
          };
        })
        .filter((item): item is ReviewItem => item !== null)
        .sort((a, b) => {
           // Find original schedule to sort by date
           const scheduleA = schedules.find(s => s.id === a.id);
           const scheduleB = schedules.find(s => s.id === b.id);
           if (!scheduleA || !scheduleB) return 0;
           return new Date(scheduleA.review_date).getTime() - new Date(scheduleB.review_date).getTime();
        });

      setReviews(dueReviews);
    } catch (error) {
      console.error('Error fetching guest reviews:', error);
    } finally {
      setLoading(false);
    }
  }

  async function submitReview(success: boolean) {
    const currentReview = reviews[currentIndex];
    if (!currentReview) return;

    try {
      if (user) {
        const { error } = await supabase.rpc('handle_review_update', {
          p_schedule_id: currentReview.id,
          p_success: success,
        });

        if (error) throw error;
      } else {
        // Guest mode submission
        const storedReviews = localStorage.getItem('guest_reviews');
        if (storedReviews) {
          let schedules: GuestReviewSchedule[] = JSON.parse(storedReviews);
          const scheduleIndex = schedules.findIndex(s => s.id === currentReview.id);
          
          if (scheduleIndex !== -1) {
             const schedule = schedules[scheduleIndex];
             let nextDate: Date;
             let nextStage: number;

             if (success) {
               // Simple SRS: 1, 3, 7, 14, 30, 60...
               const intervals = [1, 3, 7, 14, 30, 60, 90, 180];
               nextStage = schedule.review_stage + 1;
               const daysToAdd = intervals[Math.min(nextStage - 1, intervals.length - 1)] || 180;
               nextDate = addDays(new Date(), daysToAdd);
             } else {
               // Reset to stage 1
               nextStage = 1;
               nextDate = addDays(new Date(), 1);
             }

             // Update current schedule to completed or just update it for next time?
             // Usually we update the record for the next review.
             // But if we want to keep history, we might mark this as completed and create a new one.
             // However, for simplicity in guest mode, let's just update the existing record.
             
             schedules[scheduleIndex] = {
               ...schedule,
               review_stage: nextStage,
               review_date: nextDate.toISOString(),
               completed: false // Keep it active for next date
             };
             
             localStorage.setItem('guest_reviews', JSON.stringify(schedules));
          }
        }
      }

      // Move to next card
      if (currentIndex < reviews.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Finished all loaded reviews
        setReviews([]); 
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
