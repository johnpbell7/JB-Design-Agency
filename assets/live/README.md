# Live films

The "In use" films on project pages can play the **real site, running live** in place of a
screen recording. It stays sharp at any size and every animation is the site's own.

```
assets/live/
  driver.js            generic driver, runs inside each live page (no site-specific code)
  <site>/              trimmed, self-contained copy of one site
    index.html …       only the pages the journey visits
    assets/…           only the CSS, JS, fonts and images those pages request
    journey.json       the script the driver plays
```

GoSweet (`assets/live/gosweet/`, used on `projects/gosweet.html`) is the reference.

## 1. Making a site copy

1. Copy only the pages the journey visits from `sites/<site>/` into `assets/live/<site>/`.
   Never edit `sites/`. Add their CSS, JS and fonts.
2. Load each page headlessly, run the journey, and log every request. Copy only the images
   that are actually requested. Resize big ones to 1200px webp at most, and update the refs.
   A good trick is a scratch server that serves the portfolio and, when a file under
   `/assets/live/<site>/` is missing, serves it from `sites/<site>/` and logs the path. Run
   the film through it, then copy what the log lists.
3. Trim big data files to the entries the journey uses (GoSweet keeps one collection
   description and one product description). Keep the total under about 8 MB.
4. In every copied page:
   - add `<meta name="robots" content="noindex">`;
   - before the site's own scripts, add a tiny inline snippet that turns off pop-ups through
     the site's own storage keys;
   - load the driver last in `<head>`:

```html
<script>try{localStorage.setItem("gs_signup_seen","1")}catch(e){}</script>
<script src="../driver.js" defer></script>
<!-- journey somewhere else: <script src="../driver.js" data-journey="other.json" defer></script> -->
```

The driver does nothing unless the page is framed by a same-origin parent. Opened directly,
the page is just the site. External assets (Typekit and so on) are fine if they fail softly.

## 2. journey.json

```json
{
  "name": "GoSweet",
  "viewport": { "width": 1440, "height": 900 },
  "pace": 1,
  "start": [980, 640],
  "startOffset": 100,
  "cursor": { "size": 22 },
  "css": "",
  "reset": { "localStorage": ["gs_cart"], "sessionStorage": [] },
  "escapeOnJump": true,
  "closeOnJump": [],
  "steps": [
    {
      "label": "Pick a craving",
      "page": "index.html",
      "start": { "to": ".sec--first", "offset": 90 },
      "reload": false,
      "actions": [ { "hover": ".crav__t", "nth": 2 }, { "click": ".crav__t", "nth": 1 } ]
    }
  ],
  "mobile": { "page": "index.html", "width": 390, "touch": true, "pace": 1, "start": 0, "css": "", "actions": [] }
}
```

### Top-level fields

| Field | Meaning |
| --- | --- |
| `steps` | One entry per step card in the film's `.cp-steps` row, in the same order and the same count. |
| `pace` | Multiplies every `ms`, `wait` and `after`. Use 1.2 to slow everything down. |
| `start` | Where the cursor starts on a fresh page, in viewport px. |
| `startOffset` | Default gap above a `start` element, in px. |
| `cursor` | `size` (CSS px at 1440 wide, so about 22), `color`, `ring`. The dot never shows smaller than about 11 screen px, however small the frame is. |
| `css` | Extra CSS injected into every page while it is driven, for example to hide a chat bubble. |
| `reset` | Storage keys cleared when the loop restarts at step 0 (basket and so on). The page reloads if anything was cleared. |
| `escapeOnJump` | On a jump within a page, send Escape so drawers and menus close. Default true. |
| `closeOnJump` | Selectors clicked (if visible) on a jump within a page, for example `[".drawer__close"]`. |
| `mobile` | The phone track for the "Mobile responsive" step: rendered at 390px CSS with tap ripples instead of a cursor. Has the same fields as a step, plus `touch` (default true) and `css`. |

### Step fields: the start state

Every step declares where it begins, so a jump to it is instant and reliable from any state:

- `page`: the page the step starts on, relative to the journey file. It may include a query,
  for example `collection.html?c=chocolate`.
- `start`: the scroll position the step begins at. Use a selector, a number of px, or
  `{ "to": selector, "offset": px }`.
