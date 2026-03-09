/**
 * Auth Guard Module
 * Handles authentication state checking and user session management
 */

class AuthGuard {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.allowedDomains = ['@creativehk.edu.hk', '@student.creativehk.edu.hk'];
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} True if authenticated, false otherwise
   */
  async checkAuth() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();

      if (error) {
        console.error('Auth check error:', error);
        this.redirectToLogin();
        return false;
      }

      if (!session) {
        // Not authenticated
        this.redirectToLogin();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      this.redirectToLogin();
      return false;
    }
  }

  /**
   * Validate if email belongs to allowed domains
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email domain is allowed
   */
  validateEmailDomain(email) {
    if (!email) return false;
    const normalizedEmail = email.toLowerCase().trim();
    return this.allowedDomains.some(domain => normalizedEmail.endsWith(domain));
  }

  /**
   * Sign out the current user and redirect to login
   */
  async signOut() {
    try {
      await this.supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      this.redirectToLogin();
    }
  }

  /**
   * Sign in with Google OAuth
   * @returns {Promise<Object>} Supabase auth response
   */
  async signInWithGoogle() {
    return await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/index.html'
      }
    });
  }

  /**
   * Get the currently authenticated user
   * @returns {Promise<Object|null>} User object or null if not authenticated
   */
  async getCurrentUser() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return session?.user || null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Redirect to login page if not already there
   */
  redirectToLogin() {
    if (window.location.pathname !== '/login.html') {
      window.location.href = '/login.html';
    }
  }

  /**
   * Add sign out button to the page header
   * @param {string} containerSelector - CSS selector for the container element
   */
  async addSignOutButton(containerSelector = 'header .controls') {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn('Sign out button container not found:', containerSelector);
      return;
    }

    // Get current user
    const user = await this.getCurrentUser();
    if (!user) return;

    // Create user info container
    const userInfo = document.createElement('div');
    userInfo.style.display = 'flex';
    userInfo.style.alignItems = 'center';
    userInfo.style.gap = '10px';

    // Add user email
    const emailSpan = document.createElement('span');
    emailSpan.textContent = user.email;
    emailSpan.style.color = 'var(--text-secondary)';
    emailSpan.style.fontSize = '0.9rem';
    userInfo.appendChild(emailSpan);

    // Create sign out button
    const signOutBtn = document.createElement('button');
    signOutBtn.textContent = '登出';
    signOutBtn.style.backgroundColor = 'var(--border)';
    signOutBtn.style.color = 'var(--text-main)';
    signOutBtn.style.border = 'none';
    signOutBtn.style.padding = '8px 16px';
    signOutBtn.style.borderRadius = '6px';
    signOutBtn.style.cursor = 'pointer';
    signOutBtn.style.fontWeight = 'bold';
    signOutBtn.style.transition = 'background 0.2s';

    signOutBtn.onmouseover = () => {
      signOutBtn.style.backgroundColor = 'var(--text-secondary)';
    };
    signOutBtn.onmouseout = () => {
      signOutBtn.style.backgroundColor = 'var(--border)';
    };

    signOutBtn.onclick = () => this.signOut();

    userInfo.appendChild(signOutBtn);
    container.appendChild(userInfo);
  }

  /**
   * Initialize auth guard on page load
   * @param {Object} options - Configuration options
   * @param {string} options.containerSelector - CSS selector for sign out button container
   * @param {Function} options.onAuthenticated - Callback when user is authenticated
   */
  async init(options = {}) {
    const {
      containerSelector = 'header .controls',
      onAuthenticated = null
    } = options;

    const isAuthenticated = await this.checkAuth();

    if (isAuthenticated) {
      // Show page content
      document.body.style.visibility = 'visible';

      // Add sign out button
      await this.addSignOutButton(containerSelector);

      // Call authenticated callback
      if (onAuthenticated && typeof onAuthenticated === 'function') {
        onAuthenticated();
      }
    }

    return isAuthenticated;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthGuard;
}
