# SARA FRICKER — PORTFOLIO DESIGN SYSTEM
**Version 1.0 · 30.10.2026 · Figma + Codex reference**

## 00 — Design intent
**Concept:** Editorial precision × playful digital materiality.

The portfolio demonstrates Digital Design, UI/UX and Frontend Development. The visual foundation is typographic, deliberate, accessible and minimal. Carefully placed tactile 3D materials and responsive interactions add a human, curious, emotional layer.

**Brand attributes:** curious, empathetic, expressive, intentional, technologically fluent, approachable.

**Core rule:** The project work stays central. Motion should explain, reveal, guide or delight—not merely decorate. **Do not turn the entire site into a pastel cloud aesthetic.** The existing dark editorial design remains the anchor. The blue-white 3D logo and its moss / natural rock / pink cloud transformations provide a distinct storytelling moment.

### Source-informed observations vs decisions
**Visible in supplied screenshots:** dark graphite project pages; very dark navy portfolio overview; typographic splitting of project titles (e.g., `Lesson | Flow`, `Type | Space`, `Schatz | kisteVR`); oversized footer lettering; small upper navigation; alternation of photographic immersive hero sections and compact case-study layouts; individually styled project imagery; light editorial sections for Type Space; bright light-blue brand accents.

**Given by owner:** Kultüre is main font; Oscine is secondary font; primary blue is `#88C1F2`; floating sculptural logo transforms through moss/flowers → natural stone → pink cloud → blue-white end logo, with cloudless sky, sea and reflection.

**Proposed below:** complementary color tokens, scale, breakpoints, exact font settings, accessibility states and timing. Treat them as initial system decisions, not observed existing specifications.

## 01 — Foundation / Color

| Figma color variable | HEX | Role |
|---|---|---|
| `brand/blue/500` | `#88C1F2` | Primary identity, selected states, links and brand accents |
| `brand/blue/700` | `#3B86C7` | Links on light backgrounds / darker blue accent |
| `brand/blue/200` | `#CDE7FC` | Atmospheric highlights and soft UI backgrounds |
| `neutral/ink/950` | `#030A18` | Immersive homepage/project-index background |
| `neutral/graphite/800` | `#494B4F` | Default project page background (sampled from screenshots) |
| `neutral/graphite/700` | `#5C5E62` | Dark raised surfaces |
| `neutral/paper/50` | `#F8F9FA` | Editorial light canvas |
| `neutral/white` | `#FFFFFF` | Text on dark / negative space |
| `neutral/text/secondary-dark` | `#D4D9DE` | Secondary text on dark backgrounds |
| `neutral/text/primary-light` | `#18222B` | Text on light backgrounds |
| `neutral/text/secondary-light` | `#48545F` | Secondary text on light backgrounds |
| `accent/pink/300` | `#F3A6CF` | Restricted to playful 3D scenes / specific project context |
| `accent/moss/500` | `#7C9960` | Restricted to 3D growth sequence |
| `accent/stone/400` | `#AEB7BE` | Restricted to 3D stone sequence |
| `semantic/focus` | `#88C1F2` | Focus ring on dark; use dark focus on light |

### Semantic modes
**Dark (default for home & most case studies):** canvas `#494B4F`, immersive canvas `#030A18`, text `#FFFFFF`, secondary text `#D4D9DE`, accent `#88C1F2`.

**Light (editorial case-study module):** canvas `#F8F9FA`, text `#18222B`, secondary `#48545F`, link `#3B86C7`.

**Atmosphere (3D hero only):** clear pastel-blue sky, luminous water, natural soft daylight, no background clouds or extra scenery; preserve the original blue/white logo identity.

**Restrictions:** never use pale brand blue as small body text on white; never rely solely on color to indicate interaction; each case study may have its own *image palette*, but the site's *UI palette* stays consistent.

## 02 — Typography

**Display / headline / wordmark:** **Kultüre**. Expressive titles, opening statement, split project headings, exaggerated footer. Use supplied font files under the relevant font license; document the actual CSS `font-family` name after inspection.

**UI / body / metadata:** **Oscine**. Paragraphs, project metadata, buttons, captions, contact links, process descriptions. Choose available weight files; if only one weight exists, do not fabricate unsupported weights.

Proposed desktop type styles (line heights are explicit):

| Figma Text Style | Font | Size / line | Letter spacing | Usage |
|---|---|---|---|---|
| `Display/Hero` | Kultüre | 104 / 100 px | -0.035em | Name, large introduction |
| `Display/Project` | Kultüre | 80 / 84 px | -0.025em | Split project name |
| `Display/Footer` | Kultüre | 144 / 140 px | -0.035em | Oversized cropped brand footer |
| `Heading/H1` | Kultüre | 64 / 68 px | -0.025em | Case-study headings |
| `Heading/H2` | Kultüre | 42 / 48 px | -0.02em | Sections |
| `Heading/H3` | Kultüre | 28 / 34 px | -0.01em | Section subhead |
| `Body/Large` | Oscine | 20 / 30 px | 0 | Intro, pull-quote |
| `Body/Default` | Oscine | 16 / 26 px | 0 | Reading text |
| `Body/Small` | Oscine | 14 / 22 px | 0 | Supplemental information |
| `UI/Label` | Oscine | 13 / 18 px | +0.02em | Navigation, tags, controls |
| `UI/Micro` | Oscine | 12 / 16 px | +0.03em | Timestamp, eyebrow (avoid for long text) |