- `reload`: set it to true if a jump to this step needs a freshly loaded page, even when the
  page is already showing.

How a step begins:

- **Film flows into the step, or a step card is clicked, and the page is already showing:**
  the page smooth-scrolls to `start`.
- **The step starts on another page:** the parent crossfades to that page, which lands at
  `start` instantly.
- **Every time:** the step's progress bar restarts from 0.

A step's actions can leave its page. For example, clicking a craving opens the collection
page. The next page picks up at the next action.

### Actions

Each action runs in order. Every action also accepts `"after": ms` (a pause once it is done).

| Action | What it does |
| --- | --- |
| `{ "wait": 900 }` | Pause. |
| `{ "move": ".sel" }` or `{ "move": [x, y] }` | Glide the cursor there along a slight, eased arc. Whatever passes under the cursor gets real `pointerover`/`mouseover`/`mouseenter`/`mousemove` events (and the matching leave events), plus `.lv-hover`. |
| `{ "hover": ".sel" }` | The same as `move`. Use it to name hover moments (mega menus and so on). |
| `{ "click": ".sel" }` | Glide, then a press with a pulse ring, then real `pointerdown`/`mousedown`/`pointerup`/`mouseup`/`click` on the element under the cursor. A link to another page becomes a parent-led crossfade. |
| `{ "tap": ".sel" }` | The same as `click`. On the phone track it shows a tap ripple. |
| `{ "scroll": 400 }` | Eased (sine) scroll by px. Negative scrolls up. Add `"within": ".sel"` to scroll an inner scroller. |
| `{ "scrollTo": ".sel", "offset": 120 }` | Eased scroll to an element, or to a number of px. |
| `{ "type": [".sel", "text"], "charMs": 85 }` | Click the field, then type into it with input events. |
| `{ "goto": "page.html" }` | Change page without a click (with a crossfade). |
| `{ "cursor": "hide" }` or `{ "cursor": "show" }` | Hide or show the cursor dot. |

Options for elements:

- `nth`: which match to use, counting only visible matches. Default 0.
- `text`: only matches whose text contains this string.
- `at`: where in the element to point, as a fraction. Default `[0.5, 0.5]`.
- `visible: false`: also count hidden matches.
- `scroll: false`: don't auto-scroll the element into view first.

Durations:

- `ms` sets how long a glide or scroll takes. Without it, the length follows the distance
  (calm by default).
- Elements that are not found are skipped, with a console warning.

Pure-CSS `:hover` menus work too. When the driver starts, every `:hover` rule on the page is
copied as a `.lv-hover` rule (inside the same `@media`/`@supports`), and the driver keeps
`.lv-hover` on the elements under the cursor. Menus driven by JS open through the site's own
`mouseenter` and `mouseover` handlers.

Pacing guide: aim for 5 to 9 s per step. Use glides of 0.8 to 1.3 s, and leave 1.5 to 2 s on
anything the viewer should read. Avoid frantic moves.

## 3. postMessage protocol

All messages are same-origin (`targetOrigin = location.origin`) objects with a `live` key.

**Driver to parent:**

| Message | When |
| --- | --- |
| `{live:'ready', page, track}` | The page has loaded, fonts are ready and the journey is fetched. Waits for a `goto`. |
| `{live:'step', i, track}` | Step `i` has begun. |
| `{live:'progress', p, i, track}` | Progress through step `i`, from 0 to 1, sent every frame while playing. |
| `{live:'nav', href, i, at, track, cursor}` | Asks the parent to load `href`, then resume step `i` at action `at`, with the cursor at `[x, y]`. |
| `{live:'leaving', i, at, track, cursor}` | The page navigated by itself (JS `location.href`). Resume there after the next `ready`. |
| `{live:'end', track}` | The last step (or the phone track) has finished. |

**Parent to driver:**

| Message | Effect |
| --- | --- |
| `{live:'goto', i, at?, track?, fresh?, play?, hold?, cursor?}` | Jump to step `i`, from any state. |
| `{live:'play'}` and `{live:'pause'}` | Pause freezes the clock, so animations resume exactly where they stopped. |

How `goto` behaves:

- It cancels whatever is in flight: a scroll, a glide, a click about to land, or a page change
  that has been requested.
