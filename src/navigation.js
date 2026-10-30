/** Browser-only navigation enhancements.
 * The navbar HTML comes from src/site-layout.js via Vite.
 * Native <details> already opens with click, tap, Enter, or Space;
 * this file only adds convenient ways to close the project index.
 */

// Only install these listeners when the shared project directory exists.
const directory = document.querySelector('.project-directory');
if (directory) {
  // Remember the summary so keyboard users can return to the menu button.
  const trigger = directory.querySelector('summary');

  // Escape closes the index and restores focus without navigating away.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && directory.open) {
      directory.open = false;
      trigger.focus();
    }
  });

  // Clicking anywhere outside the directory closes it. Inside links still work normally.
  document.addEventListener('click', event => {
    if (!directory.contains(event.target)) directory.open = false;
  });

  // Close after the user tabs out. Wait one frame so the new focused element is known;
  // moving between links inside the directory must not close it.
  directory.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!directory.contains(document.activeElement)) directory.open = false;
    });
  });

  // Close immediately after selecting a project, including same-page destinations.
  directory.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { directory.open = false; });
  });
}

// HOMEPAGE DOCK: a decorative blue highlight follows mouse and keyboard focus.
// Link destinations and the active-state fallback remain usable without JavaScript.
const homeDock = document.querySelector('.home-nav-dock');
if (homeDock) {
  const links = [...homeDock.querySelectorAll('a')];
  const highlight = homeDock.querySelector('.home-nav-highlight');
  let activeLink = links.find(link => link.hasAttribute('aria-current')) || links[0];

  function moveHighlight(link) {
    highlight.style.width = `${link.offsetWidth}px`;
    highlight.style.transform = `translateX(${link.offsetLeft}px)`;
    links.forEach(item => item.classList.toggle('is-highlighted', item === link));
  }

  // Keep keyboard focus highlighted when the pointer leaves the dock.
  function restoreHighlight() {
    const focused = links.find(link => link === document.activeElement);
    moveHighlight(focused || activeLink);
  }

  links.forEach(link => {
    link.addEventListener('pointerenter', () => moveHighlight(link));
    link.addEventListener('focus', () => moveHighlight(link));
  });
  homeDock.addEventListener('pointerleave', restoreHighlight);
  homeDock.addEventListener('focusout', () => requestAnimationFrame(restoreHighlight));

  // Show Contact as the current section when its footer enters the viewport.
  // About me and Playground are separate pages, rather than in-page scroll targets.
  const contact = document.querySelector('#kontakt');
  if (contact && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      activeLink = links.find(link => link.dataset.navKey === (entry.isIntersecting ? 'contact' : 'work'));
      links.forEach(link => {
        if (link === activeLink) link.setAttribute('aria-current', 'location');
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
