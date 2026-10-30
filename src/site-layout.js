/** Shared HTML, rendered by Vite at development/build time.
 * Add future case studies here; the index and related cards update together.
 * Real anchors remain usable without client-side JavaScript.
 */
export const projects = [
  { slug: 'schatzkistevr', title: 'SchatzkisteVR', discipline: 'UI/UX · WebVR', year: '2024–2025', image: 'assets/schatzkiste.webp' },
  { slug: 'typespace', title: 'TypeSpace', discipline: 'Visual Design · Print', year: '2021–2026', image: 'assets/type-space.webp', note: 'Preview' },
  { slug: 'lessonflow', title: 'LessonFlow', discipline: 'UI/UX · Development', year: '2025', image: 'assets/lesson-flow.webp' },
];

// SVG icons avoid missing arrow glyphs in locally available fallback fonts.
function withIcons(html) {
  const icon = path => `<svg class="navigation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="${path}"/></svg>`;
  return html.replaceAll('↗', icon('M5 19 19 5M5 5h14v14'))
    .replaceAll('↖', icon('M19 19 5 5M5 19V5h14'));
}

export function siteNavigation(page) {
  const project = projects.find(item => item.slug === page);
  const active = project || page === 'index' ? 'work' : page;
  const mainLinks = [
    ['work', 'index.html#portfolio', 'Work'],
    ['about', 'about.html', 'About'],
    ['playground', 'playground.html', 'Playground'],
  ].map(([key, href, label]) => `<a href="${href}"${key === active ? ' aria-current="' + (project ? 'true' : 'page') + '"' : ''}>${label}</a>`).join('\n');

  return withIcons(`
    <a class="site-skip" href="#${page === 'schatzkistevr' ? 'projektinhalt' : 'main'}">Skip to content</a>
    <header class="site-header">
      <div class="site-bar">
        <a class="site-brand" href="index.html" aria-label="Sara Fricker — Home">
          <img src="assets/logo.svg" alt="" width="44" height="44">
          <span>Sara Fricker<small>Design & Development</small></span>
        </a>
        <nav class="site-primary" aria-label="Main navigation">${mainLinks}</nav>
        <a class="site-contact" href="#kontakt">Let’s talk <span aria-hidden="true">↗</span></a>
      </div>
      <div class="site-context">
        ${project ? `<a class="site-back" href="index.html#portfolio"><span aria-hidden="true">↖</span> All projects</a><span class="site-location"><span>${String(projects.indexOf(project) + 1).padStart(2, '0')} / 03</span> ${project.title}</span>` : `<span class="site-location">${page === 'index' ? 'Independent designer · St. Gallen, CH' : page === 'about' ? 'A little more about me' : 'Room for curiosity'}</span>`}
        <details class="project-directory">
          <summary>Project index <span aria-hidden="true">＋</span></summary>
          <nav class="directory-panel" aria-label="Project index">
            <div class="directory-heading"><span>Selected work / 01—03</span><a href="index.html#portfolio">View all ↗</a></div>
            ${projects.map((item, i) => `<a class="directory-item" href="${item.slug}.html"${item.slug === page ? ' aria-current="page"' : ''}>
              <span class="directory-number">0${i + 1}</span><img src="${item.image}" width="64" height="64" alt="">
              <span>${item.title}<small>${item.discipline}${item.note ? ' · ' + item.note : ''}</small></span><span aria-hidden="true">${item.slug === page ? '●' : '↗'}</span>
            </a>`).join('')}
          </nav>
        </details>
      </div>
    </header>`);
}

export function projectNavigation(page) {
  const index = projects.findIndex(item => item.slug === page);
  if (index < 0) return '';
  const next = [projects[(index + 1) % projects.length], projects[(index + 2) % projects.length]];
  return withIcons(`<section class="project-explore" aria-labelledby="explore-title">
      <div class="explore-heading"><div><p>There’s more to discover</p><h2 id="explore-title">Keep exploring</h2></div><a class="explore-all" href="index.html#portfolio">All projects <span aria-hidden="true">↗</span></a></div>
      <div class="explore-grid">${next.map((item, i) => `<a class="explore-card" href="${item.slug}.html">
        <div class="explore-image"><img src="${item.image}" alt="" loading="lazy" width="885" height="876"><span>${i === 0 ? 'Up next' : 'Also discover'}${item.note ? ' · ' + item.note : ''}</span></div>
        <div class="explore-card-title"><h3>${item.title}</h3><span aria-hidden="true">↗</span></div><p>${item.discipline} <span>${item.year}</span></p>
      </a>`).join('')}</div>
      <a class="explore-return" href="index.html#portfolio">↖ Back to the full project collection</a>
    </section>`);
}
