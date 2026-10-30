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
