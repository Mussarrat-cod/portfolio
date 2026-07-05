document.getElementById('year').textContent = new Date().getFullYear();

/* ============ THEME TOGGLE ============ */
(function themeInit() {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const stored = localStorage.getItem('mk-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initial = stored || (prefersLight ? 'light' : 'dark');
  root.setAttribute('data-theme', initial);
  toggle.setAttribute('aria-pressed', initial === 'light');
  toggle.setAttribute('aria-label', initial === 'light' ? 'Switch to dark theme' : 'Switch to light theme');

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('mk-theme', next);
    toggle.setAttribute('aria-pressed', next === 'light');
    toggle.setAttribute('aria-label', next === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  });
})();

/* ============ NAV SCROLL STATE ============ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 20 ? '0 6px 24px rgba(0,0,0,0.15)' : 'none';
});

/* ============ TYPING CODE ON LAPTOP SCREEN ============ */
(function typedCode() {
  const el = document.getElementById('typedCode');
  if (!el) return;
  const lines = [
    'const you = new Recruiter();',
    'you.hire(mussarrat);',
    '// building something great...',
    'ship(); // always be shipping'
  ];
  let lineIndex = 0, charIndex = 0, current = '';
  const speed = 45;

  function type() {
    if (lineIndex >= lines.length) {
      setTimeout(() => { el.textContent = ''; lineIndex = 0; charIndex = 0; current = ''; type(); }, 1800);
      return;
    }
    const line = lines[lineIndex];
    if (charIndex <= line.length) {
      current = lines.slice(0, lineIndex).join('\n') + (lineIndex > 0 ? '\n' : '') + line.slice(0, charIndex);
      el.textContent = current + '▌';
      charIndex++;
      setTimeout(type, speed);
    } else {
      lineIndex++;
      charIndex = 0;
      setTimeout(type, 350);
    }
  }
  type();
})();

/* ============ SCROLL REVEALS ============ */
const revealTargets = document.querySelectorAll('.section__head, .project-card, .timeline__item, .skill-group, .stat, .contact');
revealTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealTargets.forEach(el => io.observe(el));

/* ============ DEBUG-THE-CODE GAME ============ */
(function debugGame() {
  const field = document.getElementById('gameField');
  const startBtn = document.getElementById('startGame');
  const scoreEl = document.getElementById('scoreVal');
  const timeEl = document.getElementById('timeVal');
  const hintEl = document.getElementById('gameHint');

  const DURATION = 20;
  let score = 0, timeLeft = DURATION, spawnTimer = null, countdownTimer = null, active = false;

  function randomPosition() {
    const w = field.clientWidth, h = field.clientHeight;
    return {
      x: Math.max(10, Math.random() * (w - 40)),
      y: Math.max(10, Math.random() * (h - 40))
    };
  }

  function spawnBug() {
    const bug = document.createElement('button');
    bug.className = 'bug';
    bug.type = 'button';
    bug.setAttribute('aria-label', 'Squash bug');
    bug.textContent = '🐛';
    const pos = randomPosition();
    bug.style.left = pos.x + 'px';
    bug.style.top = pos.y + 'px';

    const timeout = setTimeout(() => bug.remove(), 1400);

    bug.addEventListener('click', () => {
      score++;
      scoreEl.textContent = score;
      clearTimeout(timeout);
      bug.remove();
    });

    field.appendChild(bug);
  }

  function endGame() {
    active = false;
    clearInterval(spawnTimer);
    clearInterval(countdownTimer);
    field.querySelectorAll('.bug').forEach(b => b.remove());
    hintEl.textContent = `Sprint over — you squashed ${score} bug${score === 1 ? '' : 's'}. Nice work.`;
    startBtn.textContent = 'Play again';
  }

  function startGame() {
    if (active) return;
    active = true;
    score = 0;
    timeLeft = DURATION;
    scoreEl.textContent = score;
    timeEl.textContent = timeLeft;
    hintEl.textContent = 'Click the 🐛 as they appear.';
    startBtn.textContent = 'Restart';

    spawnTimer = setInterval(spawnBug, 750);
    countdownTimer = setInterval(() => {
      timeLeft--;
      timeEl.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  startBtn.addEventListener('click', () => {
    clearInterval(spawnTimer);
    clearInterval(countdownTimer);
    field.querySelectorAll('.bug').forEach(b => b.remove());
    active = false;
    startGame();
  });
})();
