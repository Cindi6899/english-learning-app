
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
    if (!user) return;

    fetchWords();
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

  async function deleteWord(id: string) {
    try {
      const { error } = await supabase
        .from('vocabularies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setWords(words.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting word:', error);
      alert('Failed to delete word');
    }
  }

  return { words, loading, deleteWord };
}
