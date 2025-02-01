import path from 'node:path';

export const TEMP_UPLOAD_DIR = path.resolve('temp');

export const UPLOADS_DIR = path.resolve('uploads');

export const SWAGGER_PATH = path.resolve('docs', 'swagger.json');

export const CLOUDINARY = {
  CLOUD_NAME: 'CLOUD_NAME',
  API_KEY: 'API_KEY',
  API_SECRET: 'API_SECRET',
  CLOUDINARY_ENABLE: 'CLOUDINARY_ENABLE',
};
