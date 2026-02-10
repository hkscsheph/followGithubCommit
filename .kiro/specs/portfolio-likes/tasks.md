# Portfolio Likes Feature - Tasks

## 1. Setup Supabase
- [ ] 1.1 Create Supabase project (manual)
- [ ] 1.2 Create `gh_portfolio_likes` table with schema
- [ ] 1.3 Set up Row Level Security (RLS) policies
- [ ] 1.4 Create indexes for performance
- [x] 1.5 Add Supabase environment variables to `.env.example`

## 2. Add Supabase Client to repos.html
- [x] 2.1 Add Supabase JS CDN script tag
- [x] 2.2 Initialize Supabase client with config
- [x] 2.3 Create LikeService class
- [x] 2.4 Create LikeStorage class for localStorage

## 3. Implement Like Service
- [x] 3.1 Implement `fetchLikes(username)` method
- [x] 3.2 Implement `incrementLike(username, repoName)` method
- [x] 3.3 Implement `decrementLike(username, repoName)` method
- [x] 3.4 Add error handling and retry logic

## 4. Update UI - Add Like Button
- [x] 4.1 Add CSS styles for like button
- [x] 4.2 Create `renderLikeButton()` function
- [x] 4.3 Add like button HTML to each card
- [x] 4.4 Add heart icon (SVG or emoji)

## 5. Implement Like Interactions
- [x] 5.1 Add click event handler for like button
- [x] 5.2 Implement optimistic UI updates
- [x] 5.3 Update localStorage on like/unlike
- [x] 5.4 Add visual feedback (animation, color change)

## 6. Integrate with Page Load
- [x] 6.1 Fetch like counts on page load
- [x] 6.2 Restore liked state from localStorage
- [x] 6.3 Update cards with like data
- [x] 6.4 Handle loading states

## 7. Error Handling & Polish
- [ ] 7.1 Add error toast notifications
- [ ] 7.2 Handle network errors gracefully
- [ ] 7.3 Add loading spinner for like operations
- [ ] 7.4 Test all edge cases

## 8. Documentation
- [ ] 8.1 Update README with Supabase setup instructions
- [x] 8.2 Document environment variables
- [x] 8.3 Add SQL schema to documentation
