/**
 * PAI Eye Tracker - Hands-free scrolling via eye gaze
 * Built for piata-ai.ro marketplace
 */

export class PAIEyeTracker {
  private isActive: boolean = false;
  private webgazer: any = null;
  private scrollThreshold = 0.15; // Top 15% or bottom 15% triggers scroll
  private scrollSpeed = 3; // pixels per frame
  private animationFrame: number | null = null;

  constructor() {
    // Load WebGazer dynamically
    this.loadWebGazer();
  }

  private async loadWebGazer() {
    if (typeof window === 'undefined') return;
    
    // Dynamically import WebGazer
    const script = document.createElement('script');
    script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
    script.async = true;
    
    script.onload = () => {
      console.log('🔮 [PAI]: WebGazer loaded. Eye tracking ready.');
      this.webgazer = (window as any).webgazer;
      
      if (this.webgazer) {
        this.webgazer.setRegression('ridge')
          .setTracker('TFFacemesh')
          .setGazeListener((data: any, elapsedTime: number) => {
            if (data && this.isActive) {
              this.handleGaze(data.x, data.y);
            }
          });
      }
    };
    
    document.head.appendChild(script);
  }

  async start(): Promise<boolean> {
    if (!this.webgazer) {
      console.warn('⚠️ [PAI]: WebGazer not loaded yet');
      return false;
    }

    try {
      // Request camera permission and start tracking
      await this.webgazer.begin();
      this.isActive = true;
      
      // Hide the red dot (prediction point)
      this.webgazer.showPredictionPoints(false);
      
      // Show calibration UI
      this.showCalibrationHint();
      
      console.log('👁️ [PAI]: Eye tracking started. Look at the edges to scroll.');
      return true;
      
    } catch (error) {
      console.error('❌ [PAI]: Camera permission denied or error:', error);
      return false;
    }
  }

  stop() {
    if (this.webgazer) {
      this.webgazer.end();
      this.isActive = false;
      
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
      
      this.hideCalibrationHint();
      console.log('🛑 [PAI]: Eye tracking stopped.');
    }
  }

  private handleGaze(x: number, y: number) {
    const viewportHeight = window.innerHeight;
    const normalizedY = y / viewportHeight; // 0 to 1

    // Scroll up if looking at top 15%
    if (normalizedY < this.scrollThreshold) {
      this.smoothScroll(-this.scrollSpeed);
    }
    // Scroll down if looking at bottom 15%
    else if (normalizedY > (1 - this.scrollThreshold)) {
      this.smoothScroll(this.scrollSpeed);
    }
  }

  private smoothScroll(delta: number) {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      window.scrollBy({
        top: delta,
        behavior: 'auto' // Smooth but not too laggy
      });
    });
  }

  private showCalibrationHint() {
    const hint = document.createElement('div');
    hint.id = 'pai-eye-tracker-hint';
    hint.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, rgba(0,240,255,0.95), rgba(255,0,240,0.95));
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        animation: fadeIn 0.3s ease;
      ">
        <div style="font-size: 24px; margin-bottom: 10px;">👁️ PAI Eye Scroll Active</div>
        <div style="font-size: 14px; opacity: 0.9;">
          Look at the <strong>top</strong> to scroll up<br>
          Look at the <strong>bottom</strong> to scroll down
        </div>
        <button onclick="document.getElementById('pai-eye-tracker-hint').remove()" style="
          margin-top: 15px;
          padding: 8px 20px;
          background: white;
          color: #333;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        ">Got it!</button>
      </div>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      </style>
    `;
    
    document.body.appendChild(hint);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      const el = document.getElementById('pai-eye-tracker-hint');
      if (el) el.remove();
    }, 5000);
  }

  private hideCalibrationHint() {
    const hint = document.getElementById('pai-eye-tracker-hint');
    if (hint) hint.remove();
  }

  isTracking(): boolean {
    return this.isActive;
  }

  // Allow users to adjust sensitivity
  setScrollSpeed(speed: number) {
    this.scrollSpeed = Math.max(1, Math.min(10, speed)); // Clamp 1-10
  }

  setScrollThreshold(threshold: number) {
    this.scrollThreshold = Math.max(0.05, Math.min(0.3, threshold)); // Clamp 5%-30%
  }
}

// Singleton instance
let trackerInstance: PAIEyeTracker | null = null;

export function getPAIEyeTracker(): PAIEyeTracker {
  if (!trackerInstance) {
    trackerInstance = new PAIEyeTracker();
  }
  return trackerInstance;
}
