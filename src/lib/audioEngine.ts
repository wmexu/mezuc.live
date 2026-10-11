import { AudioQuality, Track } from "@/types/player";

type AudioSourceType = "youtube" | "html5" | "synth" | null;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isRunning: boolean = false;
  private currentTrack: Track | null = null;
  private currentSource: AudioSourceType = null;
  private quality: AudioQuality = "lossless";
  private currentVolume: number = 0.85;
  private animFrameId: number | null = null;
  private startTime: number = 0;
  private pauseOffset: number = 0;
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private synthInterval: NodeJS.Timeout | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  // YouTube IFrame Player integration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ytPlayer: any = null;
  private isYtReady: boolean = false;
  private ytInitPromise: Promise<void> | null = null;
  private pendingYtVideoId: string | null = null;
  private pendingYtOffset: number = 0;

  // Audio spectrum pulse generator for YouTube playback visualizers
  private pulseOsc: OscillatorNode | null = null;
  private pulseGain: GainNode | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initYouTubeApi();
    }
  }

  private initContext() {
    if (this.ctx) return;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.82;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);

    this.filterNode = this.ctx.createBiquadFilter();
    this.updateFilterForQuality();

    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  // --- YouTube IFrame API Lifecycle ---
  private initYouTubeApi(): Promise<void> {
    if (this.ytInitPromise) return this.ytInitPromise;

    this.ytInitPromise = new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();

      // Check if YouTube API is already loaded
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (win.YT && win.YT.Player) {
        this.setupYouTubePlayer(resolve);
        return;
      }

      // Add API ready callback
      const prevCallback = win.onYouTubeIframeAPIReady;
      win.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === "function") prevCallback();
        this.setupYouTubePlayer(resolve);
      };

      // Inject YouTube IFrame API script tag if not yet in DOM
      if (!document.getElementById("yt-iframe-api-script")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScript = document.getElementsByTagName("script")[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(tag, firstScript);
        } else {
          document.head.appendChild(tag);
        }
      }
    });

    return this.ytInitPromise;
  }

  private setupYouTubePlayer(resolve: () => void) {
    if (typeof document === "undefined") return resolve();

    let container = document.getElementById("mezuc-yt-player-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "mezuc-yt-player-container";
      container.style.position = "fixed";
      container.style.bottom = "-9999px";
      container.style.left = "-9999px";
      container.style.width = "200px";
      container.style.height = "200px";
      container.style.opacity = "0.01";
      container.style.pointerEvents = "none";
      container.style.zIndex = "-99";
      document.body.appendChild(container);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    try {
      this.ytPlayer = new win.YT.Player("mezuc-yt-player-container", {
        height: "200",
        width: "200",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            this.isYtReady = true;
            this.ytPlayer.setVolume(Math.round(this.currentVolume * 100));
            if (this.pendingYtVideoId) {
              const vid = this.pendingYtVideoId;
              const off = this.pendingYtOffset;
              this.pendingYtVideoId = null;
              this.playYouTubeVideo(vid, off);
            }
            resolve();
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
            if (event.data === 0) {
              // Video Ended -> Advance to next track in queue
              this.onEndedCallback?.();
            } else if (event.data === 1) {
              this.isRunning = true;
              this.startVisualizerPulse();
            } else if (event.data === 2) {
              this.stopVisualizerPulse();
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (err: any) => {
            console.warn("YouTube player warning/error:", err);
            // If restricted, fallback gracefully
          },
        },
      });
    } catch (e) {
      console.warn("Failed to instantiate YT.Player:", e);
      resolve();
    }
  }

  private updateFilterForQuality() {
    if (!this.filterNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.quality === "normal") {
      this.filterNode.type = "lowpass";
      this.filterNode.frequency.setTargetAtTime(14500, now, 0.1);
      this.filterNode.Q.setTargetAtTime(0.7, now, 0.1);
    } else if (this.quality === "high") {
      this.filterNode.type = "lowpass";
      this.filterNode.frequency.setTargetAtTime(20000, now, 0.1);
      this.filterNode.Q.setTargetAtTime(1.0, now, 0.1);
    } else {
      // Lossless: High fidelity transparent shelf
      this.filterNode.type = "allpass";
      this.filterNode.frequency.setTargetAtTime(22000, now, 0.1);
    }
  }

  public setQuality(quality: AudioQuality) {
    this.quality = quality;
    this.updateFilterForQuality();
  }

  public setCallbacks(
    onTimeUpdate: (time: number) => void,
    onEnded: () => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
  }

  public setVolume(val: number) {
    this.currentVolume = Math.max(0, Math.min(1, val));

    // Update Web Audio master gain
    if (this.masterGain && this.ctx && this.isRunning) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
    }

    // Update HTML5 audio
    if (this.audioElement) {
      this.audioElement.volume = this.currentVolume;
    }

    // Update YouTube player volume (0 - 100)
    if (this.ytPlayer && typeof this.ytPlayer.setVolume === "function") {
      try {
        this.ytPlayer.setVolume(Math.round(this.currentVolume * 100));
      } catch {}
    }
  }

  public async play(track: Track, offsetSeconds: number = 0) {
    this.initContext();
    if (this.ctx && this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    this.currentTrack = track;
    this.pauseOffset = offsetSeconds;
    this.startTime = (this.ctx?.currentTime || 0) - offsetSeconds;
    this.isRunning = true;

    // Check if track has a YouTube video ID
    const youtubeId =
      track.youtubeId ||
      (track.id.startsWith("yt-") ? track.id.replace(/^yt-/, "") : null) ||
      (track.source === "youtube" ? track.id : null);

    if (youtubeId && youtubeId.length >= 8) {
      this.currentSource = "youtube";
      if (this.audioElement) this.audioElement.pause();
      this.stopSynth();
      await this.playYouTubeVideo(youtubeId, offsetSeconds);
    } else if (track.audioUrl && track.audioUrl.trim().length > 0) {
      this.currentSource = "html5";
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === "function") {
        try { this.ytPlayer.pauseVideo(); } catch {}
      }
      this.stopSynth();
      this.playHtml5Audio(track.audioUrl, offsetSeconds);
    } else {
      // Procedural synthesizer fallback only if no stream or YouTube ID exists
      this.currentSource = "synth";
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === "function") {
        try { this.ytPlayer.pauseVideo(); } catch {}
      }
      this.startAmbientSynthesis(track, offsetSeconds);
    }

    this.startTimeTracking();
  }

  private async playYouTubeVideo(videoId: string, offsetSeconds: number) {
    if (!this.isYtReady || !this.ytPlayer || typeof this.ytPlayer.loadVideoById !== "function") {
      this.pendingYtVideoId = videoId;
      this.pendingYtOffset = offsetSeconds;
      await this.initYouTubeApi();
      return;
    }

    try {
      this.ytPlayer.loadVideoById({
        videoId,
        startSeconds: Math.floor(offsetSeconds),
      });
      this.ytPlayer.setVolume(Math.round(this.currentVolume * 100));
      this.ytPlayer.playVideo();
      this.startVisualizerPulse();
    } catch (e) {
      console.warn("Failed to load video in YouTube player:", e);
    }
  }

  private playHtml5Audio(url: string, offset: number) {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = "anonymous";
      if (this.ctx && this.filterNode) {
        this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);
        this.audioSourceNode.connect(this.filterNode);
      }
    }

    this.audioElement.src = url;
    this.audioElement.currentTime = offset;
    this.audioElement.volume = this.currentVolume;
    this.audioElement.play().catch(() => {
      if (this.currentTrack) {
        this.startAmbientSynthesis(this.currentTrack, offset);
      }
    });

    this.audioElement.onended = () => {
      this.onEndedCallback?.();
    };
  }

  // Visualizer spectrum driver for YouTube playback
  private startVisualizerPulse() {
    if (!this.ctx || !this.analyser || this.pulseOsc) return;

    try {
      this.pulseOsc = this.ctx.createOscillator();
      this.pulseGain = this.ctx.createGain();

      this.pulseOsc.type = "sawtooth";
      this.pulseOsc.frequency.setValueAtTime(65, this.ctx.currentTime);

      // Low gain so it modulates the analyser without interfering heavily
      this.pulseGain.gain.setValueAtTime(0.005, this.ctx.currentTime);

      this.pulseOsc.connect(this.pulseGain);
      this.pulseGain.connect(this.analyser);
      this.pulseOsc.start();
    } catch {}
  }

  private stopVisualizerPulse() {
    if (this.pulseOsc) {
      try {
        this.pulseOsc.stop();
        this.pulseOsc.disconnect();
      } catch {}
      this.pulseOsc = null;
    }
    if (this.pulseGain) {
      try {
        this.pulseGain.disconnect();
      } catch {}
      this.pulseGain = null;
    }
  }

  private startAmbientSynthesis(track: Track, _offset: number) {
    if (this.audioElement) this.audioElement.pause();
    this.stopSynth();
    if (!this.ctx || !this.filterNode) return;

    const baseFrequencies = [
      [55, 110, 164.81, 220, 277.18],
      [65.41, 130.81, 196, 261.63, 311.13],
      [73.42, 146.83, 220, 293.66, 369.99],
      [82.41, 164.81, 246.94, 329.63, 392],
    ];

    const freqIndex = Math.abs(track.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % baseFrequencies.length;
    const notes = baseFrequencies[freqIndex];

    const bpm = track.bpm || 80;
    const intervalMs = (60 / bpm) * 1000;

    let step = 0;
    const triggerVoice = () => {
      if (!this.isRunning || !this.ctx || !this.filterNode) return;
      const now = this.ctx.currentTime;
      const note = notes[step % notes.length];
      step++;

      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(note / 2, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.15);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + (intervalMs / 1000) * 1.8);

      osc1.connect(gain1);
      gain1.connect(this.filterNode);
      osc1.start(now);
      osc1.stop(now + (intervalMs / 1000) * 1.9);
    };

    triggerVoice();
    this.synthInterval = setInterval(triggerVoice, intervalMs);
  }

  private stopSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  public pause() {
    this.isRunning = false;
    this.stopSynth();
    this.stopVisualizerPulse();

    if (this.currentSource === "youtube" && this.ytPlayer && typeof this.ytPlayer.pauseVideo === "function") {
      try {
        this.ytPlayer.pauseVideo();
        this.pauseOffset = this.ytPlayer.getCurrentTime() || this.pauseOffset;
      } catch {}
    } else if (this.audioElement) {
      this.audioElement.pause();
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public resume() {
    if (!this.currentTrack) return;
    this.play(this.currentTrack, this.pauseOffset);
  }

  public seek(seconds: number) {
    this.pauseOffset = seconds;

    if (this.currentSource === "youtube" && this.ytPlayer && typeof this.ytPlayer.seekTo === "function") {
      try {
        this.ytPlayer.seekTo(seconds, true);
      } catch {}
    } else if (this.audioElement) {
      this.audioElement.currentTime = seconds;
    } else if (this.ctx) {
      this.startTime = this.ctx.currentTime - seconds;
    }

    this.onTimeUpdateCallback?.(seconds);
  }

  private startTimeTracking() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const update = () => {
      if (!this.isRunning || !this.currentTrack) return;

      let currentSec = 0;
      if (this.currentSource === "youtube" && this.ytPlayer && typeof this.ytPlayer.getCurrentTime === "function") {
        try {
          currentSec = this.ytPlayer.getCurrentTime() || 0;
        } catch {
          currentSec = 0;
        }
      } else if (this.audioElement && !this.audioElement.paused && this.audioElement.duration) {
        currentSec = this.audioElement.currentTime;
      } else if (this.ctx) {
        currentSec = this.ctx.currentTime - this.startTime;
      }

      this.pauseOffset = currentSec;

      if (this.currentTrack.duration > 0 && currentSec >= this.currentTrack.duration) {
        this.onEndedCallback?.();
        return;
      }

      this.onTimeUpdateCallback?.(currentSec);
      this.animFrameId = requestAnimationFrame(update);
    };

    this.animFrameId = requestAnimationFrame(update);
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(32);
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

export const audioEngine = new AudioEngine();
