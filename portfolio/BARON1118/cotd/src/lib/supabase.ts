import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  avatar_url: string;
  created_at: string;
};

export type CarPost = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  photo_url: string;
  post_date: string;
  created_at: string;
  profiles?: Profile;
};

export type Friend = {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
};
