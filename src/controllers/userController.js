import createHttpError from 'http-errors';
import { updateUserService } from '../services/auth.js';
import { saveFileToUploadsDir } from '../utils/saveFileToUploadsDir.js';
import { CLOUDINARY } from '../constants/index.js';
import { env } from '../utils/env.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import cloudinary from 'cloudinary';
import { UserCollection } from '../db/models/User.js';

export const getCurrentUser = async (req, res) => {
  const currentUser = req.user;

  if (!currentUser) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({
    email: currentUser.email,
    gender: currentUser.gender,
    dailyNorm: currentUser.dailyNorm,
    avatarUrl: currentUser.avatarUrl,
    name: currentUser.name,
  });
};

export const updateCurrentUser = async (req, res) => {
  const { _id } = req.user;
  const updateData = { ...req.body };

  const result = await updateUserService({ _id }, updateData);

  if (!result) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully updated a user!',
    data: result,
  });
};

export const updateUserAvatar = async (req, res) => {
  const cloudinaryEnable = env(CLOUDINARY.CLOUDINARY_ENABLE) === 'true';

  let photo;

  if (cloudinaryEnable) {
    photo = await saveFileToCloudinary(req.file);

    const user = await UserCollection.findById(req.user._id);

    if (user && user.avatarUrl) {
      const oldPhoto = user.avatarUrl;

      console.log('Old Avatar URL:', oldPhoto);

      // if user have avatar
      if (oldPhoto) {
        // using regular expression
        const regex = /\/upload\/v\d+\/(.*?)\./;
        const match = oldPhoto.match(regex);

        if (match && match[1]) {
          const oldCloudinaryId = match[1];
          console.log('Extracted Cloudinary ID:', oldCloudinaryId);

          // deleting the old avatar
          const deleteResult = await cloudinary.v2.uploader.destroy(
            oldCloudinaryId,
          );
          console.log('Cloudinary delete result:', deleteResult);

          if (deleteResult.result !== 'ok') {
            // error if delete failed
            throw new Error('Failed to delete the old avatar');
          }
        }
      }
    }
  } else {
    // if not using cloudinary then save the file to the uploads directory
    photo = await saveFileToUploadsDir(req.file);
  }

  //  if no file uploaded
  if (!req.file) {
    throw createHttpError(400, 'No file uploaded');
  }

  // user id from token
  const { _id } = req.user;

  // updating link to avatar
  const result = await updateUserService({ _id }, { avatarUrl: photo });

  if (!result) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Avatar updated successfully!',
    avatarUrl: result.avatarUrl,
  });
};
