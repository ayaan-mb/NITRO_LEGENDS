const ensureStatusElement = () => {
  let status = document.getElementById('status');
  if (status) return status;

  status = document.createElement('p');
  status.id = 'status';
  status.textContent = 'Starting...';
  const hud = document.getElementById('hud');
  if (hud) hud.appendChild(status);
  return status;
};

const statusEl = ensureStatusElement();

const threeModuleCandidates = [
  'https://unpkg.com/three@0.165.0/build/three.module.js',
  'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js',
];

const importFirstAvailable = async (urls) => {
  let lastError = null;
  for (const url of urls) {
    try {
      return await import(url);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

const boot = async () => {
  try {
    statusEl.textContent = 'Loading engine...';
    const THREE = await importFirstAvailable(threeModuleCandidates);
    const { Game } = await import('./core/Game.js');
    const game = new Game(THREE);
    await game.start();
  } catch (error) {
    console.error('Nitro boot error:', error);
    statusEl.textContent = 'Game failed to load engine (CDN blocked).';
  }
};

boot();
