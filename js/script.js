import jarvisMd from '../Blogs/Jarvis.md?raw';
import mvjMd from '../Blogs/MVJLaunchpad.md?raw';

document.getElementById('year').textContent = new Date().getFullYear();

/* ============ STARFIELD BACKGROUND ============ */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  const count = 150;
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  });

  function initStars() {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * width,
        r: 0.5 + Math.random() * 1.0
      });
    }
  }

  initStars();

  function animate() {
    ctx.fillStyle = '#080b14';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < count; i++) {
      const s = stars[i];
      s.z -= 1.2;

      if (s.z <= 0) {
        s.z = width;
        s.x = (Math.random() - 0.5) * width;
        s.y = (Math.random() - 0.5) * height;
      }

      const k = 300 / s.z;
      const px = s.x * k + cx;
      const py = s.y * k + cy;

      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        const size = s.r * k;
        const opacity = Math.min(1, (1 - s.z / width) * 1.5);
        ctx.fillStyle = `rgba(79, 227, 232, ${opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(px, py, size > 3 ? 3 : size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ============ NAVIGATION TOGGLE ============ */
(function initNav() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.textContent = '☰';
      });
    });

    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.textContent = '☰';
      }
    });
  }
})();

/* ============ BOOT SEQUENCE & ROLE CYCLE ============ */
(function initRoleCycling() {
  const bootLine = document.getElementById('bootLine');
  const roleCycle = document.getElementById('roleCycle');

  if (!bootLine && !roleCycle) return;

  const bootMessages = [
    'MK_OS [Version 2.0.26]',
    '(c) Mussarrat Kittur. All rights reserved.',
    'Initializing systems loadout...',
    'Core kernel loaded successfully.',
    'Welcome back, Operator.'
  ];

  const roles = [
    'Full-Stack Developer',
    'CS Undergrad @ MVJCE',
    'AI & ML Enthusiast',
    'Systems Builder',
    'Tech Club President (Inscribe)'
  ];

  let bootIndex = 0;
  
  function typeBoot() {
    if (bootIndex < bootMessages.length) {
      const text = bootMessages[bootIndex];
      let charIndex = 0;
      bootLine.textContent = '> ';
      
      function typeChar() {
        if (charIndex < text.length) {
          bootLine.textContent += text[charIndex];
          charIndex++;
          setTimeout(typeChar, 25);
        } else {
          bootIndex++;
          setTimeout(typeBoot, 800);
        }
      }
      typeChar();
    } else {
      bootLine.innerHTML = '<span style="color:var(--cyan)">[ SYSTEMS ONLINE ]</span>';
      startRoleCycle();
    }
  }

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function startRoleCycle() {
    if (!roleCycle) return;
    
    function typeRole() {
      const currentRole = roles[roleIndex];
      if (isDeleting) {
        roleCycle.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
      } else {
        roleCycle.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = isDeleting ? 35 : 70;

      if (!isDeleting && charIndex === currentRole.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 500;
      }

      setTimeout(typeRole, typeSpeed);
    }
    typeRole();
  }

  if (bootLine) {
    typeBoot();
  } else {
    startRoleCycle();
  }
})();

/* ============ DYNAMIC BLOG GENERATION ============ */
(function initBlog() {
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function inlineMd(s) {
    s = escapeHtml(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return s;
  }

  function mdToHtml(md) {
    const lines = md.split('\n');
    let html = '';
    let inCode = false;
    let codeBuf = [];
    let listOpen = false;

    const closeList = () => { if (listOpen) { html += '</ul>'; listOpen = false; } };

    for (const line of lines) {
      if (line.startsWith('```')) {
        if (!inCode) { inCode = true; codeBuf = []; closeList(); }
        else { inCode = false; html += '<pre><code>' + escapeHtml(codeBuf.join('\n')) + '</code></pre>'; }
        continue;
      }
      if (inCode) { codeBuf.push(line); continue; }

      if (line.startsWith('### ')) { closeList(); html += '<h4>' + inlineMd(line.slice(4)) + '</h4>'; }
      else if (line.startsWith('## ')) { closeList(); html += '<h3>' + inlineMd(line.slice(3)) + '</h3>'; }
      else if (line.startsWith('# ')) { closeList(); html += '<h2>' + inlineMd(line.slice(2)) + '</h2>'; }
      else if (/^[-*] /.test(line)) { if (!listOpen) { html += '<ul>'; listOpen = true; } html += '<li>' + inlineMd(line.slice(2)) + '</li>'; }
      else if (line.trim() === '') { closeList(); }
      else { closeList(); html += '<p>' + inlineMd(line) + '</p>'; }
    }
    closeList();
    if (inCode) html += '<pre><code>' + escapeHtml(codeBuf.join('\n')) + '</code></pre>';
    return html;
  }

  const articles = {
    jarvis: {
      title: 'An Inside Look: AI Virtual Assistant (Jarvis Clone)',
      date: 'Apr 28, 2026',
      readTime: '8 min read',
      body: jarvisMd
    },
    mvj: {
      title: 'Building a College Placement Portal with MERN & Firebase',
      date: 'Jun 12, 2026',
      readTime: '5 min read',
      body: mvjMd
    }
  };

  const posts = [
    {
      title: 'Building a College Placement Portal with MERN & Firebase',
      date: 'Jun 12, 2026',
      readTime: '5 min read',
      summary: 'A deep dive into building MVJ Launchpad—connecting 1000+ students and recruiters in real-time, integrating resume parsing, and handling high-concurrency interview scheduling.',
      modal: 'mvj'
    },
    {
      title: 'An Inside Look: AI Virtual Assistant (Jarvis Clone)',
      date: 'Apr 28, 2026',
      readTime: '8 min read',
      summary: 'Designing a desktop assistant in Python with speech recognition, customizable task pipes, and offline fallback models. Refactoring modular pipelines for extensibility.',
      modal: 'jarvis'
    },
    {
      title: 'Optimizing Machine Learning Models for Loan Prediction',
      date: 'Mar 15, 2026',
      readTime: '6 min read',
      summary: 'Evaluating Logistic Regression, Random Forests, and SVMs. How feature engineering and balancing datasets raised our model precision and recall by 12% on skewed financial logs.',
      link: '#'
    }
  ];

  let modalEl = null;
  function openArticle(key) {
    const art = articles[key];
    if (!art) return;
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.className = 'blog-modal';
      modalEl.innerHTML = `
        <div class="blog-modal-panel">
          <button class="blog-modal-close" aria-label="Close article">×</button>
          <div class="blog-modal-meta"></div>
          <div class="blog-body"></div>
        </div>`;
      document.body.appendChild(modalEl);
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl || e.target.classList.contains('blog-modal-close')) closeArticle();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeArticle(); });
    }
    modalEl.querySelector('.blog-modal-meta').innerHTML =
      `<span>[ ${art.date} ]</span><span>[ ${art.readTime} ]</span>`;
    modalEl.querySelector('.blog-modal-meta').insertAdjacentHTML('afterbegin',
      `<h2>${art.title}</h2>`);
    modalEl.querySelector('.blog-body').innerHTML = mdToHtml(art.body);
    modalEl.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeArticle() {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    document.body.style.overflow = '';
  }

  const blogGrid = document.getElementById('blogGrid');
  if (blogGrid) {
    blogGrid.innerHTML = '';

    posts.forEach(post => {
      const card = document.createElement('article');
      card.className = 'blog-card reveal';
      const action = post.modal
        ? `<a href="#" class="read" data-modal="${post.modal}">Read Transmission →</a>`
        : `<a href="${post.link}" class="read" ${post.link.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>Read Transmission →</a>`;
      card.innerHTML = `
        <div class="blog-meta">
          <span>[ ${post.date} ]</span>
          <span>[ ${post.readTime} ]</span>
        </div>
        <h3>${post.title}</h3>
        <p>${post.summary}</p>
        ${action}
      `;
      blogGrid.appendChild(card);
    });

    blogGrid.addEventListener('click', (e) => {
      const link = e.target.closest('[data-modal]');
      if (link) { e.preventDefault(); openArticle(link.dataset.modal); }
    });
  }
})();

