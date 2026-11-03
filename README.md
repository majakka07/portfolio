# Sara Fricker — Portfolio

A static, multi-page portfolio served by Vite. Page content stays in HTML; Vite inserts the shared navigation during development and production builds. Read `DESIGN_SYSTEM.md` before changing the design.

## Run and build

Requires Node.js 20.19+ or 22.12+ (validated with Node.js 24).

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Edits update the running preview. Use Vite rather than opening HTML files directly: the navigation depends on its HTML transform.

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static host. Built pages include the navigation and work without browser JavaScript.

## Where to edit

| File or directory               | Purpose                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `index.html`                    | Homepage sections and project entries                                             |
| `schatzkistevr.html`            | SchatzkisteVR case study                                                          |
| `lessonflow.html`               | LessonFlow case study                                                             |
| `typespace.html`                | TypeSpace preview scaffold                                                        |
| `about.html`, `playground.html` | Starting pages for personal content and experiments                               |
| `src/site-layout.js`            | Project catalogue, shared header, project directory and related cards             |
| `src/navigation.js`             | Browser entry point; starts the optional navigation enhancements                  |
| `src/project-directory.js`      | Escape, outside-click and focus dismissal for the native project menu             |
| `src/home-dock.js`              | Homepage hover/focus highlight, responsive measurements and contact section state |
| `src/tokens.css`                | Design-system colors, spacing, typography, themes and reduced-motion rules        |
| `styles.css`                    | Ordered entry point for shared page styles                                        |
| `styles/base.css`               | Local display font, existing color aliases and global element defaults            |
| `styles/home.css`               | Homepage sections in document order                                               |
| `styles/footer.css`             | Shared contact footer and hidden-text utility                                     |
| `styles/responsive.css`         | Mobile overrides for shared page styles                                           |
| `styles/navigation.css`         | Shared navigation, related cards and About/Playground layouts                     |
| `styles/project.css`            | SchatzkisteVR case-study layout                                                   |
| `styles/studies.css`            | LessonFlow and TypeSpace case-study components                                    |
| `assets/`                       | Local fonts, brand artwork and homepage images                                    |
| `assets/projects/`              | Images grouped by case study                                                      |
| `vite.config.js`                | Page entry points and shared HTML insertion plugin                                |

### Stylesheet order

Each page loads `src/tokens.css`, then `styles.css`, its case-study stylesheet if needed, and finally `styles/navigation.css`. Inside `styles.css`, base, homepage, footer and responsive styles retain their existing cascade order. Image URLs in the `styles/` directory are relative to that directory (`../assets/`).

### Shared markup and behavior

Keep `<!-- SITE_NAV -->` and `<!-- PROJECT_NAV -->` insertion markers where shared markup should appear. Edit their output in `src/site-layout.js`. The `projects` array supplies directory thumbnails and related cards; homepage project content is edited separately in `index.html`.

The homepage navigation has Work, About me, Contact and Playground destinations. Case-study pages use the shared project navigation. Native links and the project-menu disclosure work without JavaScript; the browser modules add highlight positioning and menu dismissal. CSS controls motion and its reduced-motion fallback.

### Add a page or replace media

1. Create the HTML page using the closest existing page as a template, preserving the main-content and contact IDs used by navigation.
2. Register its filename in the `pages` array in `vite.config.js`.
3. For a case study, update `projects` in `src/site-layout.js` and add its homepage entry. Related cards currently show the next two projects in catalogue order.
4. Put project imagery under `assets/projects/<project>/`; update `src`, dimensions and alternative text when replacing media.
5. Run the formatting check and build; review the preview at 390, 768, 1440 and 1920 pixels when changing layout.

## Formatting and validation

```sh
npm run format
npm run format:check
npm run build
```

Prettier keeps HTML, CSS, JavaScript and documentation readable. Strict HTML whitespace handling preserves spacing around inline content. Generated files, assets, lockfiles and design/agent reference documents are excluded. Comments explain section ownership, behavior and editing constraints rather than repeating individual declarations.

## Current content and asset limitations

