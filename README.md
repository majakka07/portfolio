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
