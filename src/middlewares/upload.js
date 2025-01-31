import multer from 'multer';
import createHttpError from 'http-errors';

import { UPLOADS_DIR } from '../constants/index.js';

const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const uniquePreffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `${uniquePreffix}-${file.originalname}`;
    console.log(`Generated filename: ${fileName}`); // Логируем имя файла
    cb(null, fileName);
  },
});

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};
const fileFilter = (req, file, cb) => {
  const extension = file.originalname.split('.').pop().toLowerCase();
  console.log(`Checking file extension: ${extension}`); // Логируем расширение
  if (!allowedExtensions.includes(extension)) {
    return cb(createHttpError(400, 'Invalid file type'));
  }

  cb(null, true);
};

export const upload = multer({ storage, limits, fileFilter });
