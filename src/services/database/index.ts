// Create an interface for user data
export interface UserData {
  id?: string;
  email: string;
  companyName: string;
  companyUrl: string;
  createdAt?: string;
}

class DatabaseService {
  private storageKey = 'adsightful_users';

  constructor() {
    // Initialize localStorage if needed
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  /**
   * Save user information to localStorage
   */
  async saveUser(userData: UserData): Promise<UserData | null> {
    try {
      // Generate id and created date if new user
      if (!userData.id) {
        userData.id = this.generateId();
        userData.createdAt = new Date().toISOString();
      }

      // Get existing users
      const users = this.getUsers();
      
      // Check if user already exists
      const existingUserIndex = users.findIndex(user => user.email === userData.email);
      
      if (existingUserIndex >= 0) {
        // Update existing user
        users[existingUserIndex] = {
          ...users[existingUserIndex],
          companyName: userData.companyName,
          companyUrl: userData.companyUrl
        };
      } else {
        // Add new user
        users.push(userData);
      }
      
      // Save back to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      
      return userData;
    } catch (error) {
      console.error('Failed to save user to database:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserData | null> {
    try {
      const users = this.getUsers();
      return users.find(user => user.email === email) || null;
    } catch (error) {
      console.error('Failed to get user from database:', error);
      return null;
    }
  }

  /**
   * Helper method to get all users from localStorage
   */
  private getUsers(): UserData[] {
    const usersJson = localStorage.getItem(this.storageKey);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  /**
   * Generate a simple ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

// Export singleton instance
export const databaseService = new DatabaseService(); 
