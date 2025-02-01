import cloudinary from 'cloudinary';
import { unlink } from 'node:fs/promises';
import { env } from './env.js';
import { CLOUDINARY } from '../constants/index.js';


cloudinary.v2.config({
  secure: true,
  cloud_name: env(CLOUDINARY.CLOUD_NAME),
  api_key: env(CLOUDINARY.API_KEY),
  api_secret: env(CLOUDINARY.API_SECRET),
});

export const saveFileToCloudinary = async (file) => {
  const resposne = await cloudinary.v2.uploader.upload(file.path, {
    folder: 'userPhotos',
  });
  await unlink(file.path);

  return resposne.secure_url;
};
