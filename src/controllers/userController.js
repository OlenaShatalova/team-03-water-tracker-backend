import createHttpError from 'http-errors';
import { updateUserService } from '../services/auth.js';

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
  const updateData = req.body;
  const updatedUser = await updateUserService({ _id }, updateData);

  if (!updatedUser) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({
    name: updatedUser.name,
    email: updatedUser.email,
    gender: updatedUser.gender,
    dailyNorm: updatedUser.dailyNorm,
    avatarUrl: updatedUser.avatarUrl,
  });
};