Tablet: display hero 72/76, project 60/64, H1 48/54. Mobile: display hero 48/52, project 44/48, H1 38/44, H2 30/36; body remains 16/26. Prefer responsive `clamp()` transitions.

**Typesetting rules:** reserve Kultüre for concise readable text; no large paragraphs in display font. Use meaningful line breaks, deliberate negative space and intentional split titles only where they reinforce title composition. Avoid styling every heading with different experiments.

## 03 — Layout, spacing and surfaces

**Frame presets:** Desktop 1440×900, large 1920×1080, tablet 768×1024, mobile 390×844. **Container maximum:** 1320 px. **Side padding:** desktop 64 px, tablet 32 px, mobile 20 px. **Grid:** desktop 12 columns / 24 px gutters; tablet 8 / 16 px; mobile 4 / 12 px.

**Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. Apply 8px baseline where possible. Case-study section gap: 128 px desktop / 80 tablet / 64 mobile. Intro text max-width: 720 px. Long paragraph max-width: 68ch.

**Radii:** `radius/0=0`, `radius/sm=8`, `radius/md=16`, `radius/lg=24`, `radius/pill=999`. Use 16–24px for framed project media where appropriate; 0px for full-bleed storytelling panels. Do not round every object by default.

**Elevation:** use restrained shadows on light backgrounds; on dark backgrounds create hierarchy via composition, contrast and spacing rather than strong card shadows.

## 04 — Figma components

Establish a `Components` page with Auto Layout and variants:

1. **Navigation / Desktop & Mobile** — logo, Works, About, Contact, menu; variants default, hover, focus, expanded, over-image. Sticky only when it improves orientation. Small metadata-style layout inspired by screenshots.
2. **Project Tile** — split project title, image/video preview, discipline, year, arrow/interaction affordance; variants resting, hover/focus, active. Work samples receive their own imagery and palette.
3. **Project Hero** — full-bleed background video/image + accessible text overlay; split title; 3-column metadata row (discipline, year, project type).
4. **Section Intro** — eyebrow, large Kultüre title, Oscine description, optional anchor.
5. **Media Frame** — image/video/interactive embed; variants full-bleed, contained, side-by-side, captioned; preserve native aspect ratios.
6. **Case-study Two-Column** — explanatory copy paired with media; mirrored variant; responsive stack.
7. **Process Row / Step** — numbered step, detail and media; optional scroll reveal.
8. **Tag / Discipline** — UI label, outline and filled treatments; consistent padding.
9. **Button & Text Link** — primary, secondary, ghost; default, hover, pressed, disabled, focus; minimum interactive hit target 44×44 px.
10. **Accordion / Learnings** — closed/open, keyboard operable, clear text hierarchy.
11. **Footer / Brand** — large cropped name, location, email, Github, LinkedIn, back-to-top; desktop and mobile variants.
12. **3D Logo Stage** — scene, motion-poster image, reduced-motion static variant, fallback still; light-on-atmosphere and dark-on-graphite contexts.

**Component property naming:** `mode=dark|light`, `size=desktop|mobile`, `state=default|hover|focus|active|disabled`, `media=image|video|interactive`. In Figma, use Auto Layout and component properties rather than detached variants.

## 05 — Motion system

### Motion purpose
Motion must have one clear reason: **orientation, feedback, narrative or delight**. The three materials symbolize breadth of craft without literally assigning a discipline to a fixed texture. The 3D logo is a brand vignette; project-specific motion remains project-specific.

### Motion tokens (initial suggestions)
| Token | Value | Use |
|---|---|---|
| `motion/fast` | 160 ms | Hover, micro-feedback |
| `motion/base` | 320 ms | UI entry/exit, menus |
| `motion/slow` | 650 ms | Reveal / section transition |
| `motion/hero` | 5000 ms | Full brand logo story |
| `easing/standard` | `cubic-bezier(.22, 1, .36, 1)` | Smooth settling |
| `easing/soft` | `cubic-bezier(.33, 0, .2, 1)` | Smooth transitions |

**Signature logo sequence (~5 seconds):**
- 0.0–1.2s: Moss, delicate grass and white/pink flowers organically appear over sculptural logo.
- 1.2–2.4s: Green gently recedes, revealing softly eroded, contiguous natural rock (not stacked blocks).
- 2.4–3.7s: Rock transitions into big rounded, plush pink cloud masses, with low turbulence and clear silhouette.
- 3.7–4.5s: Pink cloud disperses, unveiling original blue `#88C1F2` and white logo.
- 4.5–5.0s: Hold crisp original logo; subtle buoyant motion, water reflection, calm atmosphere.

