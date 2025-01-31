import { getUser } from '../services/userServices.js';

export const GetCurrentUser = async (req, res) => {
  //   const filter = req.user ? { _id: req.user._id } : { email: req.query.email };
  //   const currentUser = getUser(filter);
  const email = req.query.email;
  const currentUser = await getUser({ email });
  // const currentUser = req.user after middleware can uncomment

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
  if (!req.file) {
    throw createHttpError(400, 'No file uploaded');
  }

  const { _id } = req.user;
  const avatarUrl = await saveFileToUploadsDir(req.file);

  const result = await updateUserService({ _id }, { avatarUrl });

  if (!result) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Avatar updated successfully!',
    avatarUrl: result.avatarUrl,
  });
};
