# Supabase Setup Guide

This guide covers setting up Supabase for both **Email Authentication** and **Portfolio Likes** features.

---

## Part 1: Email Authentication Setup

### Prerequisites
- A Supabase account (free tier works fine)
- Access to your Supabase project dashboard

### Step 1: Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** provider
3. Enable it if not already enabled
4. Configure the following settings:
   - **Enable Email provider**: ON
   - **Confirm email**: OFF (we're using magic links, not confirmation)
   - **Secure email change**: ON (recommended)

### Step 2: Configure Site URL and Redirect URLs

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

### Step 3: Set Up Email Domain Validation

To restrict authentication to only `@creativehk.edu.hk` and `@student.creativehk.edu.hk` domains:

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query and paste this SQL:

```sql
-- Create function to validate email domain
CREATE OR REPLACE FUNCTION validate_email_domain()
RETURNS TRIGGER AS $
BEGIN
  IF NEW.email NOT LIKE '%@creativehk.edu.hk' 
     AND NEW.email NOT LIKE '%@student.creativehk.edu.hk' THEN
    RAISE EXCEPTION 'Email domain not allowed. Please use your school email.';
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run validation on user creation
DROP TRIGGER IF EXISTS check_email_domain ON auth.users;
CREATE TRIGGER check_email_domain
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION validate_email_domain();
```

3. Click **Run** to execute the SQL

### Step 4: Customize Magic Link Email Template

1. Go to **Authentication** → **Email Templates**
2. Select **Magic Link** template
3. Customize the email content (optional):
   ```html
   <h2>Sign in to Creative HK Portfolio</h2>
   <p>Click the link below to sign in to your account:</p>
   <p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
   <p>This link expires in 1 hour.</p>
   <p>If you didn't request this email, you can safely ignore it.</p>
   ```

### Step 5: Configure Session Settings

1. Go to **Authentication** → **Settings**
2. Configure session timeout:
   - **JWT expiry**: 604800 seconds (7 days) - recommended
   - **Refresh token expiry**: 2592000 seconds (30 days)
3. Save changes

### Step 6: Test Authentication Flow

1. Open your portfolio website at `login.html`
2. Enter a valid school email (e.g., `test@creativehk.edu.hk`)
3. Check your email inbox for the magic link
4. Click the magic link - you should be redirected to `index.html`
5. Verify you see your email and a "登出" (Sign Out) button in the header
6. Try accessing `index.html` or `repos.html` directly - you should be redirected to login if not authenticated

### Troubleshooting Authentication

**Magic link not received:**
- Check spam/junk folder
- Verify email provider is enabled in Supabase
- Check Supabase logs: **Authentication** → **Logs**

**"Email domain not allowed" error:**
- Verify the SQL trigger was created successfully
- Check that you're using `@creativehk.edu.hk` or `@student.creativehk.edu.hk`

**Redirect not working:**
- Verify redirect URLs are whitelisted in URL Configuration
- Check browser console for errors
- Ensure Site URL matches your domain

**Session expires too quickly:**
- Increase JWT expiry in Authentication Settings
- Check browser is not blocking cookies

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
