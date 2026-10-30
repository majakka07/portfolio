# Sara Fricker — Portfolio

Static, responsive portfolio homepage, served and built with Vite.

## Develop

Requires Node.js 20.19+ or 22.12+ (validated with Node.js 24).

```sh
npm ci
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static host. Use Vite for development and build before deployment.

Kultüre is loaded locally from the supplied font. Body text uses Trebuchet MS with Arial/sans-serif fallbacks as an Oscine substitute. Homepage photos are crops from the flattened design export; original photography would allow more accurate framing. Project detail pages are future work. Confirm contact details before publishing.

## Projektseiten bearbeiten

- `index.html`: Homepage; die SchatzkisteVR-Bildkarte verlinkt die erste Projektseite.
- `schatzkistevr.html`: vollständige Fallstudie mit kommentierten Abschnitten. Texte stehen direkt im HTML.
- `styles/project.css`: lesbar gegliederte Gestaltung der Projektseiten, inklusive mobiler Darstellung.
- `assets/projects/schatzkistevr/`: austauschbare Projektbilder. `hero.webp` ist der Hero, `video-poster.webp` die Filmvorschau, `tools.webp` und `methods.webp` die Kartenhintergründe, `result.webp` das Ergebnisbild, `treasures.webp` und `memories.webp` die Erlebniswelten und `process.webp` die Prozessgrafik.
- `vite.config.js`: registriert beide HTML-Seiten für den Produktionsbuild. Weitere Projektseiten hier ergänzen.

Die vorläufigen Bilder sind Ausschnitte der gelieferten PNG-Vorlage, keine Originalbilder. Einfach gleichnamige Dateien ersetzen oder die jeweiligen `src`-Attribute im HTML ändern; auch die `alt`-Texte anpassen. Der Hero ist ein enger Ausschnitt, damit eingebrannte Schrift nicht doppelt erscheint. Die Filmvorschau ist ausdrücklich noch kein abspielbares Video. Im HTML ist die Stelle zum Einsetzen eines echten Videos kommentiert. Die ausgeklappten Learning-Texte sind redaktionelle Entwürfe und vor Veröffentlichung zu prüfen.

## LessonFlow und TypeSpace

- `lessonflow.html`: Fallstudie mit editierbaren Abschnitten für Projektidee, Visual Design, Farbwelt, Typografie, UI-Elemente, Ikonografie, Navigation und Zusammenarbeit.
- `typespace.html`: vorläufiges Grundgerüst. Der TypeSpace-Upload überschritt das Downloadlimit von 32 MiB; die vollständige Vorlage konnte noch nicht geprüft werden. Eine kleinere PNG-/JPG-Datei wird benötigt.
- `styles/studies.css`: gemeinsame, lesbar gegliederte Komponenten für diese Seiten; nutzt `src/tokens.css` für Farben, Abstände und responsive Grundlagen.
- `assets/projects/lessonflow/`: vorläufige Bildausschnitte aus der Vorlage, mit sprechenden Dateinamen. Ersetze die Dateien oder ändere `src` und `alt` im entsprechenden HTML-Abschnitt. Bildtexte innerhalb dieser Ausschnitte bleiben Teil des Bildes, bis Originalgrafiken vorliegen.

Designsystem: Kultüre ist unter dem vorhandenen CSS-Namen `Kulture` eingebunden. Die vom Benutzer freigegebene Trebuchet-MS-Alternative zu Oscine bleibt dokumentiert. Die neuen Seiten verwenden Graphit `#494B4F`; TypeSpace nutzt zusätzlich den vorgesehenen hellen Editorial-Modus. Statische HTML-Seiten bleiben wegen der bestehenden Vite-Multipage-Struktur erhalten, statt für diese statischen Inhalte React einzuführen. TypeSpace ist noch keine fertige Fallstudie. Keine Animationen hinzugefügt.

## Shared navigation

