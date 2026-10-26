UI.init('browse');
const $ = (id) => document.getElementById(id);

DB.BRANCHES.forEach(b => $('branch').insertAdjacentHTML('beforeend', `<option>${b}</option>`));
for (let i = 1; i <= 8; i++) $('sem').insertAdjacentHTML('beforeend', `<option value="${i}">Semester ${i}</option>`);
$('conds').innerHTML = Object.entries(DB.CONDITIONS).map(([k, v]) => `<label class="check"><input type="checkbox" class="cond" value="${k}"> ${v.label}</label>`).join('');
$('modes').innerHTML = Object.entries(DB.MODES).map(([k, v]) => `<label class="check"><input type="checkbox" class="mode" value="${k}"> ${v.icon} ${v.label}</label>`).join('');

const params = new URLSearchParams(location.search);
if (params.get('q')) $('q').value = params.get('q');

function render() {
  const q = $('q').value.trim().toLowerCase();
  const conds = [...document.querySelectorAll('.cond:checked')].map(x => x.value);
  const modes = [...document.querySelectorAll('.mode:checked')].map(x => x.value);
  let list = DB.books().filter(b =>
    (!q || (b.title + ' ' + b.author + ' ' + b.subject).toLowerCase().includes(q)) &&
    (!$('branch').value || b.branch === $('branch').value) &&
    (!$('sem').value || String(b.semester) === $('sem').value) &&
    (!conds.length || conds.includes(b.condition)) &&
    (!modes.length || modes.includes(b.mode)) &&
    (!$('rec').checked || b.recommended) &&
    (!$('avail').checked || b.status === 'available'));
  const sorters = {
    new: (a, b) => b.createdAt - a.createdAt,
    cond: (a, b) => DB.CONDITIONS[b.condition].score - DB.CONDITIONS[a.condition].score,
    price: (a, b) => (a.mode === 'sale' ? a.price : 0) - (b.mode === 'sale' ? b.price : 0),
    az: (a, b) => a.title.localeCompare(b.title)
  };
  list.sort(sorters[$('sort').value]);
  $('count').textContent = list.length + (list.length === 1 ? ' book found' : ' books found');
  $('results').innerHTML = list.length ? list.map(UI.bookCard).join('') :
    `<div class="empty" style="grid-column:1/-1"><div class="big">🔎</div><h3>No books match yet</h3>
     <p>Try removing a filter, or add this book to your wishlist and we will show it when someone lists it.</p>
     <button class="btn btn-primary btn-sm" id="wishBtn" style="margin-top:14px">♡ Add "${UI.esc(q || 'this search')}" to wishlist</button></div>`;
  const wb = $('wishBtn');
  if (wb) wb.onclick = () => {
    if (!UI.requireLogin()) return;
    if (!q) return UI.toast('Type a title or subject first, then add it to your wishlist.', 'err');
    DB.addWish(q); UI.toast('Added to your wishlist.');
  };
  UI.reveal();
}
['q', 'branch', 'sem', 'sort', 'rec', 'avail'].forEach(id => $(id).addEventListener('input', render));
document.querySelectorAll('.cond,.mode').forEach(x => x.addEventListener('change', render));
$('clear').onclick = () => {
  $('q').value = ''; $('branch').value = ''; $('sem').value = ''; $('rec').checked = false; $('avail').checked = true;
  document.querySelectorAll('.cond,.mode').forEach(x => x.checked = false); render();
};
render();