- `track: 'mobile'` plays the phone track.
- `play: false` lands on the step's start state as a still frame, with no cursor.
- `hold: true` plays only this step, then pauses (used for reduced motion).

## 4. case-plus.js: `data-live`

```html
<section data-cp-film data-live="../assets/live/gosweet/index.html" data-mobile-line="…">
  … <div class="cp-browser"><div class="cp-browser__bar">…</div><video src="…mp4" poster="…jpg"></video></div>
  <ol class="cp-steps"><li><button>…</button><i></i></li> …</ol>
</section>
```

- When `data-live` is set, the `<video>` is replaced by `.cp-live`, which holds the iframe. The
  video's poster shows until the site is ready, then fades out. Pages without `data-live` keep
  the video behaviour.
- The iframe renders at 1440×900 CSS and is scaled to the frame with
  `container-type: inline-size` and `scale: calc(100cqw / 1440px)`. It has
  `pointer-events: none` and is `inert`.
- Optional attributes: `data-live-width`, `data-live-height` and `data-live-mobile` (default
  390).
- The iframe is created about 600px before the film scrolls into view.
- It plays only while at least 30% is on screen and the tab is visible. It pauses otherwise.
- `.cp-steps` follows the driver: `is-on`, the `--p` progress bar, and the sideways row scrolls
  to the current card. Clicking a card sends `goto` (`fresh: true`).
- Page changes: a new iframe loads behind and the driver resumes in it. It then fades in over
  0.6s, and the old iframe is removed.
- **Mobile responsive** (added automatically as the last step card when GSAP is present):
  - During the last desktop step, a second iframe loads at 390px CSS width. Its height is the
    phone height divided by the scale.
  - When the desktop journey ends, the window morphs into a phone (bar collapses, it narrows to
    height / 2.05, a ring and an island appear).
  - The phone iframe fades in and plays `journey.mobile`. This is the site's real responsive
    layout.
  - It then morphs back and the loop restarts at step 0, which clears the `reset` keys.
- Reduced motion: the site loads as a still frame at step 0. A click on a step plays only that
  step (`hold`), and the phone step shows a still phone.
- The phone's site starts below a white status-bar band (8.5% of the phone's height), so the
  island never covers the site's own header buttons. The video films' phone capture does the same.
- A step clicked while the phone is leaving (or about to leave on its own) keeps its goto: the
  automatic morph back can't replace it with step 0.

### Scroll-driven film (1024px and wider)

At 1024px and wider, without reduced motion, every `[data-cp-film]` (live or video) is driven
by the page's scroll (case-plus.js `scrollFilm`):

