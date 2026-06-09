/**
 * Username Masker
 * Handles anonymization of usernames for privacy
 */

class UsernameMasker {
  constructor() {
    this.githubToDisplay = {};
    this.displayToGithub = {};
    this.loaded = false;
  }

  /**
   * Load username mapping
   */
  async loadMapping() {
    if (this.loaded) return;
    
    try {
      const response = await fetch('/username-mapping.json');
      const data = await response.json();
      this.githubToDisplay = data.githubToDisplay || {};
      this.displayToGithub = data.displayToGithub || {};
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load username mapping:', error);
      // Fallback to identity mapping
      this.githubToDisplay = {};
      this.displayToGithub = {};
      this.loaded = true;
    }
  }

  /**
   * Convert GitHub username to display name
   * @param {string} githubUsername - Original GitHub username
   * @returns {string} Anonymized display name
   */
  toDisplayName(githubUsername) {
    if (!githubUsername) return '';
    
    // Return mapped name if exists, otherwise return original
    return this.githubToDisplay[githubUsername] || githubUsername;
  }

  /**
   * Convert display name back to GitHub username
   * @param {string} displayName - Anonymized display name
   * @returns {string} Original GitHub username
   */
  toGithubUsername(displayName) {
    if (!displayName) return '';
    
    // Return mapped GitHub username if exists, otherwise assume it's already a GitHub username
    return this.displayToGithub[displayName] || displayName;
  }

  /**
   * Get all target users with display names
   * @param {Array<string>} targetUsers - Array of GitHub usernames
   * @returns {Promise<Array<string>>} Array of display names
   */
  async getDisplayUsers(targetUsers) {
    await this.loadMapping();
    return targetUsers.map(user => this.toDisplayName(user));
  }

  /**
   * Update a URL parameter from GitHub username to display name
   * @param {string} url - URL to update
   * @returns {string} Updated URL with display name
   */
  updateUrlWithDisplayName(url) {
    if (!url.includes('user=')) return url;
    
    const urlObj = new URL(url, window.location.origin);
    const githubUser = urlObj.searchParams.get('user');
    if (githubUser && this.githubToDisplay[githubUser]) {
      const displayName = this.toDisplayName(githubUser);
      urlObj.searchParams.set('user', displayName);
      return urlObj.toString();
    }
    return url;
  }

  /**
   * Update URL parameter from display name to GitHub username
   * @param {string} url - URL to update
   * @returns {string} Updated URL with GitHub username
   */
  updateUrlWithGithubUsername(url) {
    if (!url.includes('user=')) return url;
    
    const urlObj = new URL(url, window.location.origin);
    const displayName = urlObj.searchParams.get('user');
    if (displayName && this.displayToGithub[displayName]) {
      const githubUser = this.toGithubUsername(displayName);
      urlObj.searchParams.set('user', githubUser);
      return urlObj.toString();
    }
    return url;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UsernameMasker;
}