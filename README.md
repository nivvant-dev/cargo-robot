# Internal Cargo Unloading Robot — NASA HUNCH Project

A plain static website for a student-built mobile robot that unloads cargo from a mock spacecraft
module and hands it off to a stowage shelf.

No frameworks, no build step, no external fonts or libraries. The pages are HTML, CSS and vanilla
JavaScript and can be served by any static host.

---

## 1. What's in this folder

```
index.html            Project page: hero, design, BOM, build steps, test log, safety
styles.css            Theme, layout, animations, responsive rules, policy pages
script.js             Nav, reveal, accordion, lightbox, demo, BOM, test log/chart
theme.js              Early theme class + current year on every page (CSP-safe)
privacy.html          Privacy Policy
accessibility.html    Accessibility Statement
terms.html            Terms of Use, including the prototype safety disclaimer
security.html         Security Policy and responsible-disclosure contact
404.html              Branded "page not found" page
favicon.svg           Abstract project mark (not a NASA logo)
robots.txt            Search-engine rules
sitemap.xml           Sitemap (replace the placeholder domain before submitting)
_headers              Security/cache headers for Netlify and Cloudflare Pages
README.md             This file
images/               Project photos and diagrams
  vex-side-view.jpg
  robot-concept.jpg
  vex-base.jpg
  module-topdown.jpg
  prototype-layout.jpg
  lift-on-shelf.jpg
  end-effector.jpg
```

The seven images above are included and wired up. Any image you remove or rename will automatically
be replaced by a grey placeholder box showing the missing filename — the page will never show a
broken-image icon.

---

## 2. Project details

The site is filled in with these values:

| Detail | Value |
| --- | --- |
| Team | Ranchview HUNCH Team |
| Members | Nivvan Tara, Namish N, Camden Darden |
| School | Ranchview High School |
| Mentor | David Berry |
| School year | 2026–2027 |
| Contact | `berryda@cfbisd.edu` |

They appear in the hero, footer, copyright and policy pages, and the comment block at the top of
`index.html` lists them for quick reference. The footer and policy pages are separate copies —
updating one does not update the others, so search all `.html` files if any of them change.

One placeholder remains: replace `https://your-domain.example/` in `sitemap.xml` (see section 8).

The text "NASA HUNCH Project" is used as plain text. The site deliberately contains **no NASA logo
or meatball**, and the footer states that this is a student project, not an official NASA
publication.

### Contact details matter

The privacy, accessibility, security and terms pages all point to `berryda@cfbisd.edu`. Keep this
mailbox checked: a privacy policy with a dead contact address is worse than no policy at all.

---

## 3. Privacy, terms, accessibility and security

### What the policies say

- **Privacy Policy** — no accounts, no cookies, no analytics, no third-party scripts. The only data
  the site creates is the trial log in `localStorage`, which never leaves the browser. Email contact
  and standard hosting logs are described honestly.
- **Accessibility Statement** — the WCAG 2.2 AA goal, keyboard and screen-reader measures, the
  known limitations (low-resolution source images, JavaScript-dependent BOM/test log, English-only,
  no independent audit) and how to request another format.
- **Terms of Use** — educational-project disclaimer, no NASA affiliation, prototype safety notice,
  permitted use, ownership, no warranties and limitation of liability. Have a teacher, guardian or
  school official review it; see the caveat in section 10.
- **Security Policy** — the static-site threat model, the CSP, safe rendering, hosting limits, and a
  responsible-disclosure process. It also says plainly that no website is perfectly secure.
- **404 page** — a branded fallback with links back to the project and the policies.

### Security measures in the files

- Every page has a restrictive `Content-Security-Policy` meta tag: local scripts/styles/images only,
  `connect-src 'none'`, no framing, no plugins, no `base-uri` overrides.
- `theme.js` is an external file rather than an inline script, so the strict `script-src 'self'`
  policy can stay in place. There are no inline `style=` attributes or inline event handlers.
- Trial notes are inserted with `textContent`, and BOM text is escaped before rendering. A note
  cannot become executable HTML for another visitor.
- `_headers` adds HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, COOP/CORP and cache rules on hosts that support it (Netlify and Cloudflare
  Pages do).
- **GitHub Pages ignores `_headers`.** On GitHub Pages the CSP meta tag still applies, but
  header-level protections do not. If you need those headers, deploy to Netlify or Cloudflare Pages.
- There are no API keys, secrets, analytics IDs or server endpoints in the project. Nothing in the
  browser can be used to reach a backend, because there is no backend.

### If you add something later

Adding Google Analytics, a YouTube embed, a chat widget or a CDN font will be blocked by the CSP and
would also require an honest update to the Privacy Policy. If you add one deliberately, change both
the CSP (in every HTML page and `_headers`) and the privacy text. Do not weaken the policy just to
make a widget load.

---

## 4. Add or replace images

Drop replacement images into `images/` using the **same filenames**:

