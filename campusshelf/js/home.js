UI.init('home');

// Floating book stack in hero
const top3 = DB.books().filter(b => b.recommended).slice(0, 3);
document.getElementById('heroStack').innerHTML = top3.map(b => UI.cover(b)).join('');

// Featured books
document.getElementById('featured').innerHTML = DB.books()
  .filter(b => b.status === 'available').sort((a, b) => b.createdAt - a.createdAt).slice(0, 6)
  .map(UI.bookCard).join('');

// Stats counters (animate when visible)
const s = DB.stats();
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { const el = e.target; UI.countUp(el, s[el.dataset.count], el.dataset.prefix || ''); io.unobserve(el); }
}), { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => io.observe(el));

// How it works toggle
const HOW = {
  get: [['Search', 'Filter by branch, semester or subject and read the condition rating.'], ['Request', 'Send a short note to the owner. Free books cost a few karma points.'], ['Collect', 'Meet at the agreed pickup point and slot, then confirm you got it.']],
  give: [['List it', 'Add the title, a photo and an honest condition rating in two minutes.'], ['Approve', 'Choose who gets it from the requests that come in.'], ['Hand over', 'Meet at a pickup point, confirm the handover and earn karma.']]
};
function drawHow(k) {
  document.getElementById('howSteps').innerHTML = HOW[k].map((s, i) =>
    `<div class="card hover step reveal"><div class="num">0${i + 1}</div><h3 style="font-size:1.2rem;margin:6px 0">${s[0]}</h3><p class="muted">${s[1]}</p></div>`).join('');
  UI.reveal();
}
document.querySelectorAll('#howSwitch button').forEach(btn => btn.onclick = () => {
  document.querySelectorAll('#howSwitch button').forEach(x => x.classList.remove('active'));
  btn.classList.add('active'); drawHow(btn.dataset.t);
});
drawHow('get');
