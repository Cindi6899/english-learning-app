
import { useState, useEffect } from 'react';

interface ListeningResource {
  id: string;
  title: string;
  description: string;
  videoId: string; // YouTube ID
  level: 'Easy' | 'Medium' | 'Hard';
  duration: string;
}

const RESOURCES: ListeningResource[] = [
  {
    id: '1',
    title: '6 Minute English: The benefits of boredom',
    description: 'Rob and Sam discuss how being bored can actually be good for you.',
    videoId: 'z2kZ0j6p5-g',
    level: 'Medium',
    duration: '6:00',
  },
  {
    id: '2',
    title: 'TED: Try something new for 30 days',
    description: 'Matt Cutts suggests that you try something new for 30 days.',
    videoId: 'UNP03fDSj1U', // Replaced with a more reliable ID
    level: 'Easy',
    duration: '3:27',
  },
  {
    id: '3',
    title: 'BBC Learning English: How to make small talk',
    description: 'Learn useful phrases for making small talk in English.',
    videoId: 'tT8jA_sK9-A', // Trying another ID for the same topic
    level: 'Easy',
    duration: '5:00',
  },
];

export function useListening() {
  const [resource, setResource] = useState<ListeningResource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching daily resource
    // In a real app, this would fetch from Supabase based on user progress or date
    const today = new Date().getDate();
    const index = today % RESOURCES.length;
    
    setTimeout(() => {
      setResource(RESOURCES[index]);
      setLoading(false);
    }, 500);
  }, []);

  return { resource, loading };
}
