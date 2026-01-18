import { initUsersDB, initFavoritesDB, initOauthUsersDB } from './utils';

(async () => {
  await initUsersDB();
  await initOauthUsersDB();
  await initFavoritesDB();
  process.exit(0);
})();
