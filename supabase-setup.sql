-- Portfolio Likes Table Setup with Authentication
-- Run this in your Supabase SQL Editor

-- Create the likes table with user tracking
CREATE TABLE IF NOT EXISTS gh_portfolio_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, username, repo_name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_portfolio_likes_user_id 
ON gh_portfolio_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_likes_user_repo 
ON gh_portfolio_likes(username, repo_name);

-- Enable Row Level Security
ALTER TABLE gh_portfolio_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read likes
CREATE POLICY "Allow public read access" 
ON gh_portfolio_likes FOR SELECT 
USING (true);

-- Policy: Allow authenticated users to insert their own likes
CREATE POLICY "Allow authenticated insert" 
ON gh_portfolio_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to delete their own likes
CREATE POLICY "Allow users to delete own likes" 
ON gh_portfolio_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Create a view to get like counts per repo
CREATE OR REPLACE VIEW gh_portfolio_like_counts AS
SELECT 
  username,
  repo_name,
  COUNT(*) as like_count
FROM gh_portfolio_likes
GROUP BY username, repo_name;

-- Grant access to the view
GRANT SELECT ON gh_portfolio_like_counts TO anon, authenticated;

