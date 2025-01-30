import { initMongoConnection } from './db/initMongoConnection.js';
import { startServer } from './server.js';

import { createDirIfNotExist } from './utils/createDirIfNotExist.js';

import { TEMP_UPLOAD_DIR, UPLOADS_DIR } from './constants/index.js';

const boostrap = async () => {
  await createDirIfNotExist(TEMP_UPLOAD_DIR);
  await createDirIfNotExist(UPLOADS_DIR);
  await initMongoConnection();
  startServer();
};

boostrap();
