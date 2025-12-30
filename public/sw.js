self.addEventListener('install', (event) => {
  console.log('[PWA] Service Worker installing...');
});

self.addEventListener('activate', (event) => {
  console.log('[PWA] Service Worker activating...');
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through for now
});