Use **`npm run dev`** for local development. The navigation is inserted into each page by Vite at development/build time, so opening the source HTML directly or serving it with Python will not render the shared components. Production output in `dist/` contains complete HTML and works without JavaScript.

- `src/site-layout.js`: the single project list, shared navbar, thumbnail project directory, and related-project cards. Add future case studies to `projects` here; do not duplicate navigation in each page.
- `styles/navigation.css`: responsive navbar, focus states, project cards, homepage shortcuts, and initial About/Playground layouts. Uses the existing design-system tokens and the owner-approved Trebuchet body fallback.
- `src/navigation.js`: optional Escape, outside-click, and focus-leave dismissal for the native project-index disclosure. The index links still work without JavaScript.
- `<!-- SITE_NAV -->` / `<!-- PROJECT_NAV -->`: insertion points in the page HTML. Primary navigation always offers Work, About and Playground; project pages include an anchored return to `index.html#portfolio` and two other project cards.
- `about.html`: initial destination using existing About copy, ready for its own design.
- `playground.html`: clearly marked starting page for future experiments.

The navigation is sticky to keep the project return available on long case studies. Anchor offsets keep target content below it. Main links stay visible on mobile, avoiding an additional nested menu. The project directory is a disclosure rather than a modal: it does not trap focus, and Escape restores focus to its trigger. No new motion or animation dependencies were added. The TypeSpace preview status remains explicit.

### Homepage navigation dock

The homepage uses a distinct navbar variant with **Work / About me / Contact / Playground**. Edit link labels and destinations in `siteNavigation()` in `src/site-layout.js`. `styles/navigation.css` contains the `HOMEPAGE NAVIGATION DOCK` styles; `src/navigation.js` handles the decorative highlight, keyboard focus, responsive measurements, and Work/Contact section state. The hover/focus movement uses the existing motion tokens and stops for reduced-motion preferences. All four links remain visible on mobile and usable without JavaScript. Project-page navigation retains its existing layout.

## Interactive ocean hero

The homepage hero is a procedural 3D interpretation of the supplied ocean/logo references, not a pixel-exact separation of the inline photographs. No source GLB or downloadable image layers were supplied. The existing SVG provides the actual logo geometry.

- `src/hero/hero.js`: native-scroll GSAP timeline, motion preference/toggle, keyboard/touch bloom control, and lazy scene loading.
- `src/hero/scene.js`: renderer, responsive framing, pointer raycasting, local bloom damping, camera descent, and underwater particles. It pauses rendering offscreen/when hidden and disposes resources on teardown.
- `src/hero/logo.js`: beveled silhouette and raised white S, soft radial moss material, seeded instanced petals and leaves. The white S is excluded from flower placement.
- `src/hero/logo-shape.json`: contour and white vector path derived from the original SVG; do not replace with an unrelated logo.
- `src/hero/ocean.js`: independent procedural sky and reflective water layers, locally generated normal texture, environment lighting.
- `styles/hero.css`: editable HTML copy placement, static fallback, waterline/underwater layers, responsive layouts, reduced-motion treatment.

Hover over the blue logo surface for local blooming, or use **Bloom the logo** with touch/keyboard. **Pause motion** disables the animated hero. Reduced-motion users receive the original SVG without loading Three.js. A missing WebGL context also keeps the SVG fallback. Work links continue to jump directly to the homepage project collection. This hero deliberately uses an extended scroll composition at the owner's request; the rest of the site retains the calmer editorial motion system. No smooth-scroll replacement or wheel interception is used.

To inspect deterministic 3D poses during development, open `/?heroDebug`; `window.__heroDebug.render(progress, bloom)` renders a fixed scene state with progress from 0 to 1. Normal navigation has no debug hook. Three.js is downloaded only for the homepage and only when reduced motion is off; the production build reports a large lazy WebGL chunk, so test on the actual target mobile hardware before publishing performance claims.
