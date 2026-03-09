# Supabase Setup Guide

This guide covers setting up Supabase for **Google OAuth Authentication** and **Portfolio Likes** features.

---

## Part 1: Google OAuth Setup

### Prerequisites
- A Supabase account (free tier works fine)
- A Google Cloud project with OAuth 2.0 credentials
- Access to your Supabase project dashboard

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   ```
   https://wnvgjuhxxwnihmjfrcvk.supabase.co/auth/v1/callback
   http://localhost:8080/auth/v1/callback
   ```
7. Copy your **Client ID** and **Client Secret**

### Step 2: Enable Google Provider in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** provider
3. Click to enable it
4. Paste your **Client ID** and **Client Secret** from Google Cloud
5. Save changes

### Step 3: Configure Site URL and Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain:
   ```
   https://your-portfolio-site.netlify.app
   ```
   For local development, use:
   ```
   http://localhost:8080
   ```
3. Add **Redirect URLs** (whitelist):
   ```
   https://your-portfolio-site.netlify.app/index.html
   http://localhost:8080/index.html
   ```

### Step 4: Configure Session Settings

1. Go to **Authentication** → **Settings**
2. Configure session timeout:
   - **JWT expiry**: 604800 seconds (7 days) - recommended
   - **Refresh token expiry**: 2592000 seconds (30 days)
3. Save changes

### Step 5: Test Authentication Flow

1. Open your portfolio website at `login.html`
2. Click **使用 Google 登入** (Sign in with Google)
3. You'll be redirected to Google's login page
4. Sign in with your Google account
5. You should be redirected back to `index.html`
6. Verify you see your email and a "登出" (Sign Out) button in the header
7. Try accessing `index.html` or `repos.html` directly - you should remain logged in

### Troubleshooting Google OAuth

**"Redirect URI mismatch" error:**
- Verify the redirect URI in Google Cloud Console matches exactly
- Make sure you've added both the production and local development URIs
- Check that the Supabase redirect URLs are configured correctly

**Redirect not working:**
- Verify redirect URLs are whitelisted in URL Configuration
- Check browser console for errors
- Ensure Site URL matches your domain

**Session expires too quickly:**
- Increase JWT expiry in Authentication Settings
- Check browser is not blocking cookies

**Google login button doesn't work:**
- Make sure Google provider is enabled in Supabase
- Verify Client ID and Client Secret are correct
- Check browser console for error messages

---

## Part 2: Portfolio Likes Setup

## Prerequisites
- A Supabase account (free tier works fine)
- Access to your Supabase project dashboard

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: Portfolio Likes (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project" and wait for it to initialize (~2 minutes)

## Step 2: Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-setup.sql` file
4. Click "Run" to execute the SQL
5. Verify the table was created by going to **Table Editor** → you should see `gh_portfolio_likes`

## Step 3: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Find these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`
3. Copy both values

## Step 4: Configure Your Application

1. Open `repos.html` in your code editor
2. Find these lines near the top of the `<script>` section:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```
3. Replace with your actual values:
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co'; // Your Project URL
   const SUPABASE_ANON_KEY = 'eyJhbGc...'; // Your anon public key
   ```

## Step 5: Test the Integration

1. Open your portfolio website
2. Navigate to any student's portfolio page
3. You should see like buttons (🤍) on each project card
4. Click a like button - it should turn red (❤️) and increment the count
5. Refresh the page - your like should persist
6. Check your Supabase dashboard → **Table Editor** → `gh_portfolio_likes` to see the data

## Troubleshooting

### Likes don't persist after refresh
- Check browser console for errors
- Verify your Supabase URL and anon key are correct
- Make sure Row Level Security policies are enabled (they should be from the SQL script)

### "Failed to fetch" errors
- Check your internet connection
- Verify the Supabase project is active (not paused)
- Check if you're hitting rate limits (unlikely on free tier)

### Likes work but don't show correct counts
- Clear your browser's localStorage: `localStorage.clear()`
- Check the database directly in Supabase Table Editor
- Verify the SQL script ran successfully

## Security Notes

- The anon key is safe to expose in client-side code
- Row Level Security (RLS) policies protect your data
- The current setup allows anonymous likes (no authentication required)
- Rate limiting is handled automatically by Supabase

## Optional: Add Database Function for Atomic Increments

For better performance, you can add this function to your database:

```sql
CREATE OR REPLACE FUNCTION increment_like(p_username TEXT, p_repo_name TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO gh_portfolio_likes (username, repo_name, like_count)
  VALUES (p_username, p_repo_name, 1)
  ON CONFLICT (username, repo_name)
  DO UPDATE SET like_count = gh_portfolio_likes.like_count + 1;
END;
$$ LANGUAGE plpgsql;
```

This makes like increments atomic and prevents race conditions.

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase project is active
3. Review the SQL script execution logs in Supabase
4. Check Supabase documentation: https://supabase.com/docs
