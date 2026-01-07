# BookAnything™ — Static Demo (GitHub Pages)

This is a free, easy demo of BookAnything™ that runs entirely in your browser (no server). It simulates signup/login, creating listings with images, browsing listings, creating bookings, and "simulated payment". All data is stored locally in your browser (localStorage).

How to publish on GitHub Pages (very easy — no command line)
1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Repository name: e.g. `bookanything-demo`
   - Set visibility to Public (so Pages can serve it), then click Create repository.

2. Add the files:
   - On the new repo page, click "Add file" → "Create new file".
   - For each file below (index.html, listing.html, styles.css, script.js, README.md), paste the filename and contents into the web editor.
   - Commit each file (you can do them one-by-one).

   Alternatively: click "Add file" → "Upload files" and upload all files at once.

3. Enable GitHub Pages:
   - Go to the repo Settings → Pages (or https://github.com/<yourname>/<repo>/settings/pages).
   - Under "Build and deployment", select Source: "Deploy from a branch".
   - Branch: `main` (or `master` depending on default), Folder: `/ (root)`.
   - Save. GitHub will show the site URL (like https://yourname.github.io/bookanything-demo/) after a minute or two.

4. Open your site:
   - Visit the GitHub Pages URL provided in the settings.
   - You can now use the demo app. All data (users, listings, bookings) is kept in your browser only.

Notes & limitations
- This is a demo only — everything is stored in your browser. If you clear browser data or open the site in another browser/computer, your data won’t be there.
- No real payments — the demo marks bookings as "paid" locally.
- This is intended to be the easiest way to get a working website online for free. When you're ready to move to a real backend (database, authentication, payments), I can help deploy the full Next.js app to Vercel + a hosted Postgres.

Need help?
If you want, tell me your GitHub username and repo name and I’ll give step-by-step exact clicks. Or paste any error you see and I’ll help fix it.
