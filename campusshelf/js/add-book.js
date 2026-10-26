UI.init('dashboard');
if (UI.requireLogin()) {
  const $ = (id) => document.getElementById(id);
  const me = DB.me();
  const state = { condition: 'good', mode: 'free', photo: '' };

  DB.BRANCHES.forEach(b => $('branch').insertAdjacentHTML('beforeend', `<option>${b}</option>`));
  if (me.branch) $('branch').value = me.branch;
  for (let i = 1; i <= 8; i++) $('sem').insertAdjacentHTML('beforeend', `<option value="${i}">Semester ${i}</option>`);
  DB.PICKUPS.forEach(p => $('pickup').insertAdjacentHTML('beforeend', `<option value="${p.id}">${p.name}</option>`));
  if (DB.isFaculty(me)) $('recWrap').style.display = 'flex';

  function drawOpts() {
    $('condOpts').innerHTML = Object.entries(DB.CONDITIONS).map(([k, v]) =>
      `<div class="opt ${state.condition === k ? 'sel' : ''}" data-c="${k}"><b>${v.label}</b><span>${v.hint}</span></div>`).join('');
    $('modeOpts').innerHTML = Object.entries(DB.MODES).map(([k, v]) =>
      `<div class="opt ${state.mode === k ? 'sel' : ''}" data-m="${k}"><b>${v.icon} ${v.label}</b></div>`).join('');
    $('priceField').style.display = state.mode === 'sale' ? 'block' : 'none';
    $('lendField').style.display = state.mode === 'lend' ? 'block' : 'none';
    document.querySelectorAll('[data-c]').forEach(e => e.onclick = () => { state.condition = e.dataset.c; drawOpts(); preview(); });
    document.querySelectorAll('[data-m]').forEach(e => e.onclick = () => { state.mode = e.dataset.m; drawOpts(); preview(); });
  }

  function current() {
    return { id: 'preview', title: $('title').value || 'Your book title', author: $('author').value, subject: $('subject').value || 'Subject',
      branch: $('branch').value, semester: $('sem').value || 1, condition: state.condition, mode: state.mode, price: $('price').value || 0,
      photo: state.photo, ownerId: me.id, status: 'available', recommended: $('rec').checked, createdAt: Date.now() };
  }
  function preview() {
    const b = current();
    $('preview').innerHTML = UI.bookCard(b).replace('href="book.html?id=preview"', 'href="javascript:void(0)"').replace('reveal', 'reveal in');
  }

  // Photo upload — resized to keep localStorage small
  $('drop').onclick = () => $('photo').click();
  $('photo').onchange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 420, s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        state.photo = c.toDataURL('image/jpeg', .72); $('drop').textContent = '✔ Photo added (click to change)'; preview();
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(f);
  };

  ['title', 'author', 'subject', 'branch', 'sem', 'price', 'rec'].forEach(id => $(id).addEventListener('input', preview));

  $('form').onsubmit = (e) => {
    e.preventDefault();
    const b = current(); $('err').textContent = '';
    if (!$('title').value.trim() || !$('subject').value.trim()) return $('err').textContent = 'Please add a title and subject.';
    if (state.mode === 'sale' && !(+$('price').value > 0)) return $('err').textContent = 'Please enter a price for a low-price sale.';
    const saved = DB.addBook({
      title: b.title.trim(), author: b.author.trim(), subject: b.subject.trim(), branch: b.branch, semester: +b.semester,
      condition: state.condition, mode: state.mode, price: state.mode === 'sale' ? +$('price').value : 0,
      lendDays: state.mode === 'lend' ? +$('lendDays').value : undefined, photo: state.photo, notes: $('notes').value.trim(),
      pickupId: $('pickup').value, recommended: DB.isFaculty(me) && $('rec').checked
    });
    if (!saved) return $('err').textContent = 'Could not save. Storage may be full; try a smaller photo.';
    UI.toast('Book published! Thank you for passing it on.');
    setTimeout(() => location.href = 'book.html?id=' + saved.id, 900);
  };

  drawOpts(); preview();
}
