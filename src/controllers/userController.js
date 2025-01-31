import { getUser } from '../services/userServices.js';

export const GetCurrentUser = async (req, res) => {
  //   const filter = req.user ? { _id: req.user._id } : { email: req.query.email };
  //   const currentUser = getUser(filter);
  const email = req.query.email;
  const currentUser = await getUser({ email });
  // const currentUser = req.user after middleware can uncomment

  if (!currentUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({
    email: currentUser.email,
    gender: currentUser.gender,
    dailyNorm: currentUser.dailyNorm,
    avatarUrl: currentUser.avatarUrl,
  });
};
