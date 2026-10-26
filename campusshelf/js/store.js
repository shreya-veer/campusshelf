/* CampusShelf — data layer (localStorage).
   Swap this file for real API calls (Firebase / Node + DB) when you go to production. */
const DB = (() => {
  const K = { users: 'cs_users', books: 'cs_books', reqs: 'cs_reqs', wish: 'cs_wish', sess: 'cs_session', seed: 'cs_seeded_v1' };
  const get = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
  const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const uid = (p) => p + Math.random().toString(36).slice(2, 9);
  const hash = (s) => btoa(unescape(encodeURIComponent(s)));
  const day = 86400000;

  const BRANCHES = ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Electronics', 'Chemical', 'Commerce', 'Science', 'Arts', 'Management'];
  const CONDITIONS = {
    'like-new': { label: 'Like New', score: 4, hint: 'No marks, crisp pages' },
    'good': { label: 'Good', score: 3, hint: 'Minor wear, clean inside' },
    'fair': { label: 'Fair', score: 2, hint: 'Worn cover, readable' },
    'annotated': { label: 'Heavy Notes', score: 1, hint: 'Highlighted / written notes' }
  };
  const MODES = {
    free: { label: 'Free', icon: '🎁' },
    sale: { label: 'Low price', icon: '🏷️' },
    exchange: { label: 'Exchange', icon: '🔄' },
    lend: { label: 'Lend', icon: '⏳' }
  };
  const ROLES = { student: 'Student', teacher: 'Teacher', staff: 'Staff', alumni: 'Alumni' };
  const PICKUPS = [
    { id: 'p1', name: 'Central Library Gate', loc: 'Ground floor, main entrance', slots: ['10:00–11:00', '13:00–14:00', '16:00–17:00'], x: 46, y: 32, icon: '📚', desc: 'Quiet, staffed and camera-covered. Best spot for most handovers.' },
    { id: 'p2', name: 'Canteen Notice Board', loc: 'Beside the main canteen', slots: ['12:30–14:00', '15:30–17:00'], x: 74, y: 62, icon: '☕', desc: 'Busy at lunch, so easy to find. Great for quick exchanges.' },
    { id: 'p3', name: 'Department Office', loc: 'Block A, first floor', slots: ['10:00–12:00', '14:00–16:00'], x: 22, y: 42, icon: '🏛️', desc: 'Hand over books to teachers or collect department donations.' },
    { id: 'p4', name: 'Main Gate Security Desk', loc: 'Main gate, left cabin', slots: ['09:00–10:00', '17:00–18:00'], x: 50, y: 88, icon: '🛡️', desc: 'Ideal for day scholars and alumni visiting the campus.' },
    { id: 'p5', name: 'Hostel Common Room', loc: 'Boys & Girls hostel lobby', slots: ['18:00–20:00'], x: 84, y: 24, icon: '🏠', desc: 'Evening pickups for hostel residents.' }
  ];

  function seed() {
    if (get(K.seed, false)) return;
    const users = [
      { id: 'u1', name: 'Aarav Shah', email: 'aarav@college.edu', pw: hash('demo123'), role: 'student', branch: 'Computer Science', year: 4, dept: '', karma: 60 },
      { id: 'u2', name: 'Dr. Meera Iyer', email: 'prof@college.edu', pw: hash('prof123'), role: 'teacher', branch: '', year: '', dept: 'Computer Science', karma: 90 },
      { id: 'u3', name: 'Riya Patel', email: 'riya@college.edu', pw: hash('demo123'), role: 'alumni', branch: 'Electronics', year: 2022, dept: '', karma: 40 },
      { id: 'u4', name: 'Demo Student', email: 'demo@college.edu', pw: hash('demo123'), role: 'student', branch: 'Computer Science', year: 1, dept: '', karma: 20 },
      { id: 'u5', name: 'Prof. Rakesh Nair', email: 'rakesh@college.edu', pw: hash('prof123'), role: 'teacher', branch: '', year: '', dept: 'Mechanical', karma: 70 }
    ];
    const mk = (i, o) => Object.assign({ id: 'b' + i, status: 'available', mode: 'free', price: 0, photo: '', notes: '', recommended: false, history: [], createdAt: Date.now() - (i * 1.3 + 1) * day }, o);
    const books = [
      mk(1, { title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', subject: 'Data Structures & Algorithms', branch: 'Computer Science', semester: 4, condition: 'good', ownerId: 'u2', recommended: true, pickupId: 'p3', notes: 'The classic CLRS. Chapter exercises partly solved in pencil.', history: [{ from: 'Dr. Meera Iyer', to: '—', date: Date.now() - 400 * day, note: 'Bought new' }] }),
      mk(2, { title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', subject: 'Operating Systems', branch: 'Computer Science', semester: 5, condition: 'like-new', ownerId: 'u1', mode: 'sale', price: 250, pickupId: 'p1', notes: 'Dinosaur book, 10th edition. Never opened more than twice.' }),
      mk(3, { title: 'Engineering Mathematics Vol. II', author: 'B. S. Grewal', subject: 'Engineering Mathematics', branch: 'Mechanical', semester: 2, condition: 'fair', ownerId: 'u5', recommended: true, pickupId: 'p3', notes: 'Cover is worn but all pages are intact.' }),
      mk(4, { title: 'Digital Design', author: 'M. Morris Mano', subject: 'Digital Electronics', branch: 'Electronics', semester: 3, condition: 'good', ownerId: 'u3', pickupId: 'p2', notes: 'Includes my handwritten K-map shortcuts.' }),
      mk(5, { title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', subject: 'DBMS', branch: 'Computer Science', semester: 5, condition: 'annotated', ownerId: 'u1', pickupId: 'p1', notes: 'Heavily highlighted, great for exam revision.' }),
      mk(6, { title: 'Strength of Materials', author: 'R. K. Bansal', subject: 'Strength of Materials', branch: 'Civil', semester: 4, condition: 'good', ownerId: 'u5', mode: 'lend', price: 0, lendDays: 90, pickupId: 'p3', notes: 'Lending for one semester. Please return in good shape.' }),
      mk(7, { title: 'Principles of Marketing', author: 'Philip Kotler', subject: 'Marketing Management', branch: 'Management', semester: 1, condition: 'like-new', ownerId: 'u3', mode: 'exchange', pickupId: 'p4', notes: 'Looking to exchange for a finance book.' }),
      mk(8, { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', subject: 'Computer Networks', branch: 'Computer Science', semester: 6, condition: 'good', ownerId: 'u2', recommended: true, pickupId: 'p1', notes: 'Faculty recommended for the semester 6 syllabus.' }),
      mk(9, { title: 'Thermodynamics: An Engineering Approach', author: 'Cengel & Boles', subject: 'Thermodynamics', branch: 'Mechanical', semester: 3, condition: 'fair', ownerId: 'u1', mode: 'sale', price: 180, pickupId: 'p2' }),
      mk(10, { title: 'Financial Accounting', author: 'T. S. Grewal', subject: 'Accounting', branch: 'Commerce', semester: 1, condition: 'like-new', ownerId: 'u3', pickupId: 'p4' }),
      mk(11, { title: 'Engineering Physics', author: 'H. K. Malik', subject: 'Physics', branch: 'Science', semester: 1, condition: 'good', ownerId: 'u5', recommended: true, pickupId: 'p5' }),
      mk(12, { title: 'Signals and Systems', author: 'Alan V. Oppenheim', subject: 'Signals & Systems', branch: 'Electrical', semester: 4, condition: 'annotated', ownerId: 'u1', pickupId: 'p5', notes: 'Notes in margins from two earlier owners.',
        history: [{ from: 'Prof. Rakesh Nair', to: 'Aarav Shah', date: Date.now() - 220 * day, note: 'Passed on after syllabus change' }] })
    ];
    // every sample book starts its ownership chain with a "listed" entry
    books.forEach(b => { if (!b.history.length) b.history = [{ from: users.find(u => u.id === b.ownerId).name, to: '—', date: b.createdAt, note: 'Listed on CampusShelf' }]; });
    const reqs = [
      { id: 'r1', bookId: 'b12', requesterId: 'u1', status: 'completed', message: 'Thanks, sir!', createdAt: Date.now() - 225 * day },
      { id: 'r2', bookId: 'b4', requesterId: 'u4', status: 'pending', message: 'Hi! I am in semester 3 next term and would love this.', createdAt: Date.now() - 1 * day }
    ];
    set(K.users, users); set(K.books, books); set(K.reqs, reqs); set(K.wish, [{ id: 'w1', userId: 'u4', text: 'Data Structures' }]); set(K.seed, true);
  }

  const users = () => get(K.users, []);
  const user = (id) => users().find(u => u.id === id);
  const me = () => { const id = get(K.sess, null); return id ? user(id) : null; };
  const books = () => get(K.books, []);
  const book = (id) => books().find(b => b.id === id);
  const reqs = () => get(K.reqs, []);
  const saveBooks = (b) => set(K.books, b);
  const saveReqs = (r) => set(K.reqs, r);

  return {
    BRANCHES, CONDITIONS, MODES, ROLES, PICKUPS,
    init: seed, users, user, me, books, book, reqs,
    pickup: (id) => PICKUPS.find(p => p.id === id),
    login(email, pw) {
      const u = users().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!u || u.pw !== hash(pw)) return { error: 'Incorrect email or password.' };
      set(K.sess, u.id); return { user: u };
    },
    register(d) {
      if (!d.email || !d.name || !d.pw) return { error: 'Please fill in all required fields.' };
      if (d.pw.length < 6) return { error: 'Password must be at least 6 characters.' };
      if (users().some(u => u.email.toLowerCase() === d.email.trim().toLowerCase())) return { error: 'An account with this email already exists.' };
      const u = { id: uid('u'), name: d.name.trim(), email: d.email.trim(), pw: hash(d.pw), role: d.role, branch: d.branch || '', year: d.year || '', dept: d.dept || '', karma: 20 };
      set(K.users, [...users(), u]); set(K.sess, u.id); return { user: u };
    },
    logout() { localStorage.removeItem(K.sess); },
    isFaculty: (u) => u && (u.role === 'teacher' || u.role === 'staff'),

    addBook(d) {
      const u = me(); if (!u) return null;
      const b = Object.assign({ id: uid('b'), status: 'available', ownerId: u.id, createdAt: Date.now(), history: [{ from: u.name, to: '—', date: Date.now(), note: 'Listed on CampusShelf' }] }, d);
      saveBooks([b, ...books()]); return b;
    },
    deleteBook(id) { saveBooks(books().filter(b => b.id !== id)); saveReqs(reqs().filter(r => r.bookId !== id)); },

    /* Karma rule: free books cost 5 karma for students/alumni; faculty never pay. */
    costOf(b, u) { return (b.mode === 'free' && u && !this.isFaculty(u)) ? 5 : 0; },
    requestBook(bookId, message) {
      const u = me(); const b = book(bookId);
      if (!u) return { error: 'Please log in first.' };
      if (!b || b.status !== 'available') return { error: 'This book is no longer available.' };
      if (b.ownerId === u.id) return { error: 'This is your own book.' };
      if (reqs().some(r => r.bookId === bookId && r.requesterId === u.id && ['pending', 'approved'].includes(r.status))) return { error: 'You already requested this book.' };
      if (u.karma < this.costOf(b, u)) return { error: 'You need ' + this.costOf(b, u) + ' karma points. Donate a book to earn more.' };
      const r = { id: uid('r'), bookId, requesterId: u.id, status: 'pending', message: message || '', createdAt: Date.now() };
      saveReqs([r, ...reqs()]); return { request: r };
    },
    setRequest(id, status) {
      const all = reqs(); const r = all.find(x => x.id === id); if (!r) return;
      r.status = status;
      if (status === 'approved') {
        const b = book(r.bookId); const bs = books(); bs.find(x => x.id === b.id).status = 'reserved'; saveBooks(bs);
        all.forEach(o => { if (o.bookId === r.bookId && o.id !== id && o.status === 'pending') o.status = 'rejected'; });
      }
      if (status === 'rejected' || status === 'cancelled') {
        const bs = books(); const b = bs.find(x => x.id === r.bookId);
        if (b && b.status === 'reserved') { b.status = 'available'; saveBooks(bs); }
      }
      saveReqs(all);
    },
    /* Owner confirms handover: books move on, karma updates, history grows. */
    completeRequest(id) {
      const all = reqs(); const r = all.find(x => x.id === id); if (!r) return;
      const bs = books(); const b = bs.find(x => x.id === r.bookId);
      const us = users(); const donor = us.find(u => u.id === b.ownerId); const taker = us.find(u => u.id === r.requesterId);
      const cost = this.costOf(b, taker);
      r.status = 'completed';
      b.history = [...(b.history || []), { from: donor.name, to: taker.name, date: Date.now(), note: b.mode === 'lend' ? 'Lent for ' + (b.lendDays || 90) + ' days' : 'Handed over at ' + (this.pickup(b.pickupId)?.name || 'campus') }];
      donor.karma += 10; taker.karma = Math.max(0, taker.karma - cost);
      if (b.mode === 'lend') { b.status = 'lent'; b.borrowerId = taker.id; }
      else { b.status = 'given'; }
      set(K.users, us); saveBooks(bs); saveReqs(all);
    },
    returnLent(bookId) {
      const bs = books(); const b = bs.find(x => x.id === bookId); if (!b) return;
      b.status = 'available'; delete b.borrowerId; b.history.push({ from: 'Borrower', to: user(b.ownerId).name, date: Date.now(), note: 'Returned' }); saveBooks(bs);
    },

    wishlist: (uid_) => get(K.wish, []).filter(w => w.userId === uid_),
    addWish(text) { const u = me(); if (!u || !text.trim()) return; set(K.wish, [...get(K.wish, []), { id: uid('w'), userId: u.id, text: text.trim() }]); },
    removeWish(id) { set(K.wish, get(K.wish, []).filter(w => w.id !== id)); },
    wishMatches(u) {
      const w = this.wishlist(u.id);
      return books().filter(b => b.status === 'available' && b.ownerId !== u.id && w.some(x => (b.title + ' ' + b.subject).toLowerCase().includes(x.text.toLowerCase())));
    },

    stats() {
      const bs = books(); const done = reqs().filter(r => r.status === 'completed');
      return { listed: bs.length, passed: done.length, members: users().length, saved: done.reduce((s, r) => s + 450, 0) + bs.filter(b => b.status === 'available').length * 0 };
    },
    reset() { Object.values(K).forEach(k => localStorage.removeItem(k)); seed(); }
  };
})();
DB.init();
