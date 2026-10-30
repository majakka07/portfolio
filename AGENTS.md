# Codex operating instructions — Sara Fricker portfolio

Read `DESIGN_SYSTEM.md` before making UI or motion changes. Treat it as the design source of truth. If this file conflicts with the design system, follow `DESIGN_SYSTEM.md`.

## Non-negotiable identity
- Display font: Kultüre. Supporting font: Oscine. Use legitimate local font assets; never substitute silently.
- Primary blue: `#88C1F2`.
- Default canvas: graphite `#494B4F`; immersive index/home canvas: navy `#030A18`. Light modules: `#F8F9FA`.
- Tone: editorial, typographic, playful *in details*, accessible, calm, human.
- Preserve supplied original logo geometry and blue-white pattern, especially at end of motion scene.
- Keep project-specific visuals distinctive; avoid imposing the 3D cloud style on case studies.

## Development practice
- Prefer reusable React + TypeScript components, semantic HTML and CSS custom properties from `tokens.css`.
- Use GSAP only for motion requiring a timeline or scroll orchestration; CSS for simple hover/focus transitions.
- Use Three.js/React Three Fiber only when interactive realtime 3D materially improves UX. Otherwise use an optimized video with poster image.
- Use motion durations/easings specified in design system. Respect `prefers-reduced-motion`.
- Never add autoplay audio, mandatory intro loader, scroll-jacking, custom cursor with unclear affordances, or hover-only content.
- Keep animations stable in camera/composition and minimize layout shift.
- Build mobile-first responsive styles. Check at 390, 768, 1440 and 1920 widths.
- Verify text contrast, accessible focus, 44px touch targets, alt text, semantic headings and interactive keyboard flow.

## For every UI request
1. Identify existing component/token to reuse.
2. State which design-system principles the change applies.
3. Implement without inventing new colors/typographic scales.
4. Include reduced-motion and responsive states.
5. Explain any unavoidable deviation and propose whether it should become an official variant.

## 3D logo scene
Moss & flowers → naturally eroded stone → fluffy pink cloud → exactly original blue-white logo. Single smooth silhouette, consistent placement, cloudless sky, gentle sea reflection. Favor a 5-second prerendered asset. Overlay final original SVG/PNG for accurate ending.
