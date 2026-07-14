// ── The Glow Engine ──────────────────────────────────────────────────────────
// Foundational cursor glow for the dark world. Every element using the system
// card vocabulary (.cw-card, .cw-hover, .cw-banner, .cw-table-wrap — or the
// [data-glow-card] opt-in) gets a gentle border glow that follows the cursor,
// hue traveling sky → lavender → pink (214 → 330, the district palette) with
// cursor X. The ring styles live in src/styles/system.css — new cards built
// with system classes glow automatically; nothing to remember.
//
// ONE rAF-throttled pointermove listener updates local --glow-x/--glow-y per
// element (local coords, transform-safe). Elements far from the cursor are
// parked once and skipped. Fine pointers only; no-op under reduced motion.

const SELECTOR = '.cw-card, .cw-hover, .cw-banner, .cw-table-wrap, [data-glow-card]'
const REACH = 340 // px beyond a card's edge before its glow is parked

let started = false
let raf = 0
let lastX = -9999
let lastY = -9999

function tick() {
  raf = 0
  document.documentElement.style.setProperty(
    '--glow-hue',
    (214 + (lastX / window.innerWidth) * 116).toFixed(1)
  )
  document.querySelectorAll(SELECTOR).forEach((el) => {
    const r = el.getBoundingClientRect()
    const near =
      lastX > r.left - REACH && lastX < r.right + REACH &&
      lastY > r.top - REACH && lastY < r.bottom + REACH &&
      r.width > 0
    if (near) {
      el.style.setProperty('--glow-x', (lastX - r.left).toFixed(0) + 'px')
      el.style.setProperty('--glow-y', (lastY - r.top).toFixed(0) + 'px')
      el._glowParked = false
    } else if (!el._glowParked) {
      el.style.setProperty('--glow-x', '-9999px')
      el.style.setProperty('--glow-y', '-9999px')
      el._glowParked = true
    }
  })
}

function onMove(e) {
  lastX = e.clientX
  lastY = e.clientY
  if (!raf) raf = requestAnimationFrame(tick)
}

export function initGlow() {
  if (started || typeof window === 'undefined') return
  started = true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  window.addEventListener('pointermove', onMove, { passive: true })
}
