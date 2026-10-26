UI.init('pickup');
const map = document.getElementById('map'), side = document.getElementById('side');
let sel = new URLSearchParams(location.search).get('id') || DB.PICKUPS[0].id;

map.insertAdjacentHTML('beforeend', DB.PICKUPS.map(p =>
  `<button class="pin" data-id="${p.id}" style="left:${p.x}%;top:${p.y}%" title="${UI.esc(p.name)}">📍</button>`).join(''));

function draw() {
  document.querySelectorAll('.pin').forEach(p => p.classList.toggle('sel', p.dataset.id === sel));
  const p = DB.pickup(sel);
  const waiting = DB.books().filter(b => b.pickupId === sel && b.status === 'available');
  side.innerHTML = `
    <div class="card" style="margin-bottom:18px">
      <div class="icon-bubble">${p.icon}</div>
      <h3>${UI.esc(p.name)}</h3><p class="muted">${UI.esc(p.loc)}</p>
      <p style="margin:10px 0">${UI.esc(p.desc)}</p>
      <b style="font-size:.85rem">Time slots</b><div>${p.slots.map(s => `<span class="slot">${s}</span>`).join('')}</div>
    </div>
    <h4 style="font-family:Inter,sans-serif;margin-bottom:10px">${waiting.length} book${waiting.length === 1 ? '' : 's'} waiting here</h4>
    ${waiting.length ? waiting.map(b => `<a class="list-row" href="book.html?id=${b.id}" style="color:inherit">${UI.cover(b, 'mini')}<div class="grow"><b>${UI.esc(b.title)}</b><div class="muted" style="font-size:.85rem">${UI.esc(b.branch)} · ${DB.CONDITIONS[b.condition].label}</div></div><span class="price">${UI.priceTag(b)}</span></a>`).join('')
      : '<p class="muted">No books listed for this spot yet.</p>'}
    <div class="card" style="margin-top:18px;background:var(--amber-l);border-color:#f2dcb0"><b>Safety tips</b>
      <ul style="margin:8px 0 0 18px;font-size:.9rem;color:#6b4a10"><li>Meet only at listed points and slots.</li><li>Check the book before you confirm the handover.</li><li>Tell a friend where you are going.</li></ul></div>`;
}
map.addEventListener('click', e => { const pin = e.target.closest('.pin'); if (pin) { sel = pin.dataset.id; draw(); } });
draw();
