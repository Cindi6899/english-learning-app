import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface Vocabulary {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  example_sentence: string;
  mastery_level: 'new' | 'learning' | 'mastered';
  created_at: string;
}

export function useNotebook() {
  const { user } = useAuthStore();
  const [words, setWords] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWords();
    } else {
      fetchGuestWords();
    }
  }, [user]);

  async function fetchWords() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vocabularies')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWords(data || []);
    } catch (error) {
      console.error('Error fetching notebook:', error);
    } finally {
      setLoading(false);
    }
  }

  function fetchGuestWords() {
    try {
      setLoading(true);
      const stored = localStorage.getItem('guest_vocabularies');
      if (stored) {
        // Sort by created_at desc
        const parsed: Vocabulary[] = JSON.parse(stored);
        parsed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setWords(parsed);
      } else {
        setWords([]);
      }
    } catch (error) {
      console.error('Error fetching guest notebook:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteWord(id: string) {
    try {
      if (user) {
        const { error } = await supabase
          .from('vocabularies')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } else {
        // Guest mode
        const stored = localStorage.getItem('guest_vocabularies');
        if (stored) {
          const parsed: Vocabulary[] = JSON.parse(stored);
          const updated = parsed.filter(w => w.id !== id);
          localStorage.setItem('guest_vocabularies', JSON.stringify(updated));
          
          // Also remove from guest_reviews
          const storedReviews = localStorage.getItem('guest_reviews');
          if (storedReviews) {
            const parsedReviews: any[] = JSON.parse(storedReviews);
            const updatedReviews = parsedReviews.filter(r => r.vocabulary_id !== id);
            localStorage.setItem('guest_reviews', JSON.stringify(updatedReviews));
          }
        }
      }
      setWords(words.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting word:', error);
      alert('Failed to delete word');
    }
  }

  return { words, loading, deleteWord };
}
