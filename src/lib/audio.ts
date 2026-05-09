export type SoundType = "none" | "brown-noise" | "deep-space" | "rain" | "ocean" | "beneath-surface";

export class AudioSynth {
  ctx: AudioContext | null = null;
  noiseNode: AudioBufferSourceNode | null = null;
  gainNode: GainNode | null = null;
  lfoNode: OscillatorNode | null = null;
  htmlAudio: HTMLAudioElement | null = null;

  start(type: SoundType) {
    if (type === "none") return;
    this.stop();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.ctx = new AudioContextClass();
    this.gainNode = this.ctx.createGain();

    if (type === "beneath-surface") {
      fetch("/beneath_the_surface.mp3")
        .then(response => response.arrayBuffer())
        .then(data => this.ctx!.decodeAudioData(data))
        .then(buffer => {
          if (!this.ctx) return; // check if stopped
          this.noiseNode = this.ctx.createBufferSource();
          this.noiseNode.buffer = buffer;
          this.noiseNode.loop = true;
          
          this.gainNode!.gain.value = 0.6;
          this.noiseNode.connect(this.gainNode!);
          this.gainNode!.connect(this.ctx.destination);
          
          this.noiseNode.start(0);
        })
        .catch(e => console.error("Failed to load beneath surface audio:", e));
      return; // Exit here since we use fetch async
    }

    // Synthesized sounds
    const bufferSize = this.ctx.sampleRate * 2; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; 
    }
    
    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    
    const filter = this.ctx.createBiquadFilter();
    
    if (type === "deep-space") {
      filter.type = "lowpass";
      filter.frequency.value = 150;
      this.gainNode.gain.value = 2.5;
    } else if (type === "ocean") {
      filter.type = "lowpass";
      filter.frequency.value = 400;
      
      // LFO for wave swelling effect
      this.lfoNode = this.ctx.createOscillator();
      this.lfoNode.type = "sine";
      this.lfoNode.frequency.value = 0.1; // 10 seconds per wave
      
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.4;
      this.lfoNode.connect(lfoGain);
      lfoGain.connect(this.gainNode.gain);
      this.lfoNode.start();
      
      this.gainNode.gain.value = 0.3; 
    } else if (type === "rain") {
       filter.type = "lowpass";
       filter.frequency.value = 1200; 
       this.gainNode.gain.value = 0.5;
    } else {
      filter.type = "lowpass";
      filter.frequency.value = 400; // brown
      this.gainNode.gain.value = 0.8;
    }
    
    this.noiseNode.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
    
    this.noiseNode.start(0);
  }

  stop() {
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.currentTime = 0;
      this.htmlAudio = null;
    }
    if (this.noiseNode) {
      try { this.noiseNode.stop(); } catch(e) {}
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }
    if (this.lfoNode) {
      try { this.lfoNode.stop(); } catch(e) {}
      this.lfoNode.disconnect();
      this.lfoNode = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
