UI.nav('');
const $ = (id) => document.getElementById(id);
const qs = new URLSearchParams(location.search);
const next = qs.get('next') || 'dashboard.html';
let role = 'student';

DB.BRANCHES.forEach(b => { $('rbranch').insertAdjacentHTML('beforeend', `<option>${b}</option>`); $('rdept').insertAdjacentHTML('beforeend', `<option>${b}</option>`); });

function drawRoles() {
  $('roles').innerHTML = Object.entries(DB.ROLES).map(([k, v]) => `<div class="opt ${role === k ? 'sel' : ''}" data-r="${k}"><b>${v}</b></div>`).join('');
  $('studentFields').style.display = (role === 'student') ? 'grid' : 'none';
  $('deptField').style.display = (role === 'teacher' || role === 'staff') ? 'block' : 'none';
  document.querySelectorAll('[data-r]').forEach(e => e.onclick = () => { role = e.dataset.r; drawRoles(); });
}
function tab(t) {
  document.querySelectorAll('#seg button').forEach(b => b.classList.toggle('active', b.dataset.t === t));
  $('loginForm').style.display = t === 'login' ? 'block' : 'none';
  $('regForm').style.display = t === 'register' ? 'block' : 'none';
}
document.querySelectorAll('#seg button').forEach(b => b.onclick = () => tab(b.dataset.t));
if (qs.get('tab') === 'register') tab('register');

document.querySelectorAll('[data-demo]').forEach(b => b.onclick = () => {
  const [e, p] = b.dataset.demo.split('|'); $('lemail').value = e; $('lpw').value = p;
});

$('loginForm').onsubmit = (e) => {
  e.preventDefault();
  const r = DB.login($('lemail').value, $('lpw').value);
  if (r.error) return $('lerr').textContent = r.error;
  UI.toast('Welcome back, ' + r.user.name.split(' ')[0] + '!'); setTimeout(() => location.href = next, 700);
};
$('regForm').onsubmit = (e) => {
  e.preventDefault();
  const r = DB.register({ name: $('rname').value, email: $('remail').value, pw: $('rpw').value, role,
    branch: role === 'student' ? $('rbranch').value : '', year: role === 'student' ? +$('ryear').value : '',
    dept: (role === 'teacher' || role === 'staff') ? $('rdept').value : '' });
  if (r.error) return $('rerr').textContent = r.error;
  UI.toast('Account created. Welcome to CampusShelf!'); setTimeout(() => location.href = next, 800);
};
drawRoles();
