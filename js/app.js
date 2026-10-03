import { ICONS } from './icons.js';
import { loadStats, derive } from './data.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nf = (n) => (n == null || Number.isNaN(n) ? '—' : Math.round(n).toLocaleString('en-US'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------------ content

// The greetings that cycled on the old kazimanilaydin.github.io.
const GREETINGS = ['Hallo', 'Здравствуйте', 'Hello', 'Merhaba', 'नमस्ते', '¡Hola!', 'Ciao!', 'Olá!', 'こんにちは！', '你好！', 'Привіт!', 'مرحبا!', 'Salam!', 'Salut!', 'Bună!', 'سلام!'];

const TYPED = ["Hello, World! I'm Kazım Anıl.", 'Industrial engineer & developer.', 'Follow the white rabbit.', 'levántarse y brillar.'];
const RABBIT_LINE = 2;

const STACK = [
  ['FRONTEND', [['JavaScript', 'javascript'], ['TypeScript', 'typescript'], ['Vue', 'vuedotjs'], ['Nuxt', 'nuxt'], ['React', 'react']]],
  ['BACKEND', [['Node.js', 'nodedotjs'], ['Express', 'express'], ['Python', 'python'], ['Flask', 'flask'], ['Go', 'go']]],
  ['DATA', [['MySQL', 'mysql'], ['PostgreSQL', 'postgresql'], ['MongoDB', 'mongodb'], ['R', 'r'], ['Jupyter', 'jupyter']]],
  ['SYSTEMS', [['macOS', 'macos'], ['Windows', 'windows'], ['Linux', 'linux'], ['Git', 'git'], ['Bash', 'gnubash']]],
];

const LINKS = [
  { label: 'GITHUB', sub: '@kazimanilaydin', href: 'https://github.com/kazimanilaydin', icon: 'github' },
  { label: 'LINKEDIN', sub: '/in/kazimanilaydin', href: 'https://www.linkedin.com/in/kazimanilaydin', icon: 'linkedin' },
  { label: 'MEDIUM', sub: '@kazimanilaydin', href: 'https://medium.com/@kazimanilaydin', icon: 'medium' },
];

const svgIcon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;

// ------------------------------------------------------------------ white rabbit

const RABBIT = [
  [42, 84, 31, 27], [33, 90, 23, 21], [62, 70, 15, 19], [69, 47, 18, 15],
  [56, 20, 8, 21, -16], [71, 18, 8, 21, 4], [11, 80, 9, 9], [70, 106, 11, 6], [38, 108, 24, 6],
];
const EARS = [[56, 22, 3.2, 14, -16], [71, 20, 3.2, 14, 4]];
const EYE = [76, 44, 3.6, 3.6];
const NOSE = [87, 51, 2.6, 2.6];
const HAUNCH = [33, 92, 19, 16];

