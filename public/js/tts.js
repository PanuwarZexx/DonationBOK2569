// ===== Text-to-Speech เสียงประกาศ =====
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

function speakDonation(donation) {
  if (!soundEnabled) return;
  // เล่นเสียง chime ก่อน
  playChime();
  // พูดข้อความ
  setTimeout(() => {
    const text = `ขออนุโมทนาบุญ คุณ${donation.donorName} บริจาค ${donation.amount} บาท`;
    speak(text);
  }, 800);
}

function speak(text, onEndCallback) {
  // ใช้ Google Translate TTS เป็นหลักเพื่อคุณภาพเสียงสูงและรองรับอุปกรณ์สมาร์ททีวีทุกประเภท
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encodeURIComponent(text)}`;
  
  const audio = new Audio(ttsUrl);
  audio.volume = 1.0;
  
  let callbackCalled = false;
  const triggerCallback = () => {
    if (callbackCalled) return;
    callbackCalled = true;
    if (onEndCallback) onEndCallback();
  };

  audio.onended = triggerCallback;
  audio.onerror = (e) => {
    console.log("Google TTS error, falling back to SpeechSynthesis", e);
    fallbackSpeechSynthesis(text, triggerCallback);
  };
  
  audio.play().catch(err => {
    console.log("Audio play blocked or failed, falling back to SpeechSynthesis:", err);
    fallbackSpeechSynthesis(text, triggerCallback);
  });
}

function fallbackSpeechSynthesis(text, onEndCallback) {
  if (!('speechSynthesis' in window)) {
    if (onEndCallback) onEndCallback();
    return;
  }
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'th-TH';
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  const voices = window.speechSynthesis.getVoices();
  const thaiVoice = voices.find(v => v.lang.startsWith('th'));
  if (thaiVoice) utterance.voice = thaiVoice;
  
  utterance.onend = () => {
    if (onEndCallback) onEndCallback();
  };
  utterance.onerror = () => {
    if (onEndCallback) onEndCallback();
  };
  
  window.speechSynthesis.speak(utterance);
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) { /* AudioContext not available */ }
}

// Toggle sound
function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('soundEnabled', soundEnabled);
  updateSoundButton();
  if (soundEnabled) {
    playChime();
    setTimeout(() => {
      speak("ระบบเสียงประกาศเปิดใช้งานแล้ว");
    }, 600);
  }
}

function updateSoundButton() {
  const btn = document.getElementById('sound-toggle');
  const icon = document.getElementById('sound-icon');
  if (!btn || !icon) return;
  btn.classList.toggle('active', soundEnabled);
  icon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  updateSoundButton();
  const btn = document.getElementById('sound-toggle');
  if (btn) btn.addEventListener('click', toggleSound);
  // Load voices
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
});
