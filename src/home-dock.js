/** Position the homepage highlight and track the visible contact section.
 * CSS owns animation timing and the reduced-motion fallback. */
export function initHomeDock() {
  // HOMEPAGE DOCK: a decorative blue highlight follows mouse and keyboard focus.
  // Link destinations and the active-state fallback remain usable without JavaScript.
  const homeDock = document.querySelector('.home-nav-dock');
  if (homeDock) {
    const links = [...homeDock.querySelectorAll('a')];
    const highlight = homeDock.querySelector('.home-nav-highlight');
    let activeLink =
      links.find((link) => link.hasAttribute('aria-current')) || links[0];

    function moveHighlight(link) {
      highlight.style.width = `${link.offsetWidth}px`;
      highlight.style.transform = `translateX(${link.offsetLeft}px)`;
      links.forEach((item) =>
        item.classList.toggle('is-highlighted', item === link),
      );
    }

    // Keep keyboard focus highlighted when the pointer leaves the dock.
    function restoreHighlight() {
      const focused = links.find((link) => link === document.activeElement);
      moveHighlight(focused || activeLink);
    }

    links.forEach((link) => {
      link.addEventListener('pointerenter', () => moveHighlight(link));
      link.addEventListener('focus', () => moveHighlight(link));
    });
    homeDock.addEventListener('pointerleave', restoreHighlight);
    homeDock.addEventListener('focusout', () =>
      requestAnimationFrame(restoreHighlight),
    );

    // Show Contact as the current section when its footer enters the viewport.
    // About me and Playground are separate pages, rather than in-page scroll targets.
    const contact = document.querySelector('#kontakt');
    if (contact && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        activeLink = links.find(
          (link) =>
            link.dataset.navKey === (entry.isIntersecting ? 'contact' : 'work'),
        );
        links.forEach((link) => {
          if (link === activeLink)
            link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
        restoreHighlight();
      });
      observer.observe(contact);
    }

    // Recalculate after fonts load and whenever responsive layout changes link widths.
    moveHighlight(activeLink);
    homeDock.classList.add('is-ready');
    document.fonts.ready.then(restoreHighlight);
    new ResizeObserver(restoreHighlight).observe(homeDock);
  }
}
