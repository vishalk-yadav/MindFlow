// Zero-dependency pure DOM confetti animation helper
export default function confetti({ particleCount = 40, spread = 60, origin = { y: 0.7 } } = {}) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4'];
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  document.body.appendChild(container);

  const startY = (origin.y || 0.7) * window.innerHeight;
  const startX = window.innerWidth / 2;

  for (let i = 0; i < particleCount; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.floor(Math.random() * 8) + 6;

    el.style.position = 'absolute';
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.backgroundColor = color;
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.transition = 'all 1.5s cubic-bezier(0.25, 1, 0.5, 1)';
    container.appendChild(el);

    // Random velocity & angle
    const angle = (Math.random() - 0.5) * (spread * (Math.PI / 180)) - Math.PI / 2;
    const distance = Math.random() * 250 + 100;
    const targetX = startX + Math.cos(angle) * distance;
    const targetY = startY + Math.sin(angle) * distance + 120; // gravity effect

    requestAnimationFrame(() => {
      el.style.transform = `translate3d(${targetX - startX}px, ${targetY - startY}px, 0) rotate(${Math.random() * 720}deg)`;
      el.style.opacity = '0';
    });
  }

  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 1800);
}
