import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Emotion = {
  id: string;
  user_id: string;
  emotion_date: string;
  emotion_type: 'happy' | 'sad' | 'excited' | 'anxious' | 'calm' | 'angry' | 'loved' | 'tired';
  note: string;
  created_at: string;
  updated_at: string;
};

export type Friendship = {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
};
