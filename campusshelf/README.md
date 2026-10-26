# CampusShelf — Campus Textbook Exchange

A college-only book exchange where students, teachers, staff and alumni pass textbooks to the next batch.
Pure HTML, CSS and JavaScript. No build step, no server, no installation.

## Run it
- **Locally:** double-click `index.html`, or run `npx serve .` / `python3 -m http.server 8000` in this folder.
- **Deploy free (easiest):** go to https://app.netlify.com/drop and drag this whole folder (or the unzipped folder) onto the page. You get a live link in seconds.
- **Other hosts:** upload the folder to GitHub Pages, Vercel, Cloudflare Pages or any static hosting. `index.html` is the entry point.

## Demo accounts
| Role    | Email              | Password |
|---------|--------------------|----------|
| Student | demo@college.edu   | demo123  |
| Teacher | prof@college.edu   | prof123  |

You can also create your own account on the Join page. To reset all data, run `DB.reset()` in the browser console.

## Pages
| File             | Purpose                                                        |
|------------------|----------------------------------------------------------------|
| `index.html`     | Landing page: stats, how it works, featured books              |
| `browse.html`    | Search, filter and sort all books, plus wishlist                |
| `book.html`      | Book details, condition meter, pickup info, ownership chain     |
| `add-book.html`  | List a book with live preview and photo upload                  |
| `dashboard.html` | My books, requests received/sent, wishlist, karma level         |
| `pickup.html`    | Interactive campus map of pickup points                         |
| `auth.html`      | Log in and create account (student, teacher, staff, alumni)     |

## Folder structure
```
campusshelf/
├── index.html, browse.html, book.html, add-book.html,
│   dashboard.html, pickup.html, auth.html
├── css/style.css          design system (colors, components, responsive)
├── js/store.js            data layer (localStorage) + seed data + business rules
├── js/ui.js               shared navbar, footer, cards, modal, toast
├── js/*.js                one script per page
└── assets/favicon.svg
```

## Rules built in
- Free books cost 5 karma for students and alumni. Faculty and staff never pay.
- The donor earns +10 karma when a handover is confirmed.
- Lent books are marked "On loan" until the owner marks them returned.
- Approving one request automatically declines the others for that book.

## Important: this is a front-end demo
Data is stored in each visitor's own browser (`localStorage`), so users on different devices will not see each other's books.
To make it a real multi-user product, replace `js/store.js` with calls to a backend (Firebase, or Node.js + a database) and keep the pages as they are.
Passwords are only encoded in the demo, so use real password hashing on the server before going live.
