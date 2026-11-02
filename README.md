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
