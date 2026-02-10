# Portfolio Likes Feature - Design

## Architecture

### Components
1. **Like Button Component** - UI element on each card
2. **Supabase Client** - Database connection and operations
3. **Local Storage Manager** - Track user's liked projects
4. **Like Service** - Business logic for like operations

## Implementation Plan

### 1. Supabase Setup
- Add Supabase JS client via CDN
- Configure connection with environment variables
- Create database table and indexes

### 2. UI Changes (repos.html)
- Add like button HTML to each card
- Style like button with heart icon
- Add click event handlers
- Display like count

### 3. Like Service
- Initialize Supabase client
- Fetch like counts for all repos
- Increment/decrement like operations
- Handle errors gracefully

### 4. Local Storage
- Track which repos the user has liked
- Key format: `liked_${username}_${repoName}`
- Restore liked state on page load

## Data Flow

### Page Load
1. Load portfolio data from JSON
2. Fetch like counts from Supabase for all repos
3. Restore liked state from localStorage
4. Render cards with like buttons

### Like Action
1. User clicks like button
2. Update UI immediately (optimistic)
3. Update localStorage
4. Send request to Supabase
5. Handle success/error

### Unlike Action
1. User clicks liked button
2. Update UI immediately (optimistic)
3. Update localStorage
4. Send request to Supabase
5. Handle success/error

## Code Structure

```javascript
// Supabase client initialization
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Like service
class LikeService {
  async fetchLikes(username) { }
  async incrementLike(username, repoName) { }
  async decrementLike(username, repoName) { }
}

// Local storage manager
class LikeStorage {
  isLiked(username, repoName) { }
  setLiked(username, repoName, liked) { }
}

// UI updates
function renderLikeButton(username, repoName, likeCount, isLiked) { }
function handleLikeClick(username, repoName) { }
```

## Styling

### Like Button States
- **Default**: Gray heart outline, gray text
- **Hover**: Lighter gray, scale up slightly
- **Liked**: Red filled heart, red text
- **Loading**: Disabled, opacity reduced

### CSS Variables
```css
--like-color: #8b949e;
--like-color-active: #da3633;
--like-color-hover: #c9d1d9;
```

## Error Handling

### Network Errors
- Show toast notification
- Keep local state
- Retry on next interaction

### Database Errors
- Log to console
- Show user-friendly message
- Fallback to local-only mode

## Performance Optimizations

1. **Batch Fetching**: Fetch all like counts in one query
2. **Caching**: Cache like counts for 5 minutes
3. **Debouncing**: Prevent rapid like/unlike spam
4. **Optimistic Updates**: Update UI before server response

## Security Considerations

1. **Anonymous Access**: Use Supabase anon key with RLS policies
2. **Rate Limiting**: Rely on Supabase built-in rate limiting
3. **Input Validation**: Validate username and repo_name format
4. **SQL Injection**: Use parameterized queries (Supabase handles this)

## Testing Strategy

### Manual Testing
1. Like a project - verify count increases
2. Unlike a project - verify count decreases
3. Refresh page - verify liked state persists
4. Clear localStorage - verify liked state resets
5. Disconnect network - verify error handling

### Edge Cases
- Multiple rapid clicks
- Network timeout
- Invalid repo names
- Empty like counts