**Continuity:** fixed camera and scale, horizon and lighting stable across the transformation; original logo contour must be recognizable and finale must use original supplied SVG/PNG overlay for exact identity. Use water reflection linked to each material. Keep backdrop cloudless. End state should feel light, lovable, polished—not aggressive or spectacular.

**Use locations:** homepage hero as optional first-impression brand signature; miniature still or lightweight hover state elsewhere. **Not** on every case-study page and not as an obligatory five-second wait.

**Technical playback:** optimized WebM/MP4 poster fallback; `playsinline`, `muted`, and `autoplay` only when appropriate; no audio by default. For visitors who prefer reduced motion, render the static blue-white logo and no parallax/transformation. Do not gate navigation behind animation. Use GSAP for DOM transitions, R3F/Three.js only when true interactive 3D is justified; do not use a heavy 3D runtime for a simple pre-rendered loop.

## 06 — Interaction / behavior

- **Hover:** soft image crop/scale within masked frame (1.015–1.035 maximum), underline or small directional shift; no large layout jump.
- **Project browse:** title split remains legible without hover, preview may respond to mouse but must work on tap and keyboard.
- **Scroll:** reveal through opacity and small `translateY` (12–24px) rather than continuous heavy parallax. Trigger once when possible.
- **Transitions:** ~320–650ms for content; route transitions must not obscure reading or back navigation.
- **Cursor:** default system cursor unless a custom treatment adds unmistakable meaning; no custom cursor that masks links.
- **Focus:** visible 2–3px ring with adequate contrast and offset. Focus equals hover for meaningful affordances.
- **Touch:** no hover-only information; buttons and links ≥44×44px targets; ensure swipe interactions have alternative controls.

## 07 — Page templates

### Home
1. Short immersive photographic / atmospheric Hero: `Sara Fricker` in Kultüre, concise discipline line in Oscine, small upper nav.
2. About teaser: expressive editorial statement with controlled typographic emphasis.
3. Selected work: immersive dark index with split titles, project thumbnails, discipline metadata and lightweight hover motion.
4. 3D identity moment: controlled logo sequence with clear sky/ocean; optional hero position or mid-page feature, depending on rhythm.
5. Human side / everyday context: editorial narrative; retain personal warmth and photography.
6. Large footer wordmark/contact.

### Case study
1. Immersive title hero: split project title, cover media, metadata.
2. Context & brief (short readable paragraphs).
3. Role, challenge, process, decisions and design rationale.
4. Main outputs / media: generous image sizes, consistent captions.
5. Outcomes, learnings and next-project navigation.
6. Footer.

Use role labels consistently (`Digital Design`, `UI/UX Design`, `Frontend Development`, `Visual Design`, `Personal Project`). Editorial Type Space modules may use light canvas; VR and UI projects retain their own documentation formats within shared layout rules.

## 08 — Accessibility & performance

- WCAG AA contrast: minimum 4.5:1 for small text, 3:1 for large text and essential graphic controls; verify actual combinations during design.
- Prefer body ≥16px. Never hide crucial metadata in tiny overlaid white text on busy photography; use gradient overlay/scrim as needed.
- Provide `alt` text, semantic headings, keyboard-accessible nav and accordions, escape handling for overlays.
- Respect `prefers-reduced-motion: reduce` and pause/offscreen rendering where applicable.
- Load display fonts responsibly: local licensed WOFF2, `font-display: swap`; monitor layout shift.
- Compress hero media and lazy-load below-the-fold assets; do not make an expensive WebGL background mandatory on mobile.

## 09 — Figma file architecture & handoff

**Figma file pages:** `00 Cover & Principles`, `01 Foundations`, `02 Components`, `03 Motion & 3D`, `04 Templates`, `05 Playground`, `06 Dev Handoff`.

**Variables:** collection `Primitives` for color/spacing/radius and `Semantic` for canvas/text/interactive, with modes `Dark` and `Light`. Add number variables for spacing and radii; text styles for type. Keep component variants and the prototype interactions in `02 Components`. Place each real screenshot and its proposed rebuilt page side by side in `04 Templates`.

**Figma-to-Code naming parity:** `color/brand/blue-500` ↔ `--color-brand-blue-500`; `space/6` ↔ `--space-6`; `Type/Display/Hero` ↔ CSS `.type-display-hero`.

**Documentation discipline:** Each component needs purpose, dos/don'ts, variants, responsive behavior, interaction and accessibility specs. When a design exception is introduced for one project, explain why and prevent it from silently changing global primitives.

## 10 — Decision checklist

Before approving a new design or Codex pull request, ask:
1. Does it support the work and the visitor's task, rather than showing off technology?
2. Does it preserve Kultüre, Oscine, `#88C1F2`, the dark editorial base and established layout rhythm?
3. Is the project imagery the protagonist? Is any bright 3D motif purposeful and scarce?
4. Are dark/light variants, mobile states, keyboard, reduced motion and loading accounted for?
5. Does the motion improve meaning, wayfinding or tactility, and can it be skipped?
6. Is the original blue-white logo precisely preserved in final branded views?

**North star:** A calm editorial portfolio with a surprising, tactile digital soul.
