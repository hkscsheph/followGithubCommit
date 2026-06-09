/**
 * Portfolio Auth Check
 * Include this script in portfolio pages to protect them with authentication
 * Usage: <script src="/portfolio-auth-check.js"></script>
 */

(async function() {
  const SUPABASE_URL = 'https://wnvgjuhxxwnihmjfrcvk.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_MR0Q28M6SwAHDyy5iqdQXA_U26L7s6b';
  
  // Check if supabase is already loaded
  if (typeof supabase === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = checkAuth;
    document.head.appendChild(script);
  } else {
    checkAuth();
  }

  async function checkAuth() {
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Load whitelist
    let allowedDomains = ['@creativehk.edu.hk', '@student.creativehk.edu.hk'];
    let allowedEmails = [];
    try {
      const response = await fetch('/whitelist.json');
      const data = await response.json();
      allowedDomains = data.allowedDomains || allowedDomains;
      allowedEmails = data.allowedEmails || allowedEmails;
    } catch (error) {
      console.error('Failed to load whitelist:', error);
    }

    // Check if email is allowed
    function isEmailAllowed(email) {
      if (!email) return false;
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if email matches any allowed domain
      const domainAllowed = allowedDomains.some(domain => normalizedEmail.endsWith(domain));
      if (domainAllowed) return true;
      
      // Check if email is in allowed emails list
      const emailAllowed = allowedEmails.some(allowed => 
        allowed.toLowerCase() === normalizedEmail
      );
      return emailAllowed;
    }

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();

      if (!session) {
        // Not authenticated, redirect to login
        window.location.href = '/login.html';
        return;
      }

      // Check if email is whitelisted
      if (!isEmailAllowed(session.user.email)) {
        // Not whitelisted, sign out and redirect
        await supabaseClient.auth.signOut();
        window.location.href = '/login.html';
        return;
      }

      // User is authenticated and whitelisted, allow access
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = '/login.html';
    }
  }
})();
