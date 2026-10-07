// Web Audio API helper for alarm sound notification

let audioCtx: AudioContext | null = null;
let alarmInterval: NodeJS.Timeout | null = null;

export function playAlarmSound() {
  stopAlarmSound();

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = new AudioContextClass();

    const triggerChime = () => {
      if (!audioCtx || audioCtx.state === "closed") return;

      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;

      // First tone (D5 - 587.33 Hz)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Second tone (A5 - 880 Hz)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.15);
      gain2.gain.setValueAtTime(0.3, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.5);
    };

    triggerChime();
    alarmInterval = setInterval(triggerChime, 900);
  } catch (err) {
    console.error("Erro ao tocar som de alarme:", err);
  }
}

export function stopAlarmSound() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  if (audioCtx) {
    try {
      if (audioCtx.state !== "closed") {
        audioCtx.close();
      }
    } catch {
      // ignore
    }
    audioCtx = null;
  }
}
