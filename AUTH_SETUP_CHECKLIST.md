# Email Authentication Setup Checklist

Use this checklist to configure Supabase for email authentication.

## ✅ Completed (Code Implementation)
- [x] Login page created (`login.html`)
- [x] Auth guard module created (`auth-guard.js`)
- [x] `index.html` protected with auth guard
- [x] `repos.html` protected with auth guard
- [x] Sign out button and user email display implemented

## 🔧 Required: Supabase Configuration

Follow these steps in your Supabase dashboard:

### 1. Enable Email Authentication
- [ ] Go to **Authentication** → **Providers**
- [ ] Enable **Email** provider
- [ ] Turn OFF "Confirm email" (we use magic links)

### 2. Configure URLs
- [ ] Go to **Authentication** → **URL Configuration**
- [ ] Set **Site URL**: `https://your-site.netlify.app` (or your domain)
- [ ] Add **Redirect URLs**:
  - `https://your-site.netlify.app/index.html`
  - `http://localhost:8080/index.html` (for local testing)

### 3. Set Up Email Domain Validation
- [ ] Go to **SQL Editor**
- [ ] Run the SQL from `supabase-setup.sql` file
- [ ] This creates a trigger to only allow `@creativehk.edu.hk` and `@student.creativehk.edu.hk` emails

### 4. Customize Email Template (Optional)
- [ ] Go to **Authentication** → **Email Templates**
- [ ] Select **Magic Link** template
- [ ] Customize the email content if desired

### 5. Configure Session Settings
- [ ] Go to **Authentication** → **Settings**
- [ ] Set **JWT expiry**: 604800 seconds (7 days)
- [ ] Set **Refresh token expiry**: 2592000 seconds (30 days)

## 🧪 Testing

After completing the Supabase configuration:

1. [ ] Open `login.html` in your browser
2. [ ] Enter a valid school email (e.g., `yourname@creativehk.edu.hk`)
3. [ ] Check your email for the magic link
4. [ ] Click the magic link
5. [ ] Verify you're redirected to `index.html`
6. [ ] Verify you see your email and "登出" button in the header
7. [ ] Try signing out - should redirect to login
8. [ ] Try accessing `index.html` without auth - should redirect to login
9. [ ] Test with invalid email domain - should show error

## 📚 Documentation

For detailed instructions, see:
- `SUPABASE_SETUP.md` - Complete setup guide
- `.kiro/specs/email-auth/design.md` - Technical design document
- `.kiro/specs/email-auth/requirements.md` - Requirements and acceptance criteria

## 🆘 Troubleshooting

**Magic link not received?**
- Check spam/junk folder
- Verify email provider is enabled
- Check Supabase logs: Authentication → Logs

**"Email domain not allowed" error?**
- Verify SQL trigger was created successfully
- Ensure you're using correct email domain

**Redirect not working?**
- Verify redirect URLs are whitelisted
- Check browser console for errors
- Ensure Site URL matches your domain

## 🚀 Next Steps

Once authentication is working:
- [ ] Update README with authentication instructions
- [ ] Test with multiple users
- [ ] Deploy to production
- [ ] Monitor Supabase logs for any issues