const ellipse = ([x, y, rx, ry, rot = 0], fill) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="${fill}"/>`;
const rabbitSvg = () =>
  `<g>${RABBIT.map((e) => ellipse(e, '#fff')).join('')}${EARS.map((e) => ellipse(e, '#ffb84d')).join('')}${ellipse(EYE, '#020611')}${ellipse(NOSE, '#ff9eb8')}</g>`;

const inside = (px, py, [x, y, rx, ry, rot = 0]) => {
  const a = (rot * Math.PI) / 180;
  const dx = px - x;
  const dy = py - y;
  const u = dx * Math.cos(a) + dy * Math.sin(a);
  const v = -dx * Math.sin(a) + dy * Math.cos(a);
  return (u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1;
};

function pixelRabbit(svg) {
  let out = '';
  for (let row = 0; row < 29; row++) {
    for (let col = 0; col < 25; col++) {
      const x = col * 4 + 2;
      const y = row * 4 + 2;
      if (!RABBIT.some((e) => inside(x, y, e))) continue;
      const fill = inside(x, y, EYE) ? '#020611' : inside(x, y, NOSE) ? '#ff9eb8' : EARS.some((e) => inside(x, y, e)) ? '#ffb84d' : inside(x, y, HAUNCH) ? '#e4f6ff' : '#fff';
      out += `<rect x="${col * 8}" y="${row * 8}" width="7" height="7" rx="1.2" fill="${fill}" style="animation-delay:${(0.3 + row * 0.04).toFixed(2)}s"/>`;
    }
  }
  svg.innerHTML = out;
}

// ------------------------------------------------------------------ tabs

// Sections are not id'd after the hash, so the browser never jumps to them.
const views = Object.fromEntries($$('.view').map((v) => [v.dataset.view, v]));
const listeners = {};
let current = null;

function moveInk(tab) {
  const ink = $('.tab-ink');
  const nav = $('.tabs');
  if (!tab || !ink) return;
  const a = tab.getBoundingClientRect();
  const b = nav.getBoundingClientRect();
  ink.style.width = `${a.width}px`;
  ink.style.transform = `translateX(${a.left - b.left}px)`;
}

function show(id) {
  if (!views[id]) id = 'profile';
  if (id === current) return;
  if (current) listeners[current]?.leave?.();
  for (const [key, view] of Object.entries(views)) view.classList.toggle('active', key === id);
  $$('.tabs a').forEach((a) => a.setAttribute('aria-selected', String(a.dataset.tab === id)));
  moveInk($(`.tabs a[data-tab="${id}"]`));
  document.title = `Kazım Anıl AYDIN | [ Think & Do ] | ${id.toUpperCase()}`;
  current = id;
  listeners[id]?.enter?.();
}

window.addEventListener('hashchange', () => {
  show(location.hash.slice(1));
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
});
window.addEventListener('resize', () => moveInk($(`.tabs a[data-tab="${current}"]`)));

// ------------------------------------------------------------------ clock

function clock() {
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const tick = () => ($('#clock').textContent = `TR ${fmt.format(new Date())}`);
  tick();
  setInterval(tick, 1000);
}

// ------------------------------------------------------------------ code rain

function codeRain(canvas) {
  const ctx = canvas.getContext('2d');
  const CHARS = '01<>{}[]=+*/#$%&ABCDEFGHJKLMNPQRSTUVWXYZ0123456789アイウエオカキクケコサシスセソ';
  const WORDS = ['THINK', 'DO', 'ANIL', 'VUE', 'NODE', 'PYTHON', 'REACT', 'GO', 'LINUX'];
  const size = 15;
  let cols = [];
  let w = 0;
  let h = 0;

  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.ceil(w / (size * 1.25));
    cols = Array.from({ length: n }, () => ({ y: Math.random() * -h, speed: 0.4 + Math.random() * 0.9, word: null, wi: 0 }));
  };

  const draw = () => {
    ctx.fillStyle = 'rgba(2, 6, 17, 0.12)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${size}px JBM, monospace`;
    cols.forEach((c, i) => {
      let ch;
      if (c.word) {
        ch = c.word[c.wi++];
        if (c.wi >= c.word.length) c.word = null;
      } else {
        ch = CHARS[(Math.random() * CHARS.length) | 0];
        if (Math.random() < 0.004) (c.word = WORDS[(Math.random() * WORDS.length) | 0]), (c.wi = 0);
      }
      const x = i * size * 1.25;
      ctx.fillStyle = Math.random() < 0.08 ? '#e6fbff' : c.word ? '#ffb84d' : 'rgba(59, 232, 255, 0.75)';
      ctx.fillText(ch, x, c.y);
      c.y += size * c.speed;
      if (c.y > h + 40 && Math.random() > 0.96) c.y = Math.random() * -200;
    });
  };

  resize();
  window.addEventListener('resize', resize);
  if (reduced) {
    for (let k = 0; k < 120; k++) draw();
    return;
  }
  let last = 0;
  const loop = (t) => {
    if (!document.hidden && t - last > 45) {
      draw();
      last = t;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// ------------------------------------------------------------------ hero

function decodeName(el) {
  const text = 'KΛZIM ΛNIL ΛYDIN';
  const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&@';
  // Words are nowrap so lines only break between them.
  el.innerHTML = text
    .split(' ')
    .map((word) => `<span class="word">${[...word].map((c) => (c === 'Λ' ? '<span class="ch lam">V</span>' : `<span class="ch">${c}</span>`)).join('')}</span>`)
    .join(' ');
  const chars = $$('.ch', el);
  if (reduced) return;
  chars.forEach((span, i) => {
    const final = span.textContent;
    const isLam = span.classList.contains('lam');
    let n = 0;
    span.classList.add('scr');
    if (isLam) span.classList.remove('lam');
    const t = setInterval(() => {
      if (n++ > 6 + i) {
        clearInterval(t);
        span.textContent = final;
        span.classList.remove('scr');
        if (isLam) span.classList.add('lam');
        return;
      }
      span.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }, 55);
  });
  setInterval(() => {
    el.classList.remove('glitch');
    void el.offsetWidth;
    el.classList.add('glitch');
  }, 7000);
}

async function typer(el, rabbit) {
  if (reduced) {
    el.textContent = TYPED[0];
    return;
  }
  await sleep(1400);
  for (let i = 0; ; i = (i + 1) % TYPED.length) {
    const line = TYPED[i];
    if (i === RABBIT_LINE) runRabbit(rabbit);
    for (let k = 1; k <= line.length; k++) {
      el.textContent = line.slice(0, k);
      await sleep(60 + Math.random() * 40);
    }
    await sleep(1900);
    for (let k = line.length; k >= 0; k--) {
      el.textContent = line.slice(0, k);
      await sleep(22);
    }
    await sleep(350);
  }
}

function runRabbit(svg) {
  if (!svg || reduced) return;
  svg.style.setProperty('--w', `${svg.parentElement.clientWidth}px`);
  svg.classList.remove('run');
  void svg.getBoundingClientRect();
  svg.classList.add('run');
}

function rotateWords(els, words, every = 1800) {
  let i = 0;
  setInterval(() => {
    i = (i + 1) % words.length;
    els.forEach((el) => {
      el.classList.add('out');
      setTimeout(() => {
        el.textContent = words[i];
        el.classList.remove('out');
      }, 300);
    });
  }, every);
}

// ------------------------------------------------------------------ stack & links

function renderStack(root) {
  root.innerHTML = STACK.map(([title, items], q) =>
    `<div class="stack-cat"><h3>${String(q + 1).padStart(2, '0')} // ${title}</h3><div class="tiles">${items
      .map(([label, icon]) => `<div class="tile">${svgIcon(icon)}<span>${label}</span></div>`)
      .join('')}</div></div>`).join('');
  if (reduced) return;
  const tiles = $$('.tile', root);
  let i = 0;
  setInterval(() => {
    tiles.forEach((t) => t.classList.remove('lit'));
    tiles[i++ % tiles.length].classList.add('lit');
  }, 700);
}

function renderLinks() {
  $('#link-grid').innerHTML = LINKS.map((l) =>
    `<a class="link-card" href="${l.href}" target="_blank" rel="noopener">${svgIcon(l.icon)}<div><b>${l.label}</b><span>${l.sub}</span></div><span class="go" aria-hidden="true">⟶</span></a>`).join('');
  const words = [...GREETINGS, ...GREETINGS].map((g) => `<span>${g}</span>`).join('');
  $('#marquee').innerHTML = words;
}

// ------------------------------------------------------------------ network data

function sparkline(svg, values) {
  if (!values.length) return;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [(140 * i) / Math.max(1, values.length - 1), 22 - (20 * v) / max]);
  const d = 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
  const [lx, ly] = pts[pts.length - 1];
  svg.innerHTML =
    `<defs><linearGradient id="sf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3be8ff" stop-opacity=".35"/><stop offset="1" stop-color="#3be8ff" stop-opacity="0"/></linearGradient></defs>` +
    `<path d="${d}L140 24L0 24Z" fill="url(#sf)"/><path d="${d}" fill="none" stroke="#3be8ff" stroke-width="1.5" vector-effect="non-scaling-stroke"/>` +
    `<circle cx="${lx}" cy="${ly}" r="2.5" fill="#fff"/>`;
}

function bars(el, values) {
  const max = Math.max(1, ...values);
  el.innerHTML = values.map((v, i) => `<i style="height:${Math.max(6, (100 * v) / max)}%;opacity:${(0.35 + (0.65 * v) / max).toFixed(2)};animation-delay:${(0.3 + i * 0.03).toFixed(2)}s"></i>`).join('');
}

function fillStats(p) {
  const s = derive(p);
  $$('[data-sample-note]').forEach((el) => (el.hidden = !p.sample));
  const values = {
    ...p,
    longestStreak: s.hasCalendar ? `${s.longestStreak}d` : '—',
    streakLabel: s.hasCalendar ? `${s.currentStreak}d` : '—',
    yearsLabel: `${Math.floor(s.years)} yrs`,
  };
  $$('[data-stat]').forEach((el) => {
    const v = values[el.dataset.stat];
    el.textContent = typeof v === 'number' ? nf(v) : v ?? '—';
  });

  const contrib = p.contributionsYear;
  if (contrib != null) {
    $('#contrib-total').textContent = nf(contrib);
    $('#contrib-level').textContent = contrib >= 1000 ? 'Elite' : contrib >= 500 ? 'High' : contrib >= 200 ? 'Active' : contrib >= 50 ? 'Steady' : 'Warming up';
    const angle = -90 + 180 * Math.min(1, Math.log1p(contrib) / Math.log1p(1500));
    requestAnimationFrame(() => ($('#needle').style.transform = `rotate(${angle}deg)`));
  }
  if (s.hasCalendar) {
    sparkline($('#contrib-spark'), s.weekly.slice(-26));
    $('#streak').textContent = nf(s.currentStreak);
    $('#streak-state').textContent = s.currentStreak >= 7 ? 'On fire' : s.currentStreak >= 1 ? 'Active' : 'Standby';
    $('#streak-longest').textContent = `longest ${s.longestStreak}d`;
    bars($('#daily-bars'), s.daily);
    const pct = (100 * s.activeDays) / Math.max(1, s.totalDays);
    $('#active-days').textContent = nf(s.activeDays);
    $('#active-total').textContent = `/ ${s.totalDays}`;
    $('#active-pct').textContent = `${Math.round(pct)}%`;
    $('#active-word').textContent = pct >= 60 ? 'Excellent' : pct >= 35 ? 'Great' : pct >= 15 ? 'Good' : 'Warming up';
    requestAnimationFrame(() => $('#ring').setAttribute('stroke-dasharray', `${pct.toFixed(1)} 100`));
    bars($('#month-bars'), s.monthly);
  }

  const status = s.daysSinceActive <= 7 ? ['OPTIMAL', 'var(--ok)'] : s.daysSinceActive <= 30 ? ['ONLINE', 'var(--ok)'] : s.hasCalendar ? ['STANDBY', 'var(--gold)'] : ['ONLINE', 'var(--ok)'];
  $('#net-status').textContent = status[0];
  $('#net-status').style.color = status[1];
  $('#uptime').textContent = `${s.years.toFixed(1)} yrs`;
  $('#sync').textContent = (p.generatedAt ?? new Date().toISOString()).slice(0, 10);

  const langs = (p.languages ?? []).slice(0, 5);
  const total = (p.languages ?? []).reduce((n, l) => n + l.size, 0) || 1;
  $('#langs').innerHTML = langs.length
    ? langs.map((l, i) => `<li><div class="row"><i style="background:${l.color}"></i>${l.name}<b>${((100 * l.size) / total).toFixed(1)}%</b></div><div class="track"><span style="width:${((100 * l.size) / langs[0].size).toFixed(1)}%;animation-delay:${0.2 + i * 0.12}s"></span></div></li>`).join('')
    : '<li class="muted">no data</li>';
}

// ------------------------------------------------------------------ boot

function boot() {
  $('#year').textContent = new Date().getFullYear();
  $('#hello-count').textContent = `${GREETINGS.length} languages`;
  $('#rabbit').innerHTML = rabbitSvg();
  $('#rabbit-links').innerHTML = rabbitSvg();
  pixelRabbit($('#pixel-rabbit'));
  $$('.fetch-list div').forEach((d, i) => (d.style.animationDelay = `${0.6 + i * 0.08}s`));

  clock();
  codeRain($('#rain'));
  decodeName($('#name'));
  typer($('#typed'), $('#rabbit'));
  if (!reduced) rotateWords([$('#hello-word'), ...$$('[data-hello]')], GREETINGS);
  renderStack($('#stack-grid'));
  renderLinks();

  let globe = null;
  listeners.network = {
    async enter() {
      if (!globe) {
        globe = import('./globe.js').then((m) => m.mountGlobe($('#globe'))).catch((err) => {
          console.error(err);
          $('#globe').innerHTML = '<div class="globe-fallback" role="img" aria-label="Rotating Earth"></div>';
          return null;
        });
      }
      (await globe)?.resume();
    },
    async leave() {
      (await globe)?.pause();
    },
  };

  loadStats().then(fillStats).catch((err) => console.warn('stats unavailable', err));

  show(location.hash.slice(1) || 'profile');
  document.fonts?.ready.then(() => moveInk($(`.tabs a[data-tab="${current}"]`)));
}

boot();
