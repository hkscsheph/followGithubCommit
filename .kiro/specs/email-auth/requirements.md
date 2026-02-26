# Email Authentication Requirements

## Overview
Add authentication to the portfolio website that restricts access to users with valid school email addresses.

## User Stories

### 1. As a visitor, I want to sign in with my school email so that I can access the portfolio website
**Acceptance Criteria:**
- 1.1 User sees a login page when accessing the website without authentication
- 1.2 User can enter their email address in a login form
- 1.3 User receives a magic link via email to complete authentication
- 1.4 User is redirected to the main portfolio page after successful authentication
- 1.5 User session persists across page refreshes

### 2. As a system, I want to validate email domains so that only authorized users can access the site
**Acceptance Criteria:**
- 2.1 System accepts emails ending with `@creativehk.edu.hk`
- 2.2 System accepts emails ending with `@student.creativehk.edu.hk`
- 2.3 System rejects emails from other domains with a clear error message
- 2.4 Validation happens before sending the magic link

### 3. As an authenticated user, I want to sign out so that I can end my session
**Acceptance Criteria:**
- 3.1 User sees a "Sign Out" button when authenticated
- 3.2 Clicking "Sign Out" clears the session and redirects to login page
- 3.3 User cannot access protected pages after signing out

### 4. As a developer, I want to protect all pages so that unauthenticated users cannot bypass the login
**Acceptance Criteria:**
- 4.1 `index.html` requires authentication
- 4.2 `repos.html` requires authentication
- 4.3 Unauthenticated users are redirected to login page
- 4.4 Authentication state is checked on page load

## Technical Constraints
- Must work as a static site (no backend server)
- Use Supabase for authentication
- Use magic link authentication (passwordless)
- Minimal UI changes to existing design

## Out of Scope
- Password-based authentication
- Social login (Google, GitHub, etc.)
- User profile management
- Role-based access control
- Email verification beyond domain check
