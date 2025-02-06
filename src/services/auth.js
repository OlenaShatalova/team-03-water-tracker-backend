import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { UserCollection } from '../db/models/User.js';
import { SessionCollection } from '../db/models/Session.js';

import {
  ACCESS_TOKEN_LIFETIME,
  REFRESH_TOKEN_LIFETIME,
} from '../constants/user.js';

const createSessionData = () => ({
  accessToken: randomBytes(30).toString('base64'),
  refreshToken: randomBytes(30).toString('base64'),
  accessTokenValidUntil: Date.now() + ACCESS_TOKEN_LIFETIME,
  refreshTokenValidUntil: Date.now() + REFRESH_TOKEN_LIFETIME,
});

export const register = async (payload) => {
  const { email, password } = payload;
  const user = await UserCollection.findOne({ email });
  if (user) {
    throw createHttpError(409, 'User already exists!');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await UserCollection.create({
    ...payload,
    password: hashPassword,
  });

  const sessionData = createSessionData();
  await SessionCollection.create({
    userId: newUser._id,
    ...sessionData,
  });

  return {
    user: newUser,
    accessToken: sessionData.accessToken,
  };
};

export const login = async ({ email, password }) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password invalid');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, 'Email or password invalid');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const sessionData = createSessionData();
  const newSession = await SessionCollection.create({
    userId: user._id,
    ...sessionData,
  });

  return {
    user,
    accessToken: sessionData.accessToken,
  };
};

export const refreshToken = async (payload) => {
  const oldSession = await SessionCollection.findOne({
    _id: payload.sessionId,
    refreshToken: payload.refreshToken,
  });
  if (!oldSession) {
    throw createHttpError(401, 'Session not found');
  }

  if (Date.now() > oldSession.refreshTokenValidUntil) {
    throw createHttpError(401, 'Refresh token expired');
  }

  await SessionCollection.deleteOne({ _id: payload.sessionId });

  const sessionData = createSessionData();

  return SessionCollection.create({
    userId: oldSession.userId,
    ...sessionData,
  });
};

export const logout = async (sessionId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

export const getSession = (filter) => SessionCollection.findOne(filter);

export const getUser = (filter) => UserCollection.findOne(filter);

export const updateUserService = (filter, updateData) =>
  UserCollection.findOneAndUpdate(
    filter,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    },
  );
