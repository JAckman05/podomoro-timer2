/**
 * Web Audio API Synthesizer for Premium Sound Notifications.
 * No external file dependencies required, guarantees zero loading failure.
 */

export function playNotificationSound(type: 'zen' | 'chime' | 'digital' | 'synth', volume: number = 0.5) {
  if (volume === 0) return;

  // Safe checks for AudioContext across browsers
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    
    // Master volume destination
    const masterGainNode = ctx.createGain();
    masterGainNode.gain.setValueAtTime(volume, ctx.currentTime);
    masterGainNode.connect(ctx.destination);

    if (type === 'zen') {
      // Deep, relaxing Tibetan Singing bowl / bell chime
      // Blends a sub-tone and several harmonic overtones with subtle envelope modulation
      const now = ctx.currentTime;
      const duration = 2.5;

      const frequencies: number[] = [160, 320, 480, 640];
      const gains: number[] = [0.4, 0.25, 0.15, 0.08];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Use sine wave for pure resonant tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Add slight frequency drift to sound more organic
        osc.frequency.linearRampToValueAtTime(freq + (idx === 0 ? 1 : idx * 1.5), now + duration);

        gainNode.gain.setValueAtTime(0, now);
        // Quick gentle attack to avoid popping
        gainNode.gain.linearRampToValueAtTime(gains[idx], now + 0.06);
        // Long beautiful decay
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(masterGainNode);

        osc.start(now);
        osc.stop(now + duration);
      });

    } else if (type === 'chime') {
      // Double crystal-clear glass/bell chime (A major vibe)
      const now = ctx.currentTime;
      
      // Note 1: E6 (1318.51 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1318.51, now);
      
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.5, now + 0.01);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      osc1.connect(gain1);
      gain1.connect(masterGainNode);
      osc1.start(now);
      osc1.stop(now + 1.0);

      // Note 2: A6 (1760 Hz), trailing by 0.12s
      const delay = 0.12;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760.00, now + delay);
      
      gain2.gain.setValueAtTime(0, now + delay);
      gain2.gain.setValueAtTime(0.001, now + delay);
      gain2.gain.linearRampToValueAtTime(0.4, now + delay + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.9);
      
      osc2.connect(gain2);
      gain2.connect(masterGainNode);
      osc2.start(now + delay);
      osc2.stop(now + delay + 1.1);

    } else if (type === 'digital') {
      // Triple quick retro-modern digital alerts (crisp beeps)
      const now = ctx.currentTime;
      const beepLength = 0.08;
      const beepInterval = 0.14;
      const freq = 1960; // B6 Note

      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'triangle'; // triangle has a softer retro flavor than square
        osc.frequency.setValueAtTime(freq, now + i * beepInterval);
        
        gainNode.gain.setValueAtTime(0, now + i * beepInterval);
        gainNode.gain.linearRampToValueAtTime(0.5, now + i * beepInterval + 0.005);
        gainNode.gain.setValueAtTime(0.5, now + i * beepInterval + beepLength - 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * beepInterval + beepLength);
        
        osc.connect(gainNode);
        gainNode.connect(masterGainNode);
        
        osc.start(now + i * beepInterval);
        osc.stop(now + i * beepInterval + beepLength + 0.05);
      }

    } else if (type === 'synth') {
      // Warm modern synthesizer triad chord (Cmaj9 or Fmaj9 feeling)
      const now = ctx.currentTime;
      const duration = 1.8;
      
      // Warm notes: F3 (174.61), A3 (220.00), C4 (261.63), E4 (329.63)
      const chords: number[] = [174.61, 220.00, 261.63, 329.63];
      
      chords.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Triangle/Sine blend
        osc.type = index % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        // Slightly detune to add beautiful analog chorus effect
        osc.detune.setValueAtTime(index === 0 ? -4 : (index === 2 ? 4 : 0), now);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.15); // soft swell
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        
        osc.connect(gainNode);
        gainNode.connect(masterGainNode);
        
        osc.start(now);
        osc.stop(now + duration + 0.1);
      });
    }

  } catch (error) {
    console.error("Failed to generate synthesized sound via Web Audio API", error);
  }
}

/**
 * Play a high-precision ticking Sound (soft and quiet) for the timer if requested, Or a light tap.
 */
export function playTickSound(volume: number = 0.1) {
  if (volume === 0) return;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, now);
    
    // Very quick tick
    gainNode.gain.setValueAtTime(volume * 0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.005);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.01);
  } catch {
    // Fail silently for ticks
  }
}