/* ============ SCROLL REVEALS ============ */
(function initScrollReveals() {
  const revealTargets = document.querySelectorAll('.reveal, .t-item');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealTargets.forEach(el => io.observe(el));
})();

/* ============ GAME CONTROLLER & ENGINES ============ */
(function gameSystem() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const overlay = document.getElementById('gameOverlay');
  const gameSelect = document.getElementById('gameSelect');
  
  const scoreVal = document.getElementById('scoreVal');
  const bestVal = document.getElementById('bestVal');
  const levelVal = document.getElementById('levelVal');

  const gameSub = document.getElementById('gameSub');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc = document.getElementById('overlayDesc');
  const overlayKeys = document.getElementById('overlayKeys');

  let active = false;
  let gameMode = 'orbit'; // 'orbit', 'datastream', or 'vectordash'
  let gameLoopId = null;
  let score = 0;
  let level = 1;
  let bestScores = {
    orbit: parseInt(localStorage.getItem('mk-orbit-run-best')) || 0,
    datastream: parseInt(localStorage.getItem('mk-data-stream-best')) || 0,
    vectordash: parseInt(localStorage.getItem('mk-vector-dash-best')) || 0
  };

  // Keyboard controls
  let keys = {};
  window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (active && ['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'a', 'd', 'w', 's'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  // Mode descriptions
  const modeData = {
    orbit: {
      title: 'Orbit Run',
      sub: 'Pilot the drone, dodge the incoming exceptions, collect semicolons for points. Arrow keys / A·D, or drag on mobile.',
      overlayTitle: 'ORBIT RUN',
      overlayDesc: 'Dodge the red bugs. Grab the cyan semicolons. Survive as long as you can — speed ramps up over time.',
      keysHTML: '<span class="key">←</span><span class="key">→</span><span class="key">A</span><span class="key">D</span>'
    },
    datastream: {
      title: 'Data Stream',
      sub: 'Steer the data stream packet inside the grid. Consume memory addresses, avoid the firewall blocks & self-collision. Arrow keys / W·A·S·D, or swipe on mobile.',
      overlayTitle: 'DATA STREAM',
      overlayDesc: 'Collect glowing amber semicolons to grow. Avoid running into walls, your own stream, or flashing red firewall nodes.',
      keysHTML: '<span class="key">↑</span><span class="key">↓</span><span class="key">←</span><span class="key">→</span><span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span>'
    },
    vectordash: {
      title: 'Vector Dash',
      sub: 'Jump over spikes and obstacles in sync with the data rhythm. Reach 100% to complete the build. Space / Up Arrow / Click to jump.',
      overlayTitle: 'VECTOR DASH',
      overlayDesc: 'Hold or tap Space / Up Arrow / Click to jump. Time your jumps to clear neon firewall spikes. Survive to 100%!',
      keysHTML: '<span class="key">Space</span><span class="key">↑</span><span class="key">Click</span>'
    }
  };

  function updateHUD() {
    if (scoreVal) {
      scoreVal.textContent = (gameMode === 'vectordash') ? score + '%' : score;
    }
    if (levelVal) {
      levelVal.textContent = (gameMode === 'vectordash') ? 'SYS' : level;
    }
    if (bestVal) {
      bestVal.textContent = (gameMode === 'vectordash') ? bestScores[gameMode] + '%' : bestScores[gameMode];
    }
  }

  function setMode(mode) {
    stopCurrentGame();
    gameMode = mode;
    
    // Update texts
    const data = modeData[mode];
    if (gameSub) gameSub.textContent = data.sub;
    const activeGameSelectorText = document.getElementById('activeGameSelectorText');
    if (activeGameSelectorText) activeGameSelectorText.textContent = data.title;
    if (overlayTitle) overlayTitle.textContent = data.overlayTitle;
    if (overlayDesc) overlayDesc.textContent = data.overlayDesc;
    if (overlayKeys) overlayKeys.innerHTML = data.keysHTML;

    // Reset HUD
    score = 0;
    level = 1;
    updateHUD();

    // Show overlay
    if (overlay) {
      overlay.style.display = 'flex';
      const btn = overlay.querySelector('button');
      if (btn) btn.textContent = 'Start Simulation';
    }

    drawEmptyGrid();
  }

  function drawEmptyGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameMode === 'vectordash') {
      // Vector Dash base floor
      ctx.strokeStyle = '#25314d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 80);
      ctx.lineTo(canvas.width, canvas.height - 80);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#141d33';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    }
  }

  if (gameSelect) {
    gameSelect.addEventListener('change', (e) => {
      setMode(e.target.value);
    });
  }

  /* ------------------- ORBIT RUN STATE ------------------- */
  let orbitPlayerX = canvas.width / 2;
  const orbitPlayerY = canvas.height - 40;
  const orbitPlayerSize = 16;
  let orbitObstacles = [];
  let orbitItems = [];
  let orbitParticles = [];
  let orbitBaseSpeed = 2.5;
  const EXCEPTION_TYPES = ['NullPointer', 'SyntaxError', 'TypeError', 'StackOverflow', '404', 'ReferenceError'];

  function initOrbitRun() {
    score = 0;
    level = 1;
    orbitPlayerX = canvas.width / 2;
    orbitObstacles = [];
    orbitItems = [];
    orbitParticles = [];
    orbitBaseSpeed = 2.5;
  }

  function updateOrbitRun() {
    const speed = 7;
    if (keys['a'] || keys['arrowleft']) orbitPlayerX -= speed;
    if (keys['d'] || keys['arrowright']) orbitPlayerX += speed;
    if (orbitPlayerX < orbitPlayerSize) orbitPlayerX = orbitPlayerSize;
    if (orbitPlayerX > canvas.width - orbitPlayerSize) orbitPlayerX = canvas.width - orbitPlayerSize;

    if (Math.random() < 0.035) {
      const label = EXCEPTION_TYPES[Math.floor(Math.random() * EXCEPTION_TYPES.length)];
      ctx.font = '11px "JetBrains Mono", monospace';
      const labelWidth = ctx.measureText(label).width;
      orbitObstacles.push({
        x: Math.random() * (canvas.width - 100) + 50,
        y: -20,
        vy: orbitBaseSpeed + Math.random() * 1.5 + (level * 0.3),
        label: label,
        width: labelWidth + 12,
        height: 20
      });
    }

    if (Math.random() < 0.02) {
      orbitItems.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -20,
        vy: orbitBaseSpeed + 1 + (level * 0.25),
        size: 10
      });
    }

    for (let i = orbitObstacles.length - 1; i >= 0; i--) {
      const o = orbitObstacles[i];
      o.y += o.vy;
      const rect = { x: o.x, y: o.y, width: o.width, height: o.height };
      if (checkCircleRectCollision(orbitPlayerX, orbitPlayerY, orbitPlayerSize, rect)) {
        triggerGameOver();
        return;
      }
      if (o.y > canvas.height + 20) orbitObstacles.splice(i, 1);
    }

    for (let i = orbitItems.length - 1; i >= 0; i--) {
      const item = orbitItems[i];
      item.y += item.vy;
      const dist = Math.hypot(orbitPlayerX - item.x, orbitPlayerY - item.y);
      if (dist < orbitPlayerSize + item.size) {
        score++;
        updateHUD();
        if (score > 0 && score % 5 === 0) {
          level++;
          updateHUD();
          spawnParticles(orbitPlayerX, orbitPlayerY, '#ffb454');
        } else {
          spawnParticles(item.x, item.y, '#4fe3e8');
        }
        orbitItems.splice(i, 1);
        continue;
      }
      if (item.y > canvas.height + 20) orbitItems.splice(i, 1);
    }

    updateParticles(orbitParticles);
  }

  function drawOrbitRun() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEmptyGrid();

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#4fe3e8';
    if (Math.random() > 0.3) {
      ctx.fillStyle = '#ffb454';
      ctx.beginPath();
      ctx.moveTo(orbitPlayerX - 6, orbitPlayerY + 12);
      ctx.lineTo(orbitPlayerX + 6, orbitPlayerY + 12);
      ctx.lineTo(orbitPlayerX, orbitPlayerY + 22 + Math.random() * 6);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#e7ecf6';
    ctx.strokeStyle = '#4fe3e8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(orbitPlayerX, orbitPlayerY - 14);
    ctx.lineTo(orbitPlayerX - 12, orbitPlayerY + 10);
    ctx.lineTo(orbitPlayerX, orbitPlayerY + 4);
    ctx.lineTo(orbitPlayerX + 12, orbitPlayerY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = '#ff6b6b';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    orbitObstacles.forEach(o => {
      ctx.fillStyle = 'rgba(255, 107, 107, 0.15)';
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(o.x - o.width/2, o.y - o.height/2, o.width, o.height, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText(o.label, o.x, o.y);
    });

    ctx.shadowColor = '#4fe3e8';
    ctx.fillStyle = '#4fe3e8';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    orbitItems.forEach(item => {
      ctx.fillText(';', item.x, item.y);
    });

    ctx.shadowBlur = 0;
    orbitParticles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 * (p.life / 30), 0, Math.PI * 2);
      ctx.fill();
    });
  }


  /* ------------------- DATA STREAM (SNAKE) STATE ------------------- */
  const gridW = 32;
  const gridH = 21;
  const cellSize = 20;

  let snake = [];
  let snakeDir = 'right';
  let snakeNextDir = 'right';
  let snakeFood = {x: 0, y: 0};
  let firewallNodes = [];
  let snakeParticles = [];
  let lastTickTime = 0;

  function initDataStream() {
    score = 0;
    level = 1;
    snakeDir = 'right';
    snakeNextDir = 'right';
    snakeParticles = [];
    firewallNodes = [];
    snake = [
      {x: 10, y: 10},
      {x: 9, y: 10},
      {x: 8, y: 10}
    ];
    spawnSnakeFood();
  }

  function spawnSnakeFood() {
    let valid = false;
    while (!valid) {
      snakeFood.x = Math.floor(Math.random() * gridW);
      snakeFood.y = Math.floor(Math.random() * gridH);
      valid = !snake.some(segment => segment.x === snakeFood.x && segment.y === snakeFood.y);
      if (valid) {
        valid = !firewallNodes.some(node => node.x === snakeFood.x && node.y === snakeFood.y);
      }
    }
  }

  function spawnFirewallNode() {
    let valid = false;
    let attempts = 0;
    let node = {x: 0, y: 0};
    while (!valid && attempts < 100) {
      node.x = Math.floor(Math.random() * gridW);
      node.y = Math.floor(Math.random() * gridH);
      attempts++;
      const head = snake[0];
      const dist = Math.hypot(head.x - node.x, head.y - node.y);
      if (dist < 4) continue;

      const onSnake = snake.some(segment => segment.x === node.x && segment.y === node.y);
      const onFood = (node.x === snakeFood.x && node.y === snakeFood.y);
      const onOtherNode = firewallNodes.some(other => other.x === node.x && other.y === node.y);

      if (!onSnake && !onFood && !onOtherNode) {
        valid = true;
      }
    }
    if (valid) firewallNodes.push(node);
  }

  function updateDataStream(timestamp) {
    if ((keys['w'] || keys['arrowup']) && snakeDir !== 'down') snakeNextDir = 'up';
    if ((keys['s'] || keys['arrowdown']) && snakeDir !== 'up') snakeNextDir = 'down';
    if ((keys['a'] || keys['arrowleft']) && snakeDir !== 'right') snakeNextDir = 'left';
    if ((keys['d'] || keys['arrowright']) && snakeDir !== 'left') snakeNextDir = 'right';

    updateParticles(snakeParticles);

    const tickInterval = Math.max(50, 140 - (level * 8));
    if (timestamp - lastTickTime < tickInterval) return;
    lastTickTime = timestamp;

    snakeDir = snakeNextDir;
    const head = {...snake[0]};
    if (snakeDir === 'up') head.y -= 1;
    if (snakeDir === 'down') head.y += 1;
    if (snakeDir === 'left') head.x -= 1;
    if (snakeDir === 'right') head.x += 1;

    if (head.x < 0 || head.x >= gridW || head.y < 0 || head.y >= gridH) {
      triggerGameOver();
      return;
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      triggerGameOver();
      return;
    }

    if (firewallNodes.some(node => node.x === head.x && node.y === head.y)) {
      triggerGameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === snakeFood.x && head.y === snakeFood.y) {
      score++;
      updateHUD();
      spawnParticles(head.x * cellSize + cellSize/2, head.y * cellSize + cellSize/2, '#4fe3e8');

      if (score > 0 && score % 5 === 0) {
        level++;
        updateHUD();
        spawnFirewallNode();
        spawnParticles(head.x * cellSize + cellSize/2, head.y * cellSize + cellSize/2, '#ffb454');
      }
      spawnSnakeFood();
    } else {
      snake.pop();
    }
  }

  function drawDataStream() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#0d1626';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += cellSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.strokeStyle = '#0d1626'; ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += cellSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff6b6b';
    ctx.fillStyle = '#ff6b6b';
    firewallNodes.forEach(node => {
      ctx.fillRect(node.x * cellSize + 2, node.y * cellSize + 2, cellSize - 4, cellSize - 4);
    });

    ctx.shadowColor = '#ffb454';
    ctx.fillStyle = '#ffb454';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(';', snakeFood.x * cellSize + cellSize/2, snakeFood.y * cellSize + cellSize/2);

    ctx.shadowColor = '#4fe3e8';
    snake.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#4fe3e8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2, 4);
        ctx.fill();
        ctx.stroke();
      } else {
        const opacity = Math.max(0.2, 1 - (index / snake.length));
        ctx.fillStyle = `rgba(79, 227, 232, ${opacity})`;
        ctx.fillRect(segment.x * cellSize + 2, segment.y * cellSize + 2, cellSize - 4, cellSize - 4);
      }
    });

    ctx.shadowBlur = 0;
    snakeParticles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 * (p.life / 30), 0, Math.PI * 2);
      ctx.fill();
    });
  }


  /* ------------------- VECTOR DASH STATE ------------------- */
  const floorY = canvas.height - 80;
  let dashPlayerY = floorY - 26;
  let dashVy = 0;
  const dashPlayerSize = 26;
  const dashGravity = 0.45;
  const dashJumpForce = -9.2;
  let dashIsGrounded = false;
  let dashRotation = 0;
  let dashRotationSpeed = 0;
  let dashDistance = 0;
  const dashVictoryDistance = 4000;
  let dashObstacles = [];
  let dashParticles = [];
  let dashSpeed = 4.2;
  let jumpRequested = false;

  function initVectorDash() {
    score = 0;
    level = 1;
    dashVy = 0;
    dashPlayerY = floorY - dashPlayerSize;
    dashIsGrounded = true;
    dashRotation = 0;
    dashRotationSpeed = 0;
    dashDistance = 0;
    dashParticles = [];
    dashSpeed = 4.2;

    // A predefined sequence of obstacles (easy configuration)
    dashObstacles = [
      { type: 'spike', x: 600 },
      { type: 'spike', x: 950 },
      { type: 'spike', x: 1300 },
      { type: 'block', x: 1600, y: floorY - 32, w: 70, h: 32 },
      { type: 'spike', x: 1950 },
      { type: 'double-spike', x: 2250 },
      { type: 'block', x: 2550, y: floorY - 36, w: 90, h: 36 },
      { type: 'spike', x: 2595, y: floorY - 58 },
      { type: 'spike', x: 2950 },
      { type: 'double-spike', x: 3250 },
      { type: 'spike', x: 3550 },
      { type: 'spike', x: 3800 }
    ];
  }

  function updateVectorDash() {
    const jumpInput = keys[' '] || keys['arrowup'] || jumpRequested;
    if (jumpInput && dashIsGrounded) {
      dashVy = dashJumpForce;
      dashIsGrounded = false;
      dashRotationSpeed = 0.08;
    }
    jumpRequested = false; 

    dashVy += dashGravity;
    dashPlayerY += dashVy;

    dashDistance += dashSpeed;
    score = Math.min(100, Math.floor((dashDistance / dashVictoryDistance) * 100));
    updateHUD();

    if (dashDistance >= dashVictoryDistance) {
      triggerVictory();
      return;
    }

    if (dashPlayerY >= floorY - dashPlayerSize) {
      dashPlayerY = floorY - dashPlayerSize;
      dashVy = 0;
      dashIsGrounded = true;
      dashRotation = Math.round(dashRotation / (Math.PI / 2)) * (Math.PI / 2);
      dashRotationSpeed = 0;
    }

    dashObstacles.forEach(o => {
      const ox = o.x - dashDistance;

      if (o.type === 'spike') {
        const sx = ox;
        const sy = o.y || floorY;
        if (100 + dashPlayerSize - 4 > sx - 10 && 100 + 4 < sx + 10 && dashPlayerY + dashPlayerSize > sy - 22 && dashPlayerY < sy) {
          triggerGameOver();
        }
      } else if (o.type === 'double-spike') {
        const sx = ox;
        const sy = floorY;
        if (100 + dashPlayerSize - 4 > sx - 20 && 100 + 4 < sx + 20 && dashPlayerY + dashPlayerSize > sy - 22) {
          triggerGameOver();
        }
      } else if (o.type === 'block') {
        const bx = ox;
        const by = o.y;
        const bw = o.w;
        const bh = o.h;

        if (100 + dashPlayerSize > bx && 100 < bx + bw && dashPlayerY + dashPlayerSize > by && dashPlayerY < by + bh) {
          if (dashVy >= 0 && dashPlayerY + dashPlayerSize - dashVy <= by + 5) {
            dashPlayerY = by - dashPlayerSize;
            dashVy = 0;
            dashIsGrounded = true;
            dashRotation = Math.round(dashRotation / (Math.PI / 2)) * (Math.PI / 2);
            dashRotationSpeed = 0;
          } else {
            triggerGameOver();
          }
        }
      }
    });

    if (dashIsGrounded) {
      if (Math.random() < 0.3) {
        dashParticles.push({
          x: 100 + Math.random() * 10,
          y: floorY,
          vx: -dashSpeed - Math.random() * 1.5,
          vy: -Math.random() * 1.0,
          life: 20,
          color: 'rgba(79, 227, 232, 0.4)'
        });
      }
    } else {
      if (Math.random() < 0.5) {
        dashParticles.push({
          x: 100 + dashPlayerSize/2,
          y: dashPlayerY + dashPlayerSize/2,
          vx: -dashSpeed * 0.5,
          vy: (Math.random() - 0.5) * 1.0,
          life: 25,
          color: 'rgba(79, 227, 232, 0.3)'
        });
      }
    }

    if (!dashIsGrounded) {
      dashRotation += dashRotationSpeed;
    }

    updateParticles(dashParticles);
  }

  function drawVectorDash() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#0e172a';
    ctx.lineWidth = 0.5;
    const gridOffset = -(dashDistance % 40);
    for (let x = gridOffset; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    ctx.shadowBlur = 8;
    ctx.shadowColor = '#25314d';
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);
    ctx.strokeStyle = '#25314d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(canvas.width, floorY);
    ctx.stroke();

    ctx.strokeStyle = '#141d33';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = gridOffset; x < canvas.width; x += 30) {
      ctx.moveTo(x, floorY + 10);
      ctx.lineTo(x + 10, floorY + 10);
    }
    ctx.stroke();

    dashObstacles.forEach(o => {
      const ox = o.x - dashDistance;
      if (ox < -100 || ox > canvas.width + 100) return;

      if (o.type === 'spike') {
        const sy = o.y || floorY;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff6b6b';
        ctx.fillStyle = 'rgba(255, 107, 107, 0.2)';
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(ox - 11, sy);
        ctx.lineTo(ox + 11, sy);
        ctx.lineTo(ox, sy - 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (o.type === 'double-spike') {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff6b6b';
        ctx.fillStyle = 'rgba(255, 107, 107, 0.2)';
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(ox - 22, floorY);
        ctx.lineTo(ox, floorY);
        ctx.lineTo(ox - 11, floorY - 22);
        ctx.closePath();
        ctx.moveTo(ox, floorY);
        ctx.lineTo(ox + 22, floorY);
        ctx.lineTo(ox + 11, floorY - 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (o.type === 'block') {
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffb454';
        ctx.fillStyle = 'rgba(20, 29, 51, 0.85)';
        ctx.strokeStyle = '#ffb454';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(ox, o.y, o.w, o.h, 3);
        ctx.fill();
        ctx.stroke();
      }
    });

    ctx.shadowBlur = 0;
    dashParticles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 * (p.life / 25), 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.save();
    ctx.translate(100 + dashPlayerSize/2, dashPlayerY + dashPlayerSize/2);
    ctx.rotate(dashRotation);
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#4fe3e8';
    ctx.fillStyle = 'rgba(8, 11, 20, 0.9)';
    ctx.strokeStyle = '#4fe3e8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.rect(-dashPlayerSize/2, -dashPlayerSize/2, dashPlayerSize, dashPlayerSize);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#4fe3e8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-dashPlayerSize/4, -dashPlayerSize/4, dashPlayerSize/2, dashPlayerSize/2);
    ctx.fillStyle = '#4fe3e8';
    ctx.fillRect(-dashPlayerSize/6, -dashPlayerSize/6, dashPlayerSize/10, dashPlayerSize/10);
    ctx.fillRect(dashPlayerSize/6 - dashPlayerSize/10, -dashPlayerSize/6, dashPlayerSize/10, dashPlayerSize/10);
    ctx.restore();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#141d33';
    ctx.fillRect(0, 0, canvas.width, 4);
    ctx.fillStyle = '#4fe3e8';
    ctx.fillRect(0, 0, (dashDistance / dashVictoryDistance) * canvas.width, 4);
  }


  /* ------------------- SHARED CORE ENGINE ------------------- */
  function spawnParticles(x, y, color) {
    const list = (gameMode === 'orbit') ? orbitParticles : (gameMode === 'datastream' ? snakeParticles : dashParticles);
    for (let i = 0; i < 8; i++) {
      list.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30,
        color: color
      });
    }
  }

  function updateParticles(list) {
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) list.splice(i, 1);
    }
  }

  function checkCircleRectCollision(px, py, pr, rect) {
    const closestX = Math.max(rect.x - rect.width/2, Math.min(px, rect.x + rect.width/2));
    const closestY = Math.max(rect.y - rect.height/2, Math.min(py, rect.y + rect.height/2));
    const distanceSquared = Math.pow(px - closestX, 2) + Math.pow(py - closestY, 2);
    return distanceSquared < Math.pow(pr, 2);
  }

  canvas.addEventListener('mousedown', (e) => {
    if (gameMode === 'vectordash' && active) {
      jumpRequested = true;
    }
  });

  canvas.addEventListener('touchstart', (e) => {
    if (gameMode === 'vectordash' && active) {
      jumpRequested = true;
      e.preventDefault();
    }
  }, { passive: false });

  // Swipe controls for mobile snake steering
  let touchStartX = 0;
  let touchStartY = 0;
  canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  canvas.addEventListener('touchend', (e) => {
    if (!active) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (gameMode === 'datastream') {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 30 && snakeDir !== 'left') snakeNextDir = 'right';
        else if (diffX < -30 && snakeDir !== 'right') snakeNextDir = 'left';
      } else {
        if (diffY > 30 && snakeDir !== 'up') snakeNextDir = 'down';
        else if (diffY < -30 && snakeDir !== 'down') snakeNextDir = 'up';
      }
    } else if (gameMode === 'orbit') {
      const rect = canvas.getBoundingClientRect();
      const scale = canvas.width / rect.width;
      orbitPlayerX = (e.changedTouches[0].clientX - rect.left) * scale;
    }
  });

  // Touch/Mouse drag logic for Orbit Run
  function handleOrbitDrag(clientX) {
    if (!active || gameMode !== 'orbit') return;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    orbitPlayerX = (clientX - rect.left) * scale;
  }
  canvas.addEventListener('mousemove', (e) => handleOrbitDrag(e.clientX));
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) handleOrbitDrag(e.touches[0].clientX);
  });

  function stopCurrentGame() {
    active = false;
    if (gameLoopId) {
      cancelAnimationFrame(gameLoopId);
      gameLoopId = null;
    }
  }

  function gameLoop(timestamp) {
    if (!active) return;
    if (gameMode === 'orbit') {
      updateOrbitRun();
      drawOrbitRun();
    } else if (gameMode === 'datastream') {
      updateDataStream(timestamp);
      drawDataStream();
    } else if (gameMode === 'vectordash') {
      updateVectorDash();
      drawVectorDash();
    }
    gameLoopId = requestAnimationFrame(gameLoop);
  }

  function startSimulation() {
    if (active) return;
    active = true;

    if (gameMode === 'orbit') {
      initOrbitRun();
    } else if (gameMode === 'datastream') {
      initDataStream();
      lastTickTime = performance.now();
    } else if (gameMode === 'vectordash') {
      initVectorDash();
    }

    updateHUD();
    if (overlay) overlay.style.display = 'none';

    gameLoopId = requestAnimationFrame(gameLoop);
  }

  function triggerGameOver() {
    active = false;
    cancelAnimationFrame(gameLoopId);

    if (score > bestScores[gameMode]) {
      bestScores[gameMode] = score;
      const key = (gameMode === 'orbit') ? 'mk-orbit-run-best' : ((gameMode === 'datastream') ? 'mk-data-stream-best' : 'mk-vector-dash-best');
      localStorage.setItem(key, score);
      updateHUD();
    }

    if (overlay) {
      overlay.style.display = 'flex';
      const label = (gameMode === 'orbit') ? 'DRONE CRASHED' : ((gameMode === 'datastream') ? 'STREAM CORRUPTED' : 'BUILD FAILURE');
      const scoreStr = (gameMode === 'vectordash') ? score + '%' : score;
      const desc = (gameMode === 'orbit') 
        ? `Crash detected. Exception squashed your drone. Score: ${scoreStr}.`
        : ((gameMode === 'datastream') ? `Connection lost. Grid overflow or firewall collision. Score: ${scoreStr}.` : `Crash detected. Failed to compile dependencies. Completed: ${scoreStr}.`);
      
      if (overlayTitle) overlayTitle.textContent = label;
      if (overlayDesc) overlayDesc.textContent = desc;
      const btn = overlay.querySelector('button');
      if (btn) btn.textContent = 'Reboot Module';
    }
  }

  function triggerVictory() {
    active = false;
    cancelAnimationFrame(gameLoopId);

    bestScores[gameMode] = 100;
    localStorage.setItem('mk-vector-dash-best', 100);
    updateHUD();

    if (overlay) {
      overlay.style.display = 'flex';
      if (overlayTitle) overlayTitle.textContent = 'BUILD SUCCESSFUL';
      if (overlayDesc) overlayDesc.textContent = 'Simulation fully completed. System deployed to production environment! 100% Completed.';
      const btn = overlay.querySelector('button');
      if (btn) btn.textContent = 'Reboot Module';
    }
  }

  if (startBtn) startBtn.addEventListener('click', startSimulation);
  if (restartBtn) restartBtn.addEventListener('click', () => {
    stopCurrentGame();
    startSimulation();
  });

  // Initialize
  setMode('orbit');
})();
