# Email Authentication Design

## Architecture Overview

### Authentication Flow
```
User visits site → Check auth state → Authenticated? 
  ├─ Yes → Show main content
  └─ No → Show login page → Enter email → Validate domain → Send magic link → Click link → Authenticated
```

### Components

1. **Login Page** (`login.html`)
   - Email input form
   - Domain validation
   - Magic link request handling
   - Error/success messages

2. **Auth Guard** (JavaScript module)
   - Check authentication state on page load
   - Redirect to login if not authenticated
   - Handle session management

3. **Supabase Integration**
   - Magic link authentication
   - Session management
   - Email domain validation via custom hook

## Implementation Details

### 1. Login Page (`login.html`)

**UI Components:**
- School logo/branding
- Email input field
- "Send Magic Link" button
- Status messages (loading, success, error)
- Styling consistent with existing dark theme

**Validation Logic:**
```javascript
function validateEmail(email) {
  const allowedDomains = ['@creativehk.edu.hk', '@student.creativehk.edu.hk'];
  return allowedDomains.some(domain => email.endsWith(domain));
}
```

**Magic Link Flow:**
```javascript
async function sendMagicLink(email) {
  if (!validateEmail(email)) {
    showError('Please use your school email (@creativehk.edu.hk or @student.creativehk.edu.hk)');
    return;
  }
  
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: window.location.origin + '/index.html'
    }
  });
  
  if (error) {
    showError(error.message);
  } else {
    showSuccess('Check your email for the magic link!');
  }
}
```

### 2. Auth Guard Module (`auth-guard.js`)

**Responsibilities:**
- Check if user is authenticated
- Redirect to login if not authenticated
- Provide sign out functionality
- Handle auth state changes

**Implementation:**
```javascript
class AuthGuard {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }
  
  async checkAuth() {
    const { data: { session } } = await this.supabase.auth.getSession();
    
    if (!session) {
      // Not authenticated, redirect to login
      if (window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
      }
      return false;
    }
    
    // Validate email domain
    const email = session.user.email;
    if (!this.validateEmailDomain(email)) {
      await this.signOut();
      return false;
    }
    
    return true;
  }
  
  validateEmailDomain(email) {
    const allowedDomains = ['@creativehk.edu.hk', '@student.creativehk.edu.hk'];
    return allowedDomains.some(domain => email.endsWith(domain));
  }
  
  async signOut() {
    await this.supabase.auth.signOut();
    window.location.href = '/login.html';
  }
  
  async getCurrentUser() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session?.user || null;
  }
}
```

### 3. Protected Pages Integration

**Add to `index.html` and `repos.html`:**
```html
<script src="auth-guard.js"></script>
<script>
  // Initialize auth guard
  const authGuard = new AuthGuard(supabaseClient);
  
  // Check auth on page load
  authGuard.checkAuth().then(isAuthenticated => {
    if (isAuthenticated) {
      // Show main content
      document.body.style.display = 'block';
      
      // Add sign out button
      addSignOutButton();
    }
  });
  
  function addSignOutButton() {
    const signOutBtn = document.createElement('button');
    signOutBtn.textContent = 'Sign Out';
    signOutBtn.onclick = () => authGuard.signOut();
    // Add to header
    document.querySelector('header .controls').appendChild(signOutBtn);
  }
</script>
```

### 4. Supabase Configuration

**Email Template Customization:**
- Customize magic link email template in Supabase dashboard
- Include school branding
- Clear instructions for clicking the link

**Security Settings:**
- Enable email confirmation
- Set redirect URLs whitelist
- Configure session timeout (e.g., 7 days)

**Email Domain Validation Hook:**
Create a Supabase Edge Function or Database Trigger to validate email domains on sign-up:

```sql
-- Create function to validate email domain
CREATE OR REPLACE FUNCTION validate_email_domain()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email NOT LIKE '%@creativehk.edu.hk' 
     AND NEW.email NOT LIKE '%@student.creativehk.edu.hk' THEN
    RAISE EXCEPTION 'Email domain not allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER check_email_domain
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION validate_email_domain();
```

## UI/UX Design

### Login Page Design
```
┌─────────────────────────────────────┐
│                                     │
│         🏫 Creative HK              │
│      Portfolio Access               │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Email Address                 │ │
│  │ [your.email@creativehk.edu.hk]│ │
│  └───────────────────────────────┘ │
│                                     │
│  [    Send Magic Link    ]          │
│                                     │
│  ℹ️ Use your school email           │
│     (@creativehk.edu.hk or          │
│      @student.creativehk.edu.hk)    │
│                                     │
└─────────────────────────────────────┘
```

### Sign Out Button Placement
- Add to header controls section
- Consistent styling with existing buttons
- Show user email next to sign out button

## Error Handling

### Client-Side Errors
1. **Invalid email domain**: Show inline error message
2. **Network error**: Show retry option
3. **Rate limiting**: Show "Too many attempts" message

### Server-Side Errors
1. **Email delivery failure**: Show support contact
2. **Invalid magic link**: Show "Link expired or invalid" message
3. **Session expired**: Redirect to login with message

## Security Considerations

1. **Email Domain Validation**: Enforce at both client and server level
2. **Magic Link Expiry**: Set reasonable expiration (e.g., 1 hour)
3. **Session Management**: Use secure, httpOnly cookies
4. **HTTPS Only**: Ensure all traffic is encrypted
5. **Rate Limiting**: Prevent abuse of magic link requests

## Testing Strategy

### Manual Testing
1. Test with valid @creativehk.edu.hk email
2. Test with valid @student.creativehk.edu.hk email
3. Test with invalid domain (should be rejected)
4. Test magic link expiration
5. Test sign out functionality
6. Test session persistence across page refreshes

### Edge Cases
1. Email with uppercase letters
2. Email with spaces (should be trimmed)
3. Multiple magic link requests
4. Clicking expired magic link
5. Accessing protected pages without auth

## Deployment Checklist

- [ ] Create `login.html` page
- [ ] Create `auth-guard.js` module
- [ ] Update `index.html` with auth guard
- [ ] Update `repos.html` with auth guard
- [ ] Configure Supabase email settings
- [ ] Set up email domain validation in Supabase
- [ ] Customize magic link email template
- [ ] Test authentication flow end-to-end
- [ ] Update documentation

## Correctness Properties

**Property 1: Email Domain Validation**
- **Validates**: Requirements 2.1, 2.2, 2.3
- For all email inputs, if email ends with allowed domain, then authentication proceeds; otherwise, error is shown

**Property 2: Authentication State Persistence**
- **Validates**: Requirements 1.5
- For all page loads, if valid session exists, then user remains authenticated without re-login

**Property 3: Protected Page Access**
- **Validates**: Requirements 4.1, 4.2, 4.3
- For all protected pages, if user is not authenticated, then redirect to login occurs

**Property 4: Sign Out Completeness**
- **Validates**: Requirements 3.2, 3.3
- After sign out, session is cleared AND user cannot access protected pages without re-authentication
