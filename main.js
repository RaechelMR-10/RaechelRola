(() => {
  'use strict';

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const THEME_KEY = 'portfolio-theme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  const storedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(storedTheme === 'dark' ? 'dark' : 'light');

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');

  function closeNav() {
    nav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  /* ---------- Sticky header shadow ---------- */
  const header = document.getElementById('site-header');
  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('back-to-top');
  function onScrollBackToTop() {
    backToTop.style.opacity = window.scrollY > 480 ? '1' : '0';
    backToTop.style.pointerEvents = window.scrollY > 480 ? 'auto' : 'none';
  }
  backToTop.style.transition = 'opacity 0.25s ease';
  onScrollBackToTop();
  window.addEventListener('scroll', onScrollBackToTop, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Scrollspy ---------- */
  const sections = ['about', 'skills', 'experience', 'projects', 'education', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((section) => spyObserver.observe(section));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- Animated stat counters ---------- */
  const statNums = document.querySelectorAll('.stat-num');
  function animateCount(el) {
    if (el.dataset.text) {
      el.textContent = el.dataset.text;
      return;
    }
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(progress * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const statObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  statNums.forEach((el) => statObserver.observe(el));

  /* ---------- Skills filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillTags = document.querySelectorAll('.skill-tag');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.dataset.filter;
      skillTags.forEach((tag) => {
        const match = filter === 'all' || tag.dataset.category === filter;
        tag.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------- Interactive skill web ---------- */
  (function initSkillWeb() {
    const wrap = document.getElementById('web-wrap');
    const stage = document.getElementById('web-stage');
    const svg = stage ? stage.querySelector('.web-svg') : null;
    const items = Array.from(document.querySelectorAll('.skill-tag'));
    if (!wrap || !stage || !svg || !items.length) return;

    const NS = 'http://www.w3.org/2000/svg';
    const ringRadii = [11, 20, 29, 37, 43]; // percent of stage width, innermost -> outermost
    const SPOKE_COUNT = 8; // fixed, classic-web look
    const spokeAngle = (i) => -90 + i * (360 / SPOKE_COUNT);
    const toXY = (r, angleDeg) => {
      const rad = (angleDeg * Math.PI) / 180;
      return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)];
    };

    // Scalloped ring: straight spokes with a concave (inward-bowed) curve
    // between each pair, like a real web strand — not a plain circle.
    function scallopedRingPath(r) {
      const pts = [];
      for (let i = 0; i < SPOKE_COUNT; i++) pts.push(toXY(r, spokeAngle(i)));
      let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)} `;
      for (let i = 0; i < SPOKE_COUNT; i++) {
        const next = pts[(i + 1) % SPOKE_COUNT];
        const midAngle = spokeAngle(i) + 360 / SPOKE_COUNT / 2;
        const [cx, cy] = toXY(r * 0.86, midAngle);
        d += `Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${next[0].toFixed(2)} ${next[1].toFixed(2)} `;
      }
      return d + 'Z';
    }

    ringRadii.forEach((r) => {
      const ring = document.createElementNS(NS, 'path');
      ring.setAttribute('d', scallopedRingPath(r));
      ring.setAttribute('class', 'web-ring');
      svg.appendChild(ring);
    });

    // Spokes: straight lines from center, poking past the outer ring as star tips
    const outerRadius = ringRadii[ringRadii.length - 1];
    for (let i = 0; i < SPOKE_COUNT; i++) {
      const [x2, y2] = toXY(outerRadius + 7, spokeAngle(i));
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', '50');
      line.setAttribute('y1', '50');
      line.setAttribute('x2', String(x2));
      line.setAttribute('y2', String(y2));
      line.setAttribute('class', 'web-spoke');
      svg.insertBefore(line, svg.firstChild);
    }

    // Group nodes by category, preserving DOM order within each group
    const groups = new Map();
    items.forEach((el) => {
      const cat = el.dataset.category || 'other';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(el);
    });

    // Smaller groups sit on inner rings, larger groups on outer rings (more room)
    const sortedGroups = Array.from(groups.entries()).sort((a, b) => a[1].length - b[1].length);

    sortedGroups.forEach(([, els], ringIndex) => {
      const r = ringRadii[Math.min(ringIndex, ringRadii.length - 1)];
      const count = els.length;
      const startAngle = -90 + ringIndex * 23;
      els.forEach((el, i) => {
        const [x, y] = toXY(r, startAngle + (360 / count) * i);
        el.style.setProperty('--nx', x + '%');
        el.style.setProperty('--ny', y + '%');
        el.style.setProperty('--nz', `${(2 - ringIndex) * -16}px`);
        el.dataset.wx = x.toFixed(2);
        el.dataset.wy = y.toFixed(2);
      });
    });

    stage.classList.add('web-ready');

    /* ---- Tilt: mouse hover, touch drag, or device gyroscope ---- */
    const maxTilt = 16;
    let targetRX = 0;
    let targetRY = 0;
    let curRX = 0;
    let curRY = 0;
    let usingGyro = false;

    /* ---- Click-to-zoom: pan + scale the whole web toward a node ---- */
    const ZOOM_SCALE = 2.3;
    const hint = wrap.querySelector('.web-hint');
    const defaultHint = hint ? hint.textContent : '';
    let zoomedEl = null;
    let zoomTargetScale = 1;
    let zoomTargetTX = 0;
    let zoomTargetTY = 0;
    let zoomCurScale = 1;
    let zoomCurTX = 0;
    let zoomCurTY = 0;

    function focusNode(el) {
      const w = stage.offsetWidth;
      const h = stage.offsetHeight;
      const nxPct = parseFloat(el.dataset.wx);
      const nyPct = parseFloat(el.dataset.wy);
      const axPx = ((nxPct - 50) / 100) * w;
      const ayPx = ((nyPct - 50) / 100) * h;
      zoomTargetScale = ZOOM_SCALE;
      zoomTargetTX = -ZOOM_SCALE * axPx;
      zoomTargetTY = -ZOOM_SCALE * ayPx;
      zoomedEl = el;
      items.forEach((it) => it.classList.toggle('is-focused', it === el));
      wrap.classList.add('is-zoomed');
      if (hint) hint.textContent = 'Zoomed in — click the node again (or press Esc) to zoom back out.';
    }

    function resetZoom() {
      zoomTargetScale = 1;
      zoomTargetTX = 0;
      zoomTargetTY = 0;
      zoomedEl = null;
      items.forEach((it) => it.classList.remove('is-focused'));
      wrap.classList.remove('is-zoomed');
      if (hint) hint.textContent = defaultHint;
    }

    items.forEach((el) => {
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      const toggleFocus = () => {
        if (zoomedEl === el) resetZoom();
        else focusNode(el);
      };
      el.addEventListener('click', toggleFocus);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFocus();
        }
      });
    });
    wrap.addEventListener('click', (e) => {
      if (zoomedEl && (e.target === wrap || e.target === stage || e.target === svg)) resetZoom();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && zoomedEl) resetZoom();
    });

    function setTargetFromPoint(clientX, clientY) {
      const rect = wrap.getBoundingClientRect();
      const dx = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      targetRY = Math.max(-1, Math.min(1, dx)) * maxTilt;
      targetRX = Math.max(-1, Math.min(1, -dy)) * maxTilt;
    }

    wrap.addEventListener('pointermove', (e) => {
      if (usingGyro) return;
      if (e.pointerType === 'mouse' || e.buttons > 0) {
        setTargetFromPoint(e.clientX, e.clientY);
      }
    });
    wrap.addEventListener('pointerleave', () => {
      if (!usingGyro) { targetRX = 0; targetRY = 0; }
    });
    wrap.addEventListener('pointerup', () => {
      if (!usingGyro) { targetRX = 0; targetRY = 0; }
    });

    function tick() {
      curRX += (targetRX - curRX) * 0.08;
      curRY += (targetRY - curRY) * 0.08;
      zoomCurScale += (zoomTargetScale - zoomCurScale) * 0.12;
      zoomCurTX += (zoomTargetTX - zoomCurTX) * 0.12;
      zoomCurTY += (zoomTargetTY - zoomCurTY) * 0.12;
      stage.style.transform =
        `translate(${zoomCurTX}px, ${zoomCurTY}px) scale(${zoomCurScale}) ` +
        `rotateX(${curRX}deg) rotateY(${curRY}deg)`;
      requestAnimationFrame(tick);
    }
    tick();

    /* ---- Optional: real device tilt via gyroscope ---- */
    const tiltBtn = document.getElementById('web-tilt-btn');
    function enableGyro() {
      usingGyro = true;
      window.addEventListener('deviceorientation', (e) => {
        if (e.beta == null || e.gamma == null) return;
        targetRX = Math.max(-maxTilt, Math.min(maxTilt, (e.beta - 40) * 0.4));
        targetRY = Math.max(-maxTilt, Math.min(maxTilt, e.gamma * 0.5));
      });
    }
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      if (tiltBtn) {
        tiltBtn.hidden = false;
        tiltBtn.addEventListener('click', async () => {
          try {
            const result = await DeviceOrientationEvent.requestPermission();
            if (result === 'granted') {
              enableGyro();
              tiltBtn.hidden = true;
            }
          } catch {
            /* permission dismissed or unsupported; mouse/touch tilt still works */
          }
        });
      }
    } else if (window.DeviceOrientationEvent && matchMedia('(pointer: coarse)').matches) {
      enableGyro();
    }
  })();

  /* ---------- 3D scroll carousel (Projects) ---------- */
  (function initCarousel() {
    const pin = document.getElementById('carousel-pin');
    const track = document.getElementById('carousel-track');
    const cards = track ? Array.from(track.querySelectorAll('.carousel-card')) : [];
    const dotsWrap = document.getElementById('carousel-dots');
    if (!pin || !track || !cards.length) return;

    const spacingPx = 320;
    const maxRotate = 42;

    function scrollToCard(i) {
      const total = pin.offsetHeight - window.innerHeight;
      const pinTop = pin.getBoundingClientRect().top + window.scrollY;
      const targetY = pinTop + (i / (cards.length - 1)) * total;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }

    const dots = cards.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Jump to project ${i + 1}`);
      dot.addEventListener('click', () => scrollToCard(i));
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    cards.forEach((card, i) => {
      card.addEventListener('click', () => scrollToCard(i));
    });

    function render() {
      const rect = pin.getBoundingClientRect();
      const total = pin.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0;
      const focus = progress * (cards.length - 1);

      let nearestIdx = 0;
      let nearestDist = Infinity;

      cards.forEach((card, i) => {
        const delta = i - focus;
        const absDelta = Math.abs(delta);
        if (absDelta < nearestDist) {
          nearestDist = absDelta;
          nearestIdx = i;
        }

        const x = delta * spacingPx;
        const rotateY = Math.max(-maxRotate, Math.min(maxRotate, delta * -34));
        const z = -Math.min(absDelta, 3) * 170;
        const scale = Math.max(0.62, 1 - Math.min(absDelta, 3) * 0.14);
        const opacity = Math.max(0, 1 - Math.min(absDelta, 3) * 0.38);

        card.style.transform =
          `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = String(opacity);
        card.style.zIndex = String(1000 - Math.round(absDelta * 10));
        card.style.pointerEvents = absDelta < 0.55 ? 'auto' : 'none';
      });

      cards.forEach((card, i) => card.classList.toggle('is-centered', i === nearestIdx));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === nearestIdx));

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  })();

  /* ---------- Experience accordion ---------- */
  document.querySelectorAll('.timeline-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.timeline-item');
      const isOpen = item.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });

  /* ---------- Copy email ---------- */
  const copyBtn = document.getElementById('copy-email');
  const copyFeedback = document.getElementById('copy-feedback');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = 'raechelmarierola@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        copyFeedback.textContent = 'Copied!';
      } catch {
        copyFeedback.textContent = email;
      }
      setTimeout(() => { copyFeedback.textContent = 'Copy'; }, 1800);
    });
  }

  /* ---------- Rotating hero role text ---------- */
  const roles = [
    'Software Developer',
    'Full-Stack JavaScript Engineer',
    'React & Node.js Developer',
    '.NET / C# Developer',
  ];
  const roleEl = document.getElementById('role-text');
  let roleIndex = 0;
  if (roleEl) {
    setInterval(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      roleEl.style.opacity = '0';
      setTimeout(() => {
        roleEl.textContent = roles[roleIndex];
        roleEl.style.opacity = '1';
      }, 250);
    }, 2800);
    roleEl.style.transition = 'opacity 0.25s ease';
  }

  /* ---------- Typing terminal effect ---------- */
  const codeLines = [
    'const developer = {',
    "  name: 'Raechel Marie Rola',",
    "  role: 'Software Developer',",
    "  stack: ['TypeScript', 'React', 'Node.js', 'C#/.NET'],",
    "  based: 'Bulacan, Philippines',",
    '  openToWork: true,',
    '};',
    '',
    'console.log(developer.stack.join(" + "));',
  ];
  const typedEl = document.getElementById('typed-code');

  function typeLoop() {
    if (!typedEl) return;
    let lineIdx = 0;
    let charIdx = 0;
    typedEl.textContent = '';

    function step() {
      if (lineIdx >= codeLines.length) {
        setTimeout(() => {
          typedEl.textContent = '';
          lineIdx = 0;
          charIdx = 0;
          step();
        }, 2200);
        return;
      }
      const line = codeLines[lineIdx];
      if (charIdx <= line.length) {
        const soFar = codeLines.slice(0, lineIdx).join('\n');
        typedEl.textContent = (soFar ? soFar + '\n' : '') + line.slice(0, charIdx);
        charIdx++;
        setTimeout(step, 18 + Math.random() * 22);
      } else {
        lineIdx++;
        charIdx = 0;
        setTimeout(step, 90);
      }
    }
    step();
  }
  typeLoop();

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
