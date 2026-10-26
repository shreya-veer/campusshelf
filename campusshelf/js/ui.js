/* CampusShelf — shared UI: navbar, footer, covers, cards, toast, modal, helpers */
const UI = (() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PALETTE = [['#0F2A43', '#1F5F8B'], ['#0E7C86', '#2BB3A8'], ['#5B3E96', '#8E6BD1'], ['#B4532A', '#E08A4B'], ['#1E6B4F', '#46A878'], ['#8C2F4B', '#CC5F7F']];
  const hashStr = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const ago = (t) => { const d = Math.floor((Date.now() - t) / 86400000); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d < 30 ? d + ' days ago' : d < 365 ? Math.floor(d / 30) + ' mo ago' : Math.floor(d / 365) + ' yr ago'; };
  const dateStr = (t) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const initials = (n) => n.split(' ').filter(w => !/^(dr|prof)\.?$/i.test(w)).map(w => w[0]).slice(0, 2).join('').toUpperCase();

  function cover(b, extra = '') {
    if (b.photo) return `<div class="book-cover photo ${extra}" style="background-image:url('${b.photo}')"></div>`;
    const [c1, c2] = PALETTE[hashStr(b.title) % PALETTE.length];
    return `<div class="book-cover ${extra}" style="background:linear-gradient(145deg,${c1},${c2})">
      <small>${esc(b.subject || 'Textbook')}</small><strong>${esc(b.title)}</strong><em>${esc(b.author || '')}</em></div>`;
  }
  function condDots(c) { const s = DB.CONDITIONS[c]?.score || 0; return `<span class="cond" title="${DB.CONDITIONS[c]?.label}">${[1, 2, 3, 4].map(i => `<i class="${i <= s ? 'on' : ''}"></i>`).join('')}</span>`; }
  function priceTag(b) { return b.mode === 'sale' ? `₹${b.price}` : b.mode === 'free' ? 'Free' : b.mode === 'lend' ? 'Lend' : 'Exchange'; }
  function statusBadge(s) { const m = { available: ['green', 'Available'], reserved: ['amber', 'Reserved'], given: ['gray', 'Passed on'], lent: ['amber', 'On loan'] }[s] || ['gray', s]; return `<span class="badge ${m[0]}">${m[1]}</span>`; }

  function bookCard(b) {
    const o = DB.user(b.ownerId);
    return `<a class="bcard reveal" href="book.html?id=${b.id}">
      ${cover(b)}
      <div class="bcard-body">
        <div class="badges">
          ${b.recommended ? '<span class="badge amber">⭐ Faculty pick</span>' : ''}
          <span class="badge">${DB.MODES[b.mode].icon} ${DB.MODES[b.mode].label}</span>
          ${b.status !== 'available' ? statusBadge(b.status) : ''}
        </div>
        <h4>${esc(b.title)}</h4>
        <div class="meta">${esc(b.branch)} · Sem ${esc(b.semester)}</div>
        <div class="bcard-foot">
          <span class="meta" style="display:flex;gap:8px;align-items:center">${condDots(b.condition)} ${DB.CONDITIONS[b.condition].label}</span>
          <span class="price">${priceTag(b)}</span>
        </div>
        <div class="meta">by ${esc(o?.name || 'Member')}${DB.isFaculty(o) ? ' ✔️' : ''}</div>
      </div></a>`;
  }

  function logoSvg() {
    return `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#0F2A43"/><path d="M9 28V12.5c0-.8.6-1.4 1.4-1.4H20v18H10.4c-.8 0-1.4-.6-1.4-1.1z" fill="#0E7C86"/><path d="M31 28V12.5c0-.8-.6-1.4-1.4-1.4H20v18h9.6c.8 0 1.4-.6 1.4-1.1z" fill="#F2A541"/><path d="M13 16h4M13 20h4M23 16h4M23 20h4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  }

  function nav(active) {
    const u = DB.me();
    const links = [['index.html', 'Home', 'home'], ['browse.html', 'Browse Books', 'browse'], ['pickup.html', 'Pickup Points', 'pickup'], ['dashboard.html', 'Dashboard', 'dashboard']];
    const right = u
      ? `<span class="karma-pill" title="Karma points">✨ ${u.karma}</span><a class="btn btn-primary btn-sm" href="add-book.html">+ Donate a book</a>
         <div class="avatar" title="${esc(u.name)}">${esc(initials(u.name))}</div><button class="btn btn-outline btn-sm" id="logoutBtn">Log out</button>`
      : `<a class="btn btn-outline btn-sm" href="auth.html">Log in</a><a class="btn btn-primary btn-sm" href="auth.html?tab=register">Join free</a>`;
    document.getElementById('nav').innerHTML = `<header class="nav"><div class="container nav-in">
      <a class="brand" href="index.html">${logoSvg()}CampusShelf</a>
      <nav class="nav-links" id="navLinks">${links.map(l => `<a href="${l[0]}" class="${active === l[2] ? 'active' : ''}">${l[1]}</a>`).join('')}</nav>
      <div class="nav-right">${right}<button class="burger" id="burger" aria-label="Menu">☰</button></div></div></header>`;
    document.getElementById('burger').onclick = () => document.getElementById('navLinks').classList.toggle('open');
    const lo = document.getElementById('logoutBtn');
    if (lo) lo.onclick = () => { DB.logout(); toast('You have been logged out.'); setTimeout(() => location.href = 'index.html', 600); };
  }

  function footer() {
    const el = document.getElementById('footer'); if (!el) return;
    el.innerHTML = `<footer class="footer"><div class="container"><div class="foot-grid">
      <div><div class="brand" style="color:#fff;margin-bottom:10px">${logoSvg()}CampusShelf</div>
      <p style="max-width:340px;font-size:.92rem">A college-only book exchange where every textbook gets a second semester. Built by students, for students.</p></div>
      <div><h4>Explore</h4><a href="browse.html">Browse books</a><a href="add-book.html">Donate a book</a><a href="pickup.html">Pickup points</a></div>
      <div><h4>Account</h4><a href="auth.html">Log in</a><a href="auth.html?tab=register">Create account</a><a href="dashboard.html">My dashboard</a></div>
      </div><div class="foot-bot"><span>© ${new Date().getFullYear()} CampusShelf. All rights reserved.</span><span>Pass it on. Learn more. Spend less.</span></div></div></footer><div class="toasts" id="toasts"></div>`;
  }

  function toast(msg, type = 'ok') {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.id = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = msg; box.appendChild(t);
    setTimeout(() => { t.style.opacity = 0; t.style.transition = '.4s'; setTimeout(() => t.remove(), 400); }, 3200);
  }

  function modal({ title, body, ok = 'Confirm', cancel = 'Cancel', onOk }) {
    const o = document.createElement('div'); o.className = 'overlay';
    o.innerHTML = `<div class="modal" role="dialog"><h3>${title}</h3><div>${body}</div><div class="acts">
      <button class="btn btn-outline" data-x>${cancel}</button><button class="btn btn-primary" data-ok>${ok}</button></div></div>`;
    document.body.appendChild(o);
    const close = () => o.remove();
    o.addEventListener('click', e => { if (e.target === o || e.target.hasAttribute('data-x')) close(); });
    o.querySelector('[data-ok]').onclick = () => { if (onOk(o) !== false) close(); };
    return o;
  }

  function reveal() {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    document.querySelectorAll('.reveal:not(.in)').forEach((el, i) => { el.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms'; io.observe(el); });
  }

  function countUp(el, to, prefix = '') {
    const t0 = performance.now(), dur = 1400;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = prefix + Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN'); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  function requireLogin() {
    if (!DB.me()) { location.href = 'auth.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search); return false; }
    return true;
  }
  function init(active) { nav(active); footer(); reveal(); }

  return { esc, cover, condDots, priceTag, statusBadge, bookCard, nav, footer, toast, modal, reveal, countUp, requireLogin, init, ago, dateStr, initials };
})();
