
export interface NavigationState {
  currentPath: string;
  previousPath: string | null;
  stack: string[];
}

class NavigationManager {
  private static instance: NavigationManager;
  private state: NavigationState = {
    currentPath: '/',
    previousPath: null,
    stack: ['/']
  };

  static getInstance(): NavigationManager {
    if (!NavigationManager.instance) {
      NavigationManager.instance = new NavigationManager();
    }
    return NavigationManager.instance;
  }

  updatePath(newPath: string): void {
    console.log('NavigationManager: Updating path from', this.state.currentPath, 'to', newPath);
    
    this.state.previousPath = this.state.currentPath;
    this.state.currentPath = newPath;
    
    // Add to stack if it's a new path
    if (this.state.stack[this.state.stack.length - 1] !== newPath) {
      this.state.stack.push(newPath);
    }
    
    // Limit stack size to prevent memory issues
    if (this.state.stack.length > 10) {
      this.state.stack = this.state.stack.slice(-10);
    }
    
    console.log('NavigationManager: Updated state:', this.state);
  }

  goBack(): string | null {
    if (this.state.stack.length > 1) {
      this.state.stack.pop(); // Remove current path
      const previousPath = this.state.stack[this.state.stack.length - 1];
      this.state.previousPath = this.state.currentPath;
      this.state.currentPath = previousPath;
      console.log('NavigationManager: Going back to:', previousPath);
      return previousPath;
    }
    return null;
  }

  clearStack(): void {
    console.log('NavigationManager: Clearing navigation stack');
    this.state.stack = [this.state.currentPath];
  }

  getState(): NavigationState {
    return { ...this.state };
  }

  canGoBack(): boolean {
    return this.state.stack.length > 1;
  }
}

export default NavigationManager;