- Kultüre uses the local `assets/kulture.otf` file and the CSS family name `Kulture`. Oscine is unavailable; the owner-approved Trebuchet MS fallback remains in place.
- Homepage photos and some case-study graphics are crops from flattened design exports. Text embedded in those images is not editable HTML; original graphics would improve framing and editing.
- SchatzkisteVR's film preview is a poster, not a playable video. Its HTML marks where to insert the real video. Expanded learning copy is an editorial draft.
- TypeSpace remains a preview scaffold: the supplied upload exceeded the 32 MiB download limit, so its complete reference has not been reviewed.
- About and Playground are starting pages. Confirm contact details and draft copy before publishing.

## Ocean homepage (React Three Fiber)

The homepage uses the supplied underwater scene for a surface-to-seabed scroll journey. This is a user-requested immersive homepage variant: the original project pages keep their editorial layouts and individual artwork. Kultüre, the existing blue/navy tokens and the approved body-font fallback are reused. The supplied GLB contains a **moss-textured logo**, which remains intact; the blue/white SVG is used for navigation and the static fallback.

- `src/ocean/main.tsx`: React entry, live reduced-motion preference, pause/resume, error boundary and GSAP content reveals. The controls render outside the decorative canvas.
- `src/ocean/journey.ts`: camera positions, look-at targets and small roll angles. Scroll progress is shared without React rerenders. Water is at `y=0`, the logo at `y=1.1`, and the floor at `y=-12`.
- `src/ocean/HeroScene.tsx`: a separate Three.js/R3F scene inside the hero, showing the complete uploaded GLB with its original water, ground, logo and transforms. Camera framing adapts to mobile. Demand rendering avoids a continuous animation loop, and the hero renderer unmounts offscreen. The scroll-scene render loop pauses while the hero is visible.
- `src/ocean/model.ts`: shared GPU disposal for the independently owned GLB instances.
- `src/ocean/OceanScene.tsx`: GLB loading, lighting, damped camera rig, underwater particles, light shafts and procedural seabed caustics. GPU resources and listeners are released on unmount; rendering stops in hidden tabs.
- `src/ocean/Water.tsx`: two-sided procedural water surface and underwater distance fade.
- `styles/ocean.css`: scoped homepage layouts, readable overlays, responsive behavior and static fallback.
- `public/models/underwater.glb`: web copy of the uploaded Underwater.glb. Embedded textures are resized to at most 1024 pixels, reducing the file from 26.4 MB to 12.6 MB without changing geometry. In the scroll scene, the GLB's bounded glass cube and flat floor are hidden in favor of horizon-sized water/floor shaders for the camera journey. In the hero, every original mesh remains visible. The reuploaded Underwater.glb was verified byte-for-byte identical to the original source; both scenes reuse the existing optimized web asset.

The browser scrolls the normal document; there is no wheel interception, nested scroll area or mandatory loading screen. All text and project links are HTML. With JavaScript disabled, WebGL unavailable, a scene-loading failure, or reduced motion enabled, content remains readable with a static logo/background. Reduced-motion mode does not mount the renderer or download the model. The pause button switches to this static view and can reactivate 3D. Animation uses a maximum device pixel ratio of 1.5.

Run `npm run typecheck`, `npm run format:check` and `npm run build` after changes. For reproducible camera screenshots, `?t=0` shows the surface, `?t=0.2` the underwater introduction and `?t=1` the seabed footer; the query freezes camera progress and shader time. Test the reduced-motion path using the browser/OS preference. Review both paths at 390, 768, 1440 and 1920 pixels. Actual frame rate depends on the device/GPU; this is not a performance guarantee.

### Browser regression checks

`npm run test:e2e` checks the seabed camera, pause/resume, reduced-motion downloads and responsive widths, model-load failure, and no-JavaScript reading/navigation. Install a browser once with `npx playwright install chromium`. To use an existing Chromium binary, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium` for the test command. The tests start Vite or reuse a running server at port 5173. Test traces/screenshots from failures are local ignored artifacts.
