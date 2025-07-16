
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

class SessionManager {
  private static instance: SessionManager;
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
      SessionManager.instance.initialize();
    }
    return SessionManager.instance;
  }

  private initialize() {
    console.log('SessionManager: Initializing session management');
    
    onAuthStateChanged(auth, (user) => {
      console.log('SessionManager: Auth state changed:', user?.uid || 'No user');
      this.currentUser = user;
      this.notifyListeners(user);
    });
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  addAuthStateListener(callback: (user: User | null) => void) {
    this.authStateListeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser);
  }

  removeAuthStateListener(callback: (user: User | null) => void) {
    const index = this.authStateListeners.indexOf(callback);
    if (index > -1) {
      this.authStateListeners.splice(index, 1);
    }
  }

  private notifyListeners(user: User | null) {
    this.authStateListeners.forEach(listener => {
      try {
        listener(user);
      } catch (error) {
        console.error('SessionManager: Error in auth state listener:', error);
      }
    });
  }

  // Method to check if user session is still valid
  async validateSession(): Promise<boolean> {
    try {
      if (!this.currentUser) {
        console.log('SessionManager: No current user for session validation');
        return false;
      }

      // Force token refresh to check if session is still valid
      await this.currentUser.getIdToken(true);
      console.log('SessionManager: Session validation successful');
      return true;
    } catch (error) {
      console.error('SessionManager: Session validation failed:', error);
      return false;
    }
  }

  // Clear session data
  clearSession() {
    console.log('SessionManager: Clearing session data');
    this.currentUser = null;
    this.notifyListeners(null);
  }
}

export default SessionManager;
