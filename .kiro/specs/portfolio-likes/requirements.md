# Portfolio Likes Feature - Requirements

## Overview
Add a like button to each portfolio card that allows users to like student projects. Likes are stored in Supabase and displayed on each card.

## User Stories

### 1. As a visitor, I want to like a project
- I can click a like button on any portfolio card
- The like count increases immediately
- My like is persisted to Supabase
- I can see the total number of likes for each project

### 2. As a visitor, I want to unlike a project
- I can click the like button again to unlike
- The like count decreases immediately
- My unlike is persisted to Supabase

### 3. As a visitor, I want to see like counts
- Each card displays the current number of likes
- Like counts are loaded from Supabase on page load
- Like counts update in real-time when I interact

## Acceptance Criteria

### 1.1 Like Button Display
- Each portfolio card has a visible like button (heart icon)
- The button shows the current like count next to it
- The button is styled to match the existing dark theme
- The button is positioned prominently on the card

### 1.2 Like Interaction
- Clicking the like button increments the count
- Clicking again decrements the count (unlike)
- The button provides visual feedback (color change, animation)
- Liked state is tracked per browser (localStorage)

### 1.3 Supabase Integration
- Likes are stored in a table named `gh_portfolio_likes`
- Table schema: `id`, `username`, `repo_name`, `like_count`, `created_at`, `updated_at`
- Each project has a unique record identified by `username` + `repo_name`
- Like counts are fetched on page load
- Like/unlike operations update the database

### 1.4 Error Handling
- If Supabase is unavailable, show error message
- Likes still work locally but don't persist
- Retry failed operations automatically

### 1.5 Performance
- Like counts are cached locally for 5 minutes
- Optimistic UI updates (instant feedback)
- Batch operations when possible

## Technical Requirements

### Database Schema
```sql
CREATE TABLE gh_portfolio_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(username, repo_name)
);

CREATE INDEX idx_portfolio_likes_user_repo ON gh_portfolio_likes(username, repo_name);
```

### Environment Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

### API Operations
1. **Fetch likes**: GET all like counts for a user's repos
2. **Increment like**: UPDATE like_count + 1 for a specific repo
3. **Decrement like**: UPDATE like_count - 1 for a specific repo

## Out of Scope
- User authentication (anonymous likes only)
- Like history/analytics
- Rate limiting (handled by Supabase)
- Real-time updates across browsers (future enhancement)

## Dependencies
- Supabase JavaScript client library
- LocalStorage for tracking user's liked projects
