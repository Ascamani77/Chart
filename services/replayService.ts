
import { OHLCData } from "../types";
import { timeToValue } from "../drawing/trendline";

export interface ReplayState {
  isActive: boolean;
  isSelecting: boolean;
  isPlaying: boolean;
  cutoffTime: number | null;
  speed: number;
}

export class ReplayManager {
  private data: OHLCData[] = [];
  private state: ReplayState = {
    isActive: false,
    isSelecting: false,
    isPlaying: false,
    cutoffTime: null,
    speed: 500,
  };
  private onStateChange: (state: ReplayState) => void;
  private timer: number | null = null;

  constructor(onStateChange: (state: ReplayState) => void) {
    this.onStateChange = onStateChange;
  }

  setData(data: OHLCData[]) {
    this.data = data;
  }

  private notify() {
    this.onStateChange({ ...this.state });
  }

  activate() {
    this.state.isActive = true;
    this.state.isSelecting = true;
    this.notify();
  }

  deactivate() {
    this.stopPlayback();
    this.state = {
      isActive: false,
      isSelecting: false,
      isPlaying: false,
      cutoffTime: null,
      speed: 500,
    };
    this.notify();
  }

  setSelecting(isSelecting: boolean) {
    this.state.isSelecting = isSelecting;
    this.notify();
  }

  setCutoff(time: number) {
    // Snap to the nearest actual bar in data to avoid index mismatches
    const val = timeToValue(time as any);
    const closest = this.data.reduce((prev, curr) => {
      return (Math.abs(timeToValue(curr.time) - val) < Math.abs(timeToValue(prev.time) - val) ? curr : prev);
    });

    this.state.cutoffTime = timeToValue(closest.time);
    this.state.isSelecting = false;
    this.notify();
  }

  stepForward(): boolean {
    if (this.state.cutoffTime === null || this.data.length === 0) return false;

    const currentIndex = this.data.findIndex(d => timeToValue(d.time) === this.state.cutoffTime);
    if (currentIndex !== -1 && currentIndex < this.data.length - 1) {
      const nextTime = timeToValue(this.data[currentIndex + 1].time);
      this.state.cutoffTime = nextTime;
      this.notify();
      return true;
    } else {
      this.stopPlayback();
      return false;
    }
  }

  togglePlayback() {
    if (this.state.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  startPlayback() {
    if (this.state.isPlaying || this.state.cutoffTime === null) return;
    this.state.isPlaying = true;
    this.notify();

    const tick = () => {
      const moved = this.stepForward();
      if (moved && this.state.isPlaying) {
        this.timer = window.setTimeout(tick, this.state.speed);
      } else {
        this.stopPlayback();
      }
    };

    this.timer = window.setTimeout(tick, this.state.speed);
  }

  stopPlayback() {
    this.state.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.notify();
  }

  setSpeed(ms: number) {
    this.state.speed = ms;
    this.notify();
  }
}
