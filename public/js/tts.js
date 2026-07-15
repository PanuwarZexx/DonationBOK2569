// ===== Text-to-Speech เสียงประกาศ =====
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

function speakDonation(donation) {
  if (!soundEnabled) return;
  // เล่นเสียง chime ก่อน
  playChime();
  // พูดข้อความ
  setTimeout(() => {
    const text = `ขออนุโมทนาบุญ ${donation.donorName} บริจาค ${donation.amount} บาท`;
    speak(text);
  }, 800);
}

function speak(text, onEndCallback) {
  let callbackCalled = false;
  const triggerCallback = () => {
    if (callbackCalled) return;
    callbackCalled = true;
    if (onEndCallback) onEndCallback();
  };

  // 1. ใช้บราวเซอร์ SpeechSynthesis เป็นหลัก (เหมือนเมื่อวาน) เพื่อให้ดึงน้ำเสียงนุ่มนวลธรรมชาติวัยรุ่นออกมา
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 0.85; // ปรับจังหวะความเร็วให้นุ่มนวลน่าฟัง
    utterance.pitch = 1.0; // ระดับเสียง 1.0 (ให้ความเป็นวัยรุ่น นุ่มนวล ไม่ดัดทุ้มจนแหบ)
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    // ค้นหาเสียงกูเกิลภาษาไทยหลักก่อน เพราะนุ่มนวลที่สุด
    let thaiVoice = voices.find(v => v.lang.startsWith('th') && v.name.includes('Google'));
    if (!thaiVoice) {
      thaiVoice = voices.find(v => v.lang.startsWith('th'));
    }
    if (thaiVoice) utterance.voice = thaiVoice;

    utterance.onend = triggerCallback;
    utterance.onerror = (e) => {
      console.log("SpeechSynthesis error, falling back to Google Web TTS", e);
      fallbackGoogleTTS(text, triggerCallback);
    };

    window.speechSynthesis.speak(utterance);
  } else {
    // 2. หากไม่รองรับให้ใช้ Google Translate Web TTS สำรอง
    fallbackGoogleTTS(text, triggerCallback);
  }
}

function fallbackGoogleTTS(text, onEndCallback) {
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encodeURIComponent(text)}`;
  
  const audio = new Audio(ttsUrl);
  audio.volume = 1.0;
  
  audio.onended = onEndCallback;
  audio.onerror = onEndCallback;
  
  audio.play().catch(err => {
    console.log("Fallback Google TTS failed:", err);
    if (onEndCallback) onEndCallback();
  });
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
