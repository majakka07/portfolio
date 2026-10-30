// Native details provides keyboard/touch access even without this enhancement.
const directory = document.querySelector('.project-directory');
if (directory) {
  const trigger = directory.querySelector('summary');
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && directory.open) {
      directory.open = false;
      trigger.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!directory.contains(event.target)) directory.open = false;
  });
  directory.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!directory.contains(document.activeElement)) directory.open = false;
    });
  });
  directory.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { directory.open = false; });
  });
}
