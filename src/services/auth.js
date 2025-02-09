import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { UserCollection } from '../db/models/User.js';
import { SessionCollection } from '../db/models/Session.js';

import {
  ACCESS_TOKEN_LIFETIME,
  REFRESH_TOKEN_LIFETIME,
} from '../constants/user.js';

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { env } from '../utils/env.js';
import path from 'node:path';
import { TEMPLATES_DIR, SMTP } from '../constants/index.js';
import fs from 'node:fs/promises';

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

const transporter = nodemailer.createTransport({
  host: env(SMTP.SMTP_HOST),
  port: Number(env(SMTP.SMTP_PORT)),
  secure: false,
  auth: {
    user: env(SMTP.SMTP_USER),
    pass: env(SMTP.SMTP_PASSWORD),
  },
  tls: {
    rejectUnauthorized: false, // додаємо цей параметр
  },
});

const sendEmail = async (options) => {
  return await transporter.sendMail(options);
};

export const sendResetEmail = async (email) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    {
      userId: user._id,
      email,
    },
    env('JWT_SECRET'),
    { expiresIn: '15m' },
  );

  const templatePath = path.join(TEMPLATES_DIR, 'reset-password-email.html');
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  const template = handlebars.compile(templateSource);

  const resetUrl = `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`;

  const html = template({
    name: user.name || email,
    link: resetUrl,
  });

  try {
    await sendEmail({
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(500, 'Failed to send email');
  }
};

export const resetPassword = async ({ password, token }) => {
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, env('JWT_SECRET'));
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await UserCollection.findOne({
    _id: decodedToken.userId,
    email: decodedToken.email,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await UserCollection.findByIdAndUpdate(user._id, {
    password: hashedPassword,
  });
};