| File | Used in | Suggested size | What it should show |
| --- | --- | --- | --- |
| `vex-side-view.jpg` | Architecture gallery | 1200 × 760 | Side-view diagram of the VEX base, lift and gripper |
| `robot-concept.jpg` | Architecture gallery | 1200 × 780 | CAD concept render |
| `vex-base.jpg` | Architecture gallery | 1200 × 770 | Photo of the VEX drive base |
| `module-topdown.jpg` | Architecture gallery | 1200 × 800 | Top view of the mock module and aisle |
| `prototype-layout.jpg` | Architecture gallery | 1200 × 760 | Layout with Cargo A–D and the clear aisle |
| `lift-on-shelf.jpg` | Architecture gallery | 1200 × 830 | Lift mast reach test |
| `end-effector.jpg` | End Effector | 1200 × 790 | Gripper detail |

Tips:

- **Aspect ratio:** the cards display images at a 3:2 ratio with `object-fit: contain`, so diagrams
  stay uncropped. A 3:2 image fills the card most neatly.
- **File size:** aim for under ~250 KB per image. Compress with [Squoosh](https://squoosh.app/) or
  `jpegoptim` before committing.
- **Alt text:** each `<img>` has descriptive `alt` text in `index.html`. If you replace a photo,
  update its `alt` text and the `<figcaption>` too.
- **Lightbox:** any image inside a `.figure-card` button opens in the built-in viewer. Captions come
  from the visible `<figcaption>`, so edit that text to change the lightbox caption.
- **Adding a new image:** copy one whole `<figure class="figure-card">` block, change the `src`,
  `alt` and caption. Keep the placeholder markup in sync with the new filename.

The current images live in `images/` and are loaded lazily below the fold.

---

## 5. Edit the bill of materials

All prices are in `script.js` in the `bomGroups` array (search for `EDIT PRICES HERE`).

```js
{ name: "NEMA 17 steppers", spec: "2 × ~40 N·cm, 1.5 A", price: 25 }
{ name: "Raspberry Pi + camera", spec: "Optional vision add-on", price: 60,
  priceLabel: "60–100", optional: true }
```

- `price` is a number in US dollars; `priceLabel` overrides what is displayed.
- `optional: true` leaves the part out of the group subtotal and grand total, but keeps it visible.
- Group subtotals, the grand total and the summary cards recalculate automatically.
- Current estimate: **$487** for new parts, within the stated **≈$450–600** range. The optional
  Raspberry Pi and camera ($60–100) are excluded.
- Prices are approximate US estimates — confirm before purchasing.

The tools list is plain HTML in the BOM section (search for `Tools (not priced)`).

---

## 6. Use the test log

The **Test Results** section starts empty by design. Enter:

- payload in kilograms (0.1–5),
- success or fail,
- cycle time in seconds,
- optional notes.

The page calculates success rate against the **8/10 (80%)** target and average cycle time against
the **under 60 s** target, and draws a bar chart (green = success, orange = fail) with the 60-second
line marked.

**Saving:** trials are saved in `localStorage` in the browser you use. They are not uploaded
anywhere and are not shared between browsers or devices. Clearing site data or using a private
window will lose them. Use **Clear all trials** (with confirmation) to reset the table. If storage is
blocked, the page still works for the session and shows a warning.

The chart and the log table are the accessible data source; the canvas has a text label describing
the bars.

---

## 7. Preview the site locally

### Option A — double-click (quickest)

Open `index.html` in Chrome, Edge, Firefox or Safari. The content and images work from the local
file. Some browsers restrict scripts or `localStorage` on `file://`; if the interactive parts do not
work when double-clicked, use Option B.

### Option B — local server (recommended)

From this folder, run one of:

```bash
# If you have Python 3
python -m http.server 8000

# or, if you have Node.js (no install needed)
npx serve .
```

Then visit `http://localhost:8000`.

In VS Code, the **Live Server** extension also works: right-click `index.html` → *Open with Live
Server*. Stop the server with `Ctrl+C` when finished.

Quick checks before showing it to a reviewer:

- Open `privacy.html`, `accessibility.html`, `terms.html`, `security.html` and a deliberately wrong
  address to see the 404 page.
- Resize to a phone width (or use responsive mode) — the nav collapses to a menu, tables scroll, and
  the diagram stacks vertically.
- Click an image to open the viewer; use arrow keys, Escape and the close button.
- Add a trial, reload, and confirm it is still there.
- Tab through the page: the skip link, nav, buttons, accordion and form should all show a visible
  focus ring.
- In your OS settings, enable *Reduce motion* and reload — reveal animations and the auto-playing
  demo stop.

---

## 8. Deploy for free

The site is plain static files, so anything that serves HTML works. Both options below are free for
a student project.

### GitHub Pages

1. Create a new repository on GitHub (public is easiest on the free plan).
2. Upload every file in this folder **including** `privacy.html`, `accessibility.html`, `terms.html`,
   `security.html`, `404.html`, `theme.js`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `_headers`
   and the entire `images/` folder. Keep `index.html` at the **repository root**, not inside a
   subfolder.
3. In the repository: **Settings → Pages**.
4. Under *Build and deployment*, choose **Deploy from a branch** → branch `main` → folder `/ (root)`
   → **Save**.
5. Wait a minute or two. The site appears at
   `https://<your-username>.github.io/<repository-name>/`.

To update: upload the changed files to the same branch; Pages redeploys automatically. If you use
Git instead of uploads:

```bash
git init
git add index.html styles.css script.js theme.js favicon.svg \
  privacy.html accessibility.html terms.html security.html 404.html \
  robots.txt sitemap.xml _headers README.md images
git commit -m "Add NASA HUNCH project site"
git branch -M main
git remote add origin https://github.com/<username>/<repository>.git
git push -u origin main
```

### Netlify Drop

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag the whole project folder onto the page. No build command or configuration is required.
3. Netlify gives you a live URL immediately; you can rename it in **Site settings → Change site
   name**.
4. To update, drag the updated folder again, or connect the GitHub repository for automatic
   deploys.

Netlify reads `_headers`, so the full set of security headers applies. Cloudflare Pages also reads
`_headers`; GitHub Pages does not (see section 3).

### After you have a live URL

1. Replace `https://your-domain.example/` in `sitemap.xml` with the real URL (including the GitHub
   Pages repository subpath, if there is one).
2. Uncomment the `Sitemap:` line at the bottom of `robots.txt` and put the absolute sitemap URL
   there.
3. Submit the sitemap in Google Search Console or Bing Webmaster Tools if you want it indexed. This
   is optional for a school review packet.
4. Check that the 404 page is served by your host. GitHub Pages, Netlify and Cloudflare Pages all
   use `404.html` automatically.

Both hosts serve over HTTPS. No environment variables or server code are needed.

---

## 9. Accessibility and performance notes

- **Semantic structure:** one `h1` per page, landmark elements (`header`, `main`, `footer`, `nav`),
  a working skip link, descriptive page titles and `lang="en"`.
- **Keyboard:** native buttons for the accordion, lightbox, filters and stepper; the image viewer is
  a native `<dialog>` with focus trapping, Escape-to-close and arrow-key navigation. Focus returns
  to the image that opened it.
- **Screen readers:** descriptive alt text, `aria-expanded` / `aria-controls` on the accordion and
  nav menu, `aria-sort` on BOM headers, live announcements for the step detail and test log, and a
  chart label that summarizes the data. The trial table contains the same values as the chart.
- **Contrast:** body copy and labels target WCAG AA on the dark background. The bright red-orange
  accent is used for graphical accents and larger text; softer tints are used for small text.
- **Motion:** all reveal, twinkle and stepper animation is disabled or reduced under
  `prefers-reduced-motion`; the demo can also be paused.
- **No-JavaScript fallback:** a `<noscript>` note explains which sections need JavaScript. The main
  narrative, images, design data, build steps and safety guidance remain readable.
- **Performance:** no web fonts, no libraries, no external requests, one CSS file and two small JS
  files. Images are lazy-loaded below the fold and the illustrations are inline SVG.
- **Policy pages:** each has a table of contents, readable line length, focus styles, mobile layout
  and a print-friendly structure. The accessibility statement lists the known gaps instead of
  claiming a perfect audit.

The site targets current evergreen browsers. The image viewer uses `<dialog>` and the collapsed
mobile menu uses `inert`; both are supported in current Chrome, Edge, Firefox and Safari.

---

## 10. What these pages can and cannot do

These policies are written to be clear, accurate and protective for a student project. They are
**not legal advice**, and no website can guarantee that nobody will ever make a claim. A privacy
policy, terms page and disclaimer reduce risk; they do not create immunity from lawsuits.

Before publishing:

- Replace every placeholder, especially the contact email.
- Have a teacher, guardian or school official read the Terms and Privacy pages. Your school or
  district may already have required wording, a records-retention policy or insurance rules that
  take precedence.
- If the project will be public for a long time or collect any real user data later, ask the school
  for a review. If you add analytics, accounts, comments or uploads, the privacy policy and security
  claims must be updated — the current text would no longer be true.
- Keep the prototype safety notice visible. The Terms describe the robot as a classroom prototype,
  not flight hardware, and that is the honest description.

The site deliberately makes no claim of NASA affiliation, certification or endorsement. Keep it that
way.

---

## 11. Credits and reuse

Diagrams, renders and photos are student project materials. Replace them with your own final figures
as the build progresses. Do not add the official NASA logo or meatball to this site; the plain-text
"NASA HUNCH Project" label is intentional.

Color palette: deep space navy `#050A14`, NASA-inspired blue `#0B3D91`, red-orange `#FC3D21`.
