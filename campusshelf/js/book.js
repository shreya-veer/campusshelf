UI.init('browse');
const id = new URLSearchParams(location.search).get('id');
const b = DB.book(id);
const root = document.getElementById('detail');

if (!b) {
  root.innerHTML = `<div class="empty"><div class="big">📭</div><h2>Book not found</h2><p>It may have been removed by its owner.</p><a class="btn btn-primary" href="browse.html" style="margin-top:16px">Back to browse</a></div>`;
} else {
  document.title = b.title + ' — CampusShelf';
  const owner = DB.user(b.ownerId), pick = DB.pickup(b.pickupId), me = DB.me();
  const cond = DB.CONDITIONS[b.condition];
  const mine = me && me.id === b.ownerId;
  const myReq = me && DB.reqs().find(r => r.bookId === b.id && r.requesterId === me.id && ['pending', 'approved'].includes(r.status));
  const cost = me ? DB.costOf(b, me) : 0;

  let action;
  if (mine) action = `<a class="btn btn-outline btn-block" href="dashboard.html">Manage in dashboard</a>`;
  else if (b.status !== 'available') action = `<button class="btn btn-primary btn-block" disabled>${b.status === 'lent' ? 'Currently on loan' : b.status === 'reserved' ? 'Reserved for someone' : 'Already passed on'}</button>`;
  else if (myReq) action = `<button class="btn btn-primary btn-block" disabled>Request ${myReq.status} ✔</button>`;
  else action = `<button class="btn btn-primary btn-block" id="reqBtn">${b.mode === 'sale' ? 'Request to buy · ₹' + b.price : b.mode === 'lend' ? 'Request to borrow' : b.mode === 'exchange' ? 'Offer an exchange' : 'Request this book'}</button>`;

  root.innerHTML = `
  <p class="muted" style="padding-top:22px"><a href="browse.html">← All books</a></p>
  <div class="detail">
    <div>${UI.cover(b)}</div>
    <div>
      <div class="badges" style="margin-bottom:10px">
        ${b.recommended ? '<span class="badge amber">⭐ Faculty pick</span>' : ''}
        <span class="badge">${DB.MODES[b.mode].icon} ${DB.MODES[b.mode].label}</span>${UI.statusBadge(b.status)}
      </div>
      <h1 style="font-size:2.1rem">${UI.esc(b.title)}</h1>
      <p class="muted" style="margin-top:4px">by ${UI.esc(b.author || 'Unknown author')}</p>

      <div class="card" style="margin:22px 0">
        <b>Condition: ${cond.label}</b> <span class="muted">· ${cond.hint}</span>
        <div class="meter">${[1, 2, 3, 4].map(i => `<span class="${i <= cond.score ? 'on' : ''}"></span>`).join('')}</div>
        <table class="info-table">
          <tr><td>Subject</td><td>${UI.esc(b.subject)}</td></tr>
          <tr><td>Branch / Semester</td><td>${UI.esc(b.branch)} · Semester ${UI.esc(b.semester)}</td></tr>
          <tr><td>Type</td><td>${b.mode === 'sale' ? '₹' + b.price + ' (low price)' : b.mode === 'lend' ? 'Lend for ' + (b.lendDays || 90) + ' days' : DB.MODES[b.mode].label}</td></tr>
          <tr><td>Listed by</td><td>${UI.esc(owner?.name || 'Member')} ${DB.isFaculty(owner) ? '<span class="badge green">Verified faculty</span>' : `<span class="muted">(${DB.ROLES[owner?.role] || ''})</span>`}</td></tr>
          <tr><td>Listed</td><td>${UI.ago(b.createdAt)}</td></tr>
        </table>
        ${b.notes ? `<p><b>Owner's note:</b> <span class="muted">${UI.esc(b.notes)}</span></p>` : ''}
      </div>

      ${pick ? `<div class="card" style="margin-bottom:22px;display:flex;gap:14px;align-items:flex-start">
        <div class="icon-bubble" style="margin:0">${pick.icon}</div>
        <div><b>Pickup: ${UI.esc(pick.name)}</b><p class="muted" style="font-size:.9rem">${UI.esc(pick.loc)}</p>
        <div>${pick.slots.map(s => `<span class="slot">${s}</span>`).join('')}</div>
        <a href="pickup.html?id=${pick.id}" style="font-size:.88rem;display:inline-block;margin-top:8px">View on campus map →</a></div></div>` : ''}

      ${cost && me && b.status === 'available' && !mine ? `<p class="muted" style="margin-bottom:10px">✨ Claiming this book costs <b>${cost} karma</b>. You have ${me.karma}.</p>` : ''}
      ${action}

      <h3 style="margin:34px 0 4px;font-size:1.25rem">Ownership chain</h3>
      <p class="muted" style="font-size:.9rem">${(b.history || []).filter(h => h.to !== '—').length} handover(s) so far</p>
      <div class="timeline">
        ${[...(b.history || [])].reverse().map(h => `<div class="tl-item"><b>${UI.esc(h.from)}${h.to !== '—' ? ' → ' + UI.esc(h.to) : ''}</b><span>${UI.esc(h.note)} · ${UI.dateStr(h.date)}</span></div>`).join('')}
      </div>
    </div>
  </div>`;

  const rb = document.getElementById('reqBtn');
  if (rb) rb.onclick = () => {
    if (!UI.requireLogin()) return;
    UI.modal({
      title: 'Send request', ok: 'Send request',
      body: `<p class="muted" style="margin-bottom:12px">Add a short note for ${UI.esc(owner.name)}. Say which semester you are in and when you can collect.</p><textarea class="input" id="msg" placeholder="Hi! I am in semester 3 and can collect after 4 pm…"></textarea>`,
      onOk: (o) => {
        const r = DB.requestBook(b.id, o.querySelector('#msg').value);
        if (r.error) { UI.toast(r.error, 'err'); return false; }
        UI.toast('Request sent! Track it in your dashboard.'); setTimeout(() => location.reload(), 900);
      }
    });
  };
}
