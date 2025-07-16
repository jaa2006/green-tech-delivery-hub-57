// Performance monitoring utility
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private memoryChecks: number[] = [];
  private lastMemoryCheck = 0;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track operation timing
  startTiming(operation: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.addMetric(operation, duration);
    };
  }

  // Add metric to collection
  private addMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const metrics = this.metrics.get(operation)!;
    metrics.push(duration);
    
    // Keep only last 50 measurements
    if (metrics.length > 50) {
      metrics.shift();
    }
  }

  // Check memory usage
  checkMemory(): void {
    if (!('memory' in performance)) return;
    
    const now = Date.now();
    if (now - this.lastMemoryCheck < 30000) return; // Check every 30 seconds
    
    const memory = (performance as any).memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    
    this.memoryChecks.push(usedMB);
    
    // Keep only last 20 checks
    if (this.memoryChecks.length > 20) {
      this.memoryChecks.shift();
    }
    
    this.lastMemoryCheck = now;
    
    // Warn if memory usage is high
    if (usedMB > 100) {
      console.warn(`High memory usage detected: ${usedMB}MB`);
    }
  }

  // Get performance report
  getReport(): object {
    const report: any = {
      timestamp: new Date().toISOString(),
      operations: {}
    };

    // Calculate averages for each operation
    this.metrics.forEach((durations, operation) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);
      const min = Math.min(...durations);
      
      report.operations[operation] = {
        average: Math.round(avg * 100) / 100,
        max: Math.round(max * 100) / 100,
        min: Math.round(min * 100) / 100,
        samples: durations.length
      };
    });

    // Add memory info
    if (this.memoryChecks.length > 0) {
      const currentMemory = this.memoryChecks[this.memoryChecks.length - 1];
      const avgMemory = this.memoryChecks.reduce((a, b) => a + b, 0) / this.memoryChecks.length;
      
      report.memory = {
        current: `${currentMemory}MB`,
        average: `${Math.round(avgMemory)}MB`,
        max: `${Math.max(...this.memoryChecks)}MB`
      };
    }

    return report;
  }

  // Log performance report
  logReport(): void {
    console.log('=== PERFORMANCE REPORT ===');
    console.table(this.getReport());
    console.log('==========================');
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
    this.memoryChecks = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Export helper functions
export const trackOperation = (operation: string) => 
  performanceMonitor.startTiming(operation);

export const checkMemory = () => 
  performanceMonitor.checkMemory();

export const logPerformanceReport = () => 
  performanceMonitor.logReport();

// Auto-check memory periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.checkMemory();
  }, 30000);
}
