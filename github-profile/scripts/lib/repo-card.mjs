// Pinned-repository card in the same HUD style as the dashboard.
import { C, MONO, esc, fmt, svg, cardBase, brackets, fontFaces } from './theme.mjs';

const W = 490;
const H = 150;

function wrap(text, width, maxLines) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > width) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else line = (line + ' ' + word).trim();
  }
  if (lines.length < maxLines && line) lines.push(line);
  const used = lines.join(' ').split(' ').length;
  if (used < words.length) lines[maxLines - 1] = lines[maxLines - 1].slice(0, width - 1).replace(/\s*\S*$/, '') + '…';
  return lines.filter(Boolean);
}

const STAR = 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z';
const FORK = 'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z';
const REPO = 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z';

export function renderRepoCard(repo, index = 0) {
  const base = cardBase(W, H, 'rc');
  const name = repo.name.length > 34 ? repo.name.slice(0, 33) + '…' : repo.name;
  const lines = wrap(repo.description || 'No description, website, or topics provided.', 58, 2);
  const lang = repo.language;
  const updated = repo.pushedAt ? repo.pushedAt.slice(0, 7) : '';
  const num = String(index + 1).padStart(2, '0');

  let meta = '';
  let x = 22;
  if (lang) {
    meta += `<circle cx="${x + 5}" cy="126" r="5" fill="${lang.color ?? C.mute}"/><text class="meta" x="${x + 16}" y="130">${esc(lang.name)}</text>`;
    x += 26 + lang.name.length * 7.6;
  }
  meta += `<path transform="translate(${fmt(x, 1)} 118)" d="${STAR}" fill="${C.gold}"/><text class="meta" x="${fmt(x + 21, 1)}" y="130">${repo.stars}</text>`;
  x += 34 + String(repo.stars).length * 7.6;
  meta += `<path transform="translate(${fmt(x, 1)} 118)" d="${FORK}" fill="${C.cyan}"/><text class="meta" x="${fmt(x + 20, 1)}" y="130">${repo.forks}</text>`;

  const css =
    fontFaces({ mono: [400, 700] }) +
    `text{font-family:${MONO}}` +
    `.name{font-weight:700;font-size:16.5px;fill:#fff}.idx{font-size:10px;letter-spacing:2px;fill:${C.mute}}` +
    `.desc{font-size:12.5px;fill:#b9cde3}.meta{font-size:12px;fill:#cfe3f7}.upd{font-size:10.5px;fill:${C.mute}}` +
    `.scan{animation:scan 5s ease-in-out ${fmt(index * 0.7, 1)}s infinite}@keyframes scan{0%{transform:translateX(-160px)}60%,100%{transform:translateX(${W + 40}px)}}` +
    `.dot{animation:dot 1.6s ease-in-out infinite}@keyframes dot{50%{opacity:.2}}` +
    `@media (prefers-reduced-motion:reduce){*{animation:none!important}.scan{display:none}}`;

  const defs =
    base.defs +
    `<linearGradient id="scanGrad"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".5" stop-color="${C.cyan}" stop-opacity=".09"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="baseLine"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".5" stop-color="${C.cyan}" stop-opacity=".6"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></linearGradient>`;

  const body =
    `<g clip-path="${base.clip}">${base.back}` +
    `<rect class="scan" y="0" width="140" height="${H}" fill="url(#scanGrad)"/>` +
    `<path transform="translate(22 22)" d="${REPO}" fill="${C.cyan}"/>` +
    `<text class="name" x="46" y="35">${esc(name)}</text>` +
    `<text class="idx" x="${W - 22}" y="34" text-anchor="end">REPO_${num}</text>` +
    `<circle class="dot" cx="${W - 92}" cy="30.5" r="3" fill="${C.ok}"/>` +
    lines.map((l, i) => `<text class="desc" x="22" y="${66 + i * 19}">${esc(l)}</text>`).join('') +
    `<path d="M22 106H${W - 22}" stroke="url(#baseLine)"/>` +
    meta +
    (updated ? `<text class="upd" x="${W - 22}" y="130" text-anchor="end">updated ${updated}</text>` : '') +
    brackets(8, 8, W - 16, H - 16, 10, C.cyan, 0.45) +
    `</g>${base.edge}`;

  return svg({
    w: W,
    h: H,
    title: repo.name,
    desc: `${repo.description || 'Repository'} — ${lang ? lang.name + ', ' : ''}${repo.stars} stars, ${repo.forks} forks`,
    defs,
    css,
    body,
  });
}
