/**
 * 上林神寵運動養成系統 - Web Audio API 即時音效引擎 (audio.js)
 * 無需外部音訊檔案，全純程式合成：
 * 1. 摸摸撒嬌呼嚕咕嚕聲與萌系水滴音 (Purr & Cuddle Chirp)
 * 2. 運動能量餵食咀嚼音 (Cute Chew Munching)
 * 3. 星光和弦與豎琴琶音奇蹟蛻變盛典 (Starry Chord & Harp Metamorphosis)
 * 4. 閃亮成就音與氣泡提示音 (Sparkles & Bubble Pop)
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastSoundIndex = -1;
    this.initContext();
  }

  initContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.initContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * 1. 摸摸撒嬌多樣化清脆萌系音效 (每次點擊隨機切換不同清脆音效)
   * 包含：
   * (1) 貓咪呼嚕與清脆水滴音 (Purr & Dew Drop)
   * (2) 夢幻八音盒星光鐘琴 (Starry Music Box)
   * (3) 萌寵彈簧啾啾叫 (Cute Spring Squeak)
   * (4) 愛心綻放浪漫豎琴琶音 (Heart Bloom Harp)
   * (5) 七彩歡樂氣泡啵啵樂 (Bouncy Bubble Trio)
   */
  playPetCuddleSound(effectIndex = -1) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const soundEffects = [
      () => this.playPurrChirp(),     // 1. 貓咪呼嚕與清脆水滴音
      () => this.playSparkleChime(),  // 2. 夢幻八音盒星光鐘琴
      () => this.playCuteSqueak(),    // 3. 萌寵彈簧啾啾叫
      () => this.playHeartHarp(),     // 4. 愛心綻放浪漫豎琴
      () => this.playBubbleTrio()     // 5. 七彩歡樂氣泡啵啵樂
    ];

    let choice = effectIndex;
    if (choice < 0 || choice >= soundEffects.length) {
      // 避免連續兩次點擊播放完全相同的音效，每次都有新鮮感
      do {
        choice = Math.floor(Math.random() * soundEffects.length);
      } while (choice === this.lastSoundIndex && soundEffects.length > 1);
      this.lastSoundIndex = choice;
    }

    try {
      soundEffects[choice]();
    } catch (e) {
      console.warn('Error playing pet sound effect', e);
    }

    return choice;
  }

  // 向前相容性方法
  playPurr() {
    return this.playPetCuddleSound();
  }

  /**
   * 音效 1: 貓咪軟萌呼嚕與清脆水滴音 (Purr & Dew Drop)
   */
  playPurrChirp() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 柔和低頻呼嚕咕嚕聲 (Purring rumble)
    const purrOsc = this.ctx.createOscillator();
    const purrGain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    purrOsc.type = 'triangle';
    purrOsc.frequency.setValueAtTime(85, now);
    purrOsc.frequency.exponentialRampToValueAtTime(115, now + 0.35);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(22, now);
    lfoGain.gain.setValueAtTime(28, now);

    lfo.connect(purrOsc.frequency);
    purrOsc.connect(purrGain);

    purrGain.gain.setValueAtTime(0.01, now);
    purrGain.gain.linearRampToValueAtTime(0.16, now + 0.08);
    purrGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    purrGain.connect(this.ctx.destination);
    purrOsc.start(now);
    lfo.start(now);
    purrOsc.stop(now + 0.5);
    lfo.stop(now + 0.5);

    // 清脆甜美水滴躍動音 (Crisp Dewdrop)
    const dropOsc = this.ctx.createOscillator();
    const dropGain = this.ctx.createGain();

    dropOsc.type = 'sine';
    dropOsc.frequency.setValueAtTime(750, now + 0.06);
    dropOsc.frequency.exponentialRampToValueAtTime(1250, now + 0.18);
    dropOsc.frequency.exponentialRampToValueAtTime(920, now + 0.32);

    dropGain.gain.setValueAtTime(0.001, now + 0.06);
    dropGain.gain.linearRampToValueAtTime(0.18, now + 0.12);
    dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    dropOsc.connect(dropGain);
    dropGain.connect(this.ctx.destination);

    dropOsc.start(now + 0.06);
    dropOsc.stop(now + 0.4);
  }

  /**
   * 音效 2: 夢幻八音盒星光鐘琴 (Starry Glockenspiel / Music Box)
   */
  playSparkleChime() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // C6, E6, G6, C7 (1046.5Hz, 1318.5Hz, 1568Hz, 2093Hz)
    const notes = [1046.5, 1318.5, 1568.0, 2093.0];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.15, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.48);
    });
  }

  /**
   * 音效 3: 萌寵彈簧啾啾叫 (Cute Spring Squeak)
   */
  playCuteSqueak() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 第一聲輕快的「啾~」 (Upward Squeak)
    const squeakOsc = this.ctx.createOscillator();
    const squeakGain = this.ctx.createGain();

    squeakOsc.type = 'sine';
    squeakOsc.frequency.setValueAtTime(620, now);
    squeakOsc.frequency.exponentialRampToValueAtTime(1950, now + 0.08);

    squeakGain.gain.setValueAtTime(0.01, now);
    squeakGain.gain.linearRampToValueAtTime(0.18, now + 0.03);
    squeakGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    squeakOsc.connect(squeakGain);
    squeakGain.connect(this.ctx.destination);

    squeakOsc.start(now);
    squeakOsc.stop(now + 0.18);

    // 伴隨彈性的彈簧微顫音 (Spring Boing)
    const springOsc = this.ctx.createOscillator();
    const springGain = this.ctx.createGain();
    const springLfo = this.ctx.createOscillator();
    const springLfoGain = this.ctx.createGain();

    springOsc.type = 'triangle';
    springOsc.frequency.setValueAtTime(1200, now + 0.08);
    springOsc.frequency.exponentialRampToValueAtTime(780, now + 0.32);

    springLfo.type = 'sine';
    springLfo.frequency.setValueAtTime(26, now + 0.08);
    springLfoGain.gain.setValueAtTime(80, now + 0.08);

    springLfo.connect(springOsc.frequency);
    springOsc.connect(springGain);

    springGain.gain.setValueAtTime(0.001, now + 0.08);
    springGain.gain.linearRampToValueAtTime(0.12, now + 0.12);
    springGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    springGain.connect(this.ctx.destination);

    springOsc.start(now + 0.08);
    springLfo.start(now + 0.08);
    springOsc.stop(now + 0.38);
    springLfo.stop(now + 0.38);
  }

  /**
   * 音效 4: 愛心綻放浪漫豎琴琶音 (Heart Bloom Harp)
   */
  playHeartHarp() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // F5, A5, C6, E6, A6 (溫暖甜美愛心和弦)
    const notes = [698.46, 880.00, 1046.50, 1318.51, 1760.00];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + idx * 0.055;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.16, noteTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0006, noteTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.65);
    });
  }

  /**
   * 音效 5: 七彩歡樂氣泡啵啵樂 (Bouncy Bubble Trio)
   */
  playBubbleTrio() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // 三顆連鎖快樂氣泡 (580Hz, 880Hz, 1350Hz)
    const bubbles = [580, 880, 1350];
    bubbles.forEach((baseFreq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const bubbleTime = now + idx * 0.075;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, bubbleTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, bubbleTime + 0.07);

      gain.gain.setValueAtTime(0.001, bubbleTime);
      gain.gain.linearRampToValueAtTime(0.19, bubbleTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, bubbleTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(bubbleTime);
      osc.stop(bubbleTime + 0.09);
    });
  }

  /**
   * 2. 運動能量餵食咀嚼音 (Cute Chewing Munch)
   */
  playChew() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bites = [0, 0.14, 0.28]; // 三下可愛咀嚼

    bites.forEach((offset, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 420 + idx * 40;
      osc.frequency.setValueAtTime(baseFreq, now + offset);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, now + offset + 0.09);

      gain.gain.setValueAtTime(0.15, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.005, now + offset + 0.11);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.12);
    });

    // 咀嚼結束時的滿足小叮鈴 (Sparkle burp / happy chime)
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(880, now + 0.4);
    chime.frequency.exponentialRampToValueAtTime(1320, now + 0.55);

    chimeGain.gain.setValueAtTime(0.01, now + 0.4);
    chimeGain.gain.linearRampToValueAtTime(0.09, now + 0.46);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    chime.connect(chimeGain);
    chimeGain.connect(this.ctx.destination);

    chime.start(now + 0.4);
    chime.stop(now + 0.72);
  }

  /**
   * 3. 星光和弦與豎琴琶音奇蹟蛻變盛典 (Starry Harp Arpeggio & Miracle Chord)
   */
  playEvolutionMiracle() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 豎琴琶音音階 (Cmaj9 柔美上行琶音: C4, E4, G4, B4, D5, G5, B5, D6, G6)
    const harpNotes = [
      261.63, // C4
      329.63, // E4
      392.00, // G4
      493.88, // B4
      587.33, // D5
      783.99, // G5
      987.77, // B5
      1174.66,// D6
      1567.98 // G6
    ];

    harpNotes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.13;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 1.3);
    });

    // 盛典背景星光長和弦 (Shimmering Celestial Chord)
    const chordTime = now + 0.9;
    const chordNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    chordNotes.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, chordTime);

      gain.gain.setValueAtTime(0.001, chordTime);
      gain.gain.linearRampToValueAtTime(0.08, chordTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 2.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(chordTime);
      osc.stop(chordTime + 3.0);
    });
  }

  /**
   * 4. 閃爍星星小音效 (Sparkle)
   */
  playSparkle() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [880, 1174.66, 1760];

    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gain.gain.setValueAtTime(0.01, now + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.4);
    });
  }

  /**
   * 5. 氣泡泡泡點擊聲 (Bubble Pop)
   */
  playPop() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }
}

// 實例化全域音效控制器
var soundEngine = null;
if (typeof window !== 'undefined') {
  window.soundEngine = new SoundEngine();
  soundEngine = window.soundEngine;
}
