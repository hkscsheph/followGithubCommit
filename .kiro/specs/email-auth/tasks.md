# Email Authentication Implementation Tasks

## 1. Create Login Page
- [x] 1.1 Create `login.html` with email input form
- [x] 1.2 Add email domain validation function
- [x] 1.3 Implement magic link request handler
- [x] 1.4 Add success/error message display
- [x] 1.5 Style login page to match existing dark theme

## 2. Create Auth Guard Module
- [x] 2.1 Create `auth-guard.js` file
- [x] 2.2 Implement `checkAuth()` method
- [x] 2.3 Implement `validateEmailDomain()` method
- [x] 2.4 Implement `signOut()` method
- [x] 2.5 Implement `getCurrentUser()` method

## 3. Configure Supabase Authentication
- [ ] 3.1 Enable email authentication in Supabase dashboard
- [ ] 3.2 Configure redirect URLs whitelist
- [ ] 3.3 Set up email domain validation (SQL trigger or Edge Function)
- [ ] 3.4 Customize magic link email template
- [ ] 3.5 Configure session timeout settings

## 4. Protect Index Page
- [x] 4.1 Add auth guard script to `index.html`
- [x] 4.2 Add auth check on page load
- [x] 4.3 Add sign out button to header
- [x] 4.4 Display user email in header

## 5. Protect Repos Page
- [x] 5.1 Add auth guard script to `repos.html`
- [x] 5.2 Add auth check on page load
- [x] 5.3 Add sign out button to header
- [x] 5.4 Display user email in header

## 6. Testing
- [ ] 6.1 Test login with valid @creativehk.edu.hk email
- [ ] 6.2 Test login with valid @student.creativehk.edu.hk email
- [ ] 6.3 Test login rejection with invalid domain
- [ ] 6.4 Test magic link click and redirect
- [ ] 6.5 Test session persistence across page refreshes
- [ ] 6.6 Test sign out functionality
- [ ] 6.7 Test accessing protected pages without auth
- [ ] 6.8 Test expired magic link handling

## 7. Documentation
- [ ] 7.1 Update README with authentication setup instructions
- [ ] 7.2 Document Supabase configuration steps
- [ ] 7.3 Add troubleshooting guide for common auth issues
