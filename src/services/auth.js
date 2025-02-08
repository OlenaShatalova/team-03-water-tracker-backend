import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { UserCollection } from '../db/models/User.js';
import { SessionCollection } from '../db/models/Session.js';

import {
  ACCESS_TOKEN_LIFETIME,
  REFRESH_TOKEN_LIFETIME,
} from '../constants/user.js';

import nodemailer from 'nodemailer';
import { env } from '../utils/env.js';

const createSessionData = () => ({
  accessToken: randomBytes(30).toString('base64'),
  refreshToken: randomBytes(30).toString('base64'),
  accessTokenValidUntil: Date.now() + ACCESS_TOKEN_LIFETIME,
  refreshTokenValidUntil: Date.now() + REFRESH_TOKEN_LIFETIME,
});

const createUserData = (user) => ({
  name: user.name ?? null,
  email: user.email ?? null,
  dailyNorm: user.dailyNorm ?? null,
  gender: user.gender ?? null,
  avatar: user.avatar ?? null,
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
    user: createUserData(newUser),
    accessToken: sessionData.accessToken,
  };
};

export const login = async ({ email, password }) => {
  const user = await UserCollection.findOne({ email });
  // const user = await UserCollection.findOne({ email });
  // console.log(user);

  if (!user) {
    throw createHttpError(401, 'Email or password invalid');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, 'Email or password invalid');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const sessionData = createSessionData();
  //const session
  const session = await SessionCollection.create({
    userId: user._id,
    ...sessionData,
  });

  return {
    userData: createUserData(user),
    accessToken: sessionData.accessToken,
    refreshToken: sessionData.refreshToken,
    id: session._id, // Додаємо ID сесії
    refreshTokenValidUntil: session.refreshTokenValidUntil,
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

export const forgotPassword = async (email) => {
  const user = await UserCollection.findOne({ email });

  if (user) {
    const transporter = nodemailer.createTransport({
      host: env('SMTP_HOST'),
      port: env('SMTP_PORT'),
      secure: true,
      auth: {
        user: env('SMTP_USER'),
        pass: env('SMTP_PASSWORD'),
      },
    });

    try {
      await transporter.sendMail({
        from: env('SMTP_USER'),
        to: email,
        subject: 'Water Tracker - Password Reset',
        html: `
            <h1>Password Reset Request</h1>
            <p>You have requested to reset your password.</p>
            <p>If you did not make this request, please ignore this email.</p>
            <p>Instructions for resetting your password will be implemented in the next update.</p>
          `,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      // Не прокидаємо помилку користувачу для безпеки
    }
  }

  // Завжди повертаємо true для безпеки
  return true;
};
