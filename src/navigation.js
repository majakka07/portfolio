/** Browser entry point shared by every page. Each initializer checks for its markup. */
import { initProjectDirectory } from './project-directory.js';
import { initHomeDock } from './home-dock.js';

initProjectDirectory();
initHomeDock();
