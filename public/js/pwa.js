// ===== PWA Service Worker Registration =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', reg.scope);
    } catch (e) {
      console.log('Service Worker registration skipped');
    }
  });
}

// ===== Install Prompt =====
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show install button if exists
  const btn = document.getElementById('btn-install-pwa');
  if (btn) btn.style.display = 'inline-flex';
});

function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choice) => {
    if (choice.outcome === 'accepted') console.log('PWA installed');
    deferredPrompt = null;
  });
}
