# Sara Fricker — Portfolio

Responsive homepage with a React Three Fiber / Three.js logo experience immediately after the hero. The rest of the homepage remains static HTML.

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

Deploy the generated `dist/` directory to a static host. The original Python-only workflow no longer processes the React module; use Vite for development and build before deployment.

## Logo animation

- `src/LogoScene.jsx`: extruded blue silhouette and white S from the supplied logo; procedural daisy, rose, and hydrangea materials morph into the final blue finish over eight seconds of visible playback. Gentle pulse and surface displacement settle at completion.
- `src/logo-shape.json`: simplified silhouette traced from the supplied SVG alpha channel and its original white vector path. `assets/logo.svg` preserves the original artwork and provides the non-WebGL fallback.
- `src/main.jsx`: lazy scene loading, visibility handling, drag/touch/keyboard rotation, pause/replay/reset controls, reduced-motion support, and rendering failure fallback.
- The timeline plays once when the section becomes visible. Scrolling away or hiding the tab suspends playback. Reduced-motion users see the final logo and can explicitly replay. Floral patterns are generated in the shader, not external photography.

Kultüre is loaded locally from the supplied font. Body text uses Trebuchet MS with Arial/sans-serif fallbacks as an Oscine substitute. Homepage photos are crops from the flattened design export; original photography would allow more accurate framing. Project detail pages are future work. Confirm contact details before publishing.
