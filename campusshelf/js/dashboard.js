UI.init('dashboard');
if (UI.requireLogin()) {
  const $ = (id) => document.getElementById(id);
  let tab = new URLSearchParams(location.search).get('tab') || 'books';

  const LEVELS = [[0, 'Newcomer'], [30, 'Page Turner'], [60, 'Book Buddy'], [100, 'Shelf Hero'], [160, 'Campus Legend']];
  function level(k) { let i = 0; LEVELS.forEach((l, n) => { if (k >= l[0]) i = n; }); const next = LEVELS[i + 1]; return { name: LEVELS[i][1], next, pct: next ? Math.round((k - LEVELS[i][0]) / (next[0] - LEVELS[i][0]) * 100) : 100 }; }

  function mini(b) { return UI.cover(b, 'mini'); }

  function draw() {
    const me = DB.me();
    const myBooks = DB.books().filter(b => b.ownerId === me.id);
    const incoming = DB.reqs().filter(r => myBooks.some(b => b.id === r.bookId));
    const outgoing = DB.reqs().filter(r => r.requesterId === me.id);
    const wish = DB.wishlist(me.id), matches = DB.wishMatches(me);
    const given = myBooks.filter(b => ['given', 'lent'].includes(b.status)).length;
    const pending = incoming.filter(r => r.status === 'pending').length;

    $('head').innerHTML = `<h1>Hi, ${UI.esc(me.name.split(' ').slice(DB.isFaculty(me) ? 0 : 0, 2).join(' '))} 👋</h1>
      <p>${DB.ROLES[me.role]}${me.branch ? ' · ' + UI.esc(me.branch) + ', Year ' + UI.esc(me.year) : ''}${me.dept ? ' · ' + UI.esc(me.dept) + ' Dept.' : ''}${DB.isFaculty(me) ? ' · <span class="badge green">Verified faculty</span>' : ''}</p>`;

    $('kpis').innerHTML = [['📚', myBooks.length, 'Books listed'], ['🤝', given, 'Books passed on'], ['📥', pending, 'Requests waiting'], ['✨', me.karma, 'Karma points']]
      .map(k => `<div class="stat"><div style="font-size:1.6rem">${k[0]}</div><b data-n="${k[1]}">0</b><span>${k[2]}</span></div>`).join('');
    document.querySelectorAll('#kpis [data-n]').forEach(el => UI.countUp(el, +el.dataset.n));

    const lv = level(me.karma);
    $('levelCard').innerHTML = `<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">
      <b>Level: ${lv.name}</b><span class="muted">${lv.next ? (lv.next[0] - me.karma) + ' karma to ' + lv.next[1] : 'Top level reached 🎉'}</span></div>
      <div class="progress"><i style="width:0" data-w="${lv.pct}%"></i></div>
      <p class="muted" style="font-size:.88rem;margin-top:10px">Earn <b>+10</b> each time one of your books reaches a new owner. ${DB.isFaculty(me) ? 'Faculty never pay karma to receive books.' : 'Free books cost 5 karma to claim.'}</p>`;
    setTimeout(() => document.querySelectorAll('.progress i').forEach(i => i.style.width = i.dataset.w), 80);

    const tabs = [['books', 'My books', myBooks.length], ['incoming', 'Requests received', pending], ['outgoing', 'My requests', outgoing.length], ['wishlist', 'Wishlist', wish.length + matches.length]];
    $('tabs').innerHTML = tabs.map(t => `<button class="tab ${tab === t[0] ? 'active' : ''}" data-t="${t[0]}">${t[1]}<span class="count">${t[2]}</span></button>`).join('');
    document.querySelectorAll('.tab').forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });

    let html = '';
    if (tab === 'books') {
      html = myBooks.length ? myBooks.map(b => `<div class="list-row">${mini(b)}
        <div class="grow"><b>${UI.esc(b.title)}</b><div class="muted" style="font-size:.88rem">${UI.esc(b.branch)} · Sem ${b.semester} · ${DB.CONDITIONS[b.condition].label}</div><div style="margin-top:6px">${UI.statusBadge(b.status)}</div></div>
        <div class="actions"><a class="btn btn-outline btn-sm" href="book.html?id=${b.id}">View</a>
        ${b.status === 'lent' ? `<button class="btn btn-primary btn-sm" data-return="${b.id}">Mark returned</button>` : ''}
        ${['available', 'given'].includes(b.status) ? `<button class="btn btn-danger btn-sm" data-del="${b.id}">Remove</button>` : ''}</div></div>`).join('')
        : empty('📖', 'You have not listed any books yet', 'Clear your shelf and help the next batch.', '<a class="btn btn-primary" href="add-book.html">Donate your first book</a>');
    }
    if (tab === 'incoming') {
      html = incoming.length ? incoming.map(r => { const b = DB.book(r.bookId), u = DB.user(r.requesterId); return `<div class="list-row">${mini(b)}
        <div class="grow"><b>${UI.esc(b.title)}</b><div class="muted" style="font-size:.88rem">From <b>${UI.esc(u.name)}</b> (${DB.ROLES[u.role]}${u.branch ? ', ' + UI.esc(u.branch) : ''}) · ${UI.ago(r.createdAt)}</div>
          ${r.message ? `<div style="margin-top:6px;font-size:.9rem">“${UI.esc(r.message)}”</div>` : ''}<div style="margin-top:6px">${reqBadge(r.status)}</div></div>
        <div class="actions">
          ${r.status === 'pending' ? `<button class="btn btn-primary btn-sm" data-act="approved" data-id="${r.id}">Approve</button><button class="btn btn-danger btn-sm" data-act="rejected" data-id="${r.id}">Decline</button>` : ''}
          ${r.status === 'approved' ? `<button class="btn btn-amber btn-sm" data-complete="${r.id}">Confirm handover</button><button class="btn btn-outline btn-sm" data-act="cancelled" data-id="${r.id}">Cancel</button>` : ''}
        </div></div>`; }).join('')
        : empty('📥', 'No requests yet', 'When someone asks for one of your books it will show up here.', '');
    }
    if (tab === 'outgoing') {
      html = outgoing.length ? outgoing.map(r => { const b = DB.book(r.bookId); if (!b) return ''; const p = DB.pickup(b.pickupId); return `<div class="list-row">${mini(b)}
        <div class="grow"><b>${UI.esc(b.title)}</b><div class="muted" style="font-size:.88rem">Owner: ${UI.esc(DB.user(b.ownerId).name)} · requested ${UI.ago(r.createdAt)}</div>
          ${r.status === 'approved' && p ? `<div style="margin-top:6px;font-size:.9rem">📍 Collect at <b>${UI.esc(p.name)}</b> (${p.slots.join(', ')})</div>` : ''}<div style="margin-top:6px">${reqBadge(r.status)}</div></div>
        <div class="actions"><a class="btn btn-outline btn-sm" href="book.html?id=${b.id}">View</a>${r.status === 'pending' ? `<button class="btn btn-danger btn-sm" data-act="cancelled" data-id="${r.id}">Cancel</button>` : ''}</div></div>`; }).join('')
        : empty('🔎', 'You have not requested any books', 'Browse the shelf and send your first request.', '<a class="btn btn-primary" href="browse.html">Browse books</a>');
    }
    if (tab === 'wishlist') {
      html = `<form class="card" id="wishForm" style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap"><input class="input" id="wishText" placeholder="Book or subject you are looking for…" style="flex:1;min-width:200px"><button class="btn btn-primary">Add to wishlist</button></form>`;
      if (matches.length) html += `<h3 style="margin:10px 0 14px;font-size:1.15rem">🔔 Good news, these just matched your wishlist</h3><div class="grid g3" style="margin-bottom:26px">${matches.map(UI.bookCard).join('')}</div>`;
      html += wish.length ? wish.map(w => `<div class="list-row"><div class="grow"><b>${UI.esc(w.text)}</b></div><button class="btn btn-danger btn-sm" data-wdel="${w.id}">Remove</button></div>`).join('')
        : empty('♡', 'Your wishlist is empty', 'Add a book or subject and it will light up here once someone lists it.', '');
    }
    $('panel').innerHTML = html; UI.reveal(); bind();
  }

  const empty = (i, t, p, a) => `<div class="empty"><div class="big">${i}</div><h3>${t}</h3><p>${p}</p><div style="margin-top:14px">${a}</div></div>`;
  const reqBadge = (s) => ({ pending: '<span class="badge amber">Waiting for owner</span>', approved: '<span class="badge green">Approved: arrange pickup</span>', rejected: '<span class="badge red">Declined</span>', completed: '<span class="badge navy">Completed</span>', cancelled: '<span class="badge gray">Cancelled</span>' }[s]);

  function bind() {
    document.querySelectorAll('[data-act]').forEach(b => b.onclick = () => { DB.setRequest(b.dataset.id, b.dataset.act); UI.toast('Request ' + b.dataset.act + '.'); draw(); });
    document.querySelectorAll('[data-complete]').forEach(b => b.onclick = () => { DB.completeRequest(b.dataset.complete); UI.toast('Handover confirmed. +10 karma! 🎉'); UI.nav('dashboard'); draw(); });
    document.querySelectorAll('[data-return]').forEach(b => b.onclick = () => { DB.returnLent(b.dataset.return); UI.toast('Book marked as returned.'); draw(); });
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => UI.modal({ title: 'Remove this book?', body: '<p class="muted">It will disappear from the shelf. This cannot be undone.</p>', ok: 'Remove', onOk: () => { DB.deleteBook(b.dataset.del); UI.toast('Book removed.'); draw(); } }));
    document.querySelectorAll('[data-wdel]').forEach(b => b.onclick = () => { DB.removeWish(b.dataset.wdel); draw(); });
    const wf = document.getElementById('wishForm');
    if (wf) wf.onsubmit = (e) => { e.preventDefault(); const t = $('wishText').value; if (!t.trim()) return; DB.addWish(t); UI.toast('Added to wishlist.'); draw(); };
  }
  draw();
}