- The `.cp-film__grid` pins (centred, or bottom-aligned if it's taller than the window) for
  about 70vh of scroll per step card, including "Mobile responsive". Then it lets go.
- Scrolling slides the `.cp-steps` row sideways (a scrubbed translate; the row stops scrolling
  by itself). Card k reaches its place at the middle of its stretch.
- As a step becomes current (after 200ms of settling), the film plays just that step and holds
  (`goto` with `hold: true`; a held driver ignores later `play` messages). On the last card the
  window morphs into the phone, which plays the phone track and stays until the page scrolls
  back. Video films seek to the step's `data-t` and pause at the next one.
- Before the pin picks a step, a live film waits as a still of step 0.
- Clicking a card scrolls the page to that card's place in the pin, which plays it.
- Below 1024px, or with reduced motion, the swipe row and autoplay loop stay as before.


## 5. Parade: phones running live (390px)

The mobile parade (`[data-parade]`, case.css/case.js) can show the real site in every phone
instead of a recording. It needs no page JS: case-plus.js wires any parade `.phone` that has
`data-live`. GoSweet (`projects/gosweet.html`) is the reference.

```html
<div class="panel parade" data-parade>            <!-- optional: data-live-loop="17000" -->
  <div class="parade__row">
    <div class="phone" data-live="../assets/live/<site>/product.html?p=x" data-live-journey="journey.json#shop">
      <div class="screen"><video src="…mp4" poster="…jpg" muted playsinline loop preload="none" aria-label="…"></video></div>
    </div>
    …
  </div>
  <div class="parade__caption" aria-hidden="true"><span>Shop</span>…</div>
</div>
```

| Attribute (on the `.phone`) | Meaning |
| --- | --- |
| `data-live` | The page the phone starts on (relative to the project page). Keep it the same as the track's `page`: it is reloaded at the start of every loop. |
| `data-live-journey` | The journey file, relative to that page, plus an optional `#key` naming the track. See below. |
| `data-live-at` | Optional. This phone's phase in the loop, in ms. Default: the phones spread evenly over the loop. |
| `data-live-width` | Optional. CSS width the page renders at. Default 390. |

Which track a phone plays (`data-live-journey`):

- `journey.json#shop`: the entry of `phones` whose `id` or `label` is "shop" (case-insensitive).
- `journey.json#2`: `phones[2]`.
- `journey.json#name`: `tracks.name`, if the file has a `tracks` object.
- `phone-app.json` (no key): that file's `mobile` track. Use this when each phone has its own file.

A phone track has the same fields as `mobile` (`page`, `start`, `touch`, `css`, `actions`). Two
driver actions help on phones:

- `{ "scroll": 354, "x": true, "within": ".rail" }`: sideways scroll of a rail (snap is paused
  during the ease).
- `{ "type": [".sel", "cola"], "charMs": 300, "jitter": 0.5 }`: typing with a human rhythm.

```json
"phones": [
  { "id": "shop", "label": "Shop", "page": "product.html?p=x", "start": 0, "reload": true, "touch": true,
    "actions": [ { "wait": 1600 }, { "scroll": 330, "ms": 2900, "after": 1500 }, { "tap": ".buyrow .btn", "after": 2800 } ] }
]
```

What case-plus.js does:

- The `<video>` is replaced by `.lv-screen`, which holds the iframe at 390px CSS, scaled to the
  screen (`--k`). Its height follows the screen's shape (about 390×824). The video's poster
  shows until the page is ready. A phone without `data-live` keeps its video.
- The frames are created one at a time (earliest phase first), starting 600px before the parade
  comes into view.
- **Turns.** One parade clock runs while the parade is on screen. Each loop is `data-live-loop`
  long (default 17000ms), and a phone starts its loop at its phase, so the phones never act
  together. A phone may start straight away if no other phone is playing (on a phone-width
  page only one phone is visible at a time). Keep each track under the loop length minus about
  1s for the reload.
- A phone plays only while at least half of it is on screen and the tab is visible.
- Page changes crossfade (a new iframe loads behind, then fades in). At the end of a loop the
  start page (`data-live`) reloads behind, fades in with a clean basket and shut menus, and
  waits, still, for the phone's next turn.
- **Storage.** Each phone gets its own in-memory localStorage (`data-live-store` on its iframe),
  so a basket filled in one phone doesn't show in the others or in the desktop film. For this,
  every page of the copy loads `assets/live/store.js` first in `<head>`, before the pop-up
  snippet:

```html
<meta charset="utf-8">
<script src="../store.js"></script>
```

  Without store.js the phones share the site's real storage (fine for sites with no basket).
- **Sharp text.** case.js sees a live phone in the parade and keeps the phones flat once they
  have stood up: their intro transforms are cleared, the desktop drift moves in whole pixels
  with 2D transforms, the pointer tilt is off, and on phone widths the phone nearest the centre
  sits at exactly scale 1.
- Reduced motion: each phone shows its start page as a still (no cursor, no actions).

Pacing for phones: start with a 1.5–2s look, then one action at a time with 1.5–2.5s holds.
Scrolls run at `SCROLL` (0.75) × their `ms`, so write about 2700–3400ms for a calm phone scroll.
Taps have no cursor glide. Aim for 10–15s per track.

Weight: each phone loads its pages like a visitor would. GoSweet's four phones transfer about
4.6 MB the first time (0.9 MB JS, which gzips to about 150 KB, 2.9 MB images, 5 pages of
117 KB HTML). Later loops come from the browser cache when the host caches (the dev server
`http-server -c-1` doesn't, so it refetches every loop).

## Limitations

- Real network and CPU: each live film loads the site's pages. GoSweet loads about 2 MB of JS
  per page.
- Hover is simulated. `:hover` is mirrored through `.lv-hover`, and JS hovers get synthetic
  events. Effects that read `event.isTrusted`, or native controls (select menus, scrollbars),
  won't react.
- Same-origin only: the copy must be served from the portfolio itself.
