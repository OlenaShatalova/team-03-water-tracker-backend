// import createHttpError from 'http-errors';
import * as authServices from '../services/auth.js';

import { UserCollection } from '../db/models/User.js';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import nodemailer from 'nodemailer';
import { SMTP } from '../constants/index.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import { TEMPLATES_DIR } from '../constants/index.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie('sessionId', session.id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });
};

export const registerController = async (req, res) => {
  const data = await authServices.register(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      user: data.user,
      accessToken: data.accessToken,
    },
  });
};

export const loginController = async (req, res) => {
  const session = await authServices.login(req.body);

  setupSession(res, session);

  // Додав логування для перевірки
  console.log('Session after login:', session);
  console.log('Cookies being set:', {
    refreshToken: session.refreshToken,
    sessionId: session.id,
  });

  res.json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: {
      user: session.userData,
      accessToken: session.accessToken,
    },
  });
};

export const refreshTokenController = async (req, res) => {
  const { refreshToken, sessionId } = req.cookies;
  const session = await authServices.refreshToken({ refreshToken, sessionId });

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutController = async (req, res) => {
  if (req.cookies.sessionId) {
    await authServices.logout(req.cookies.sessionId);
  }

  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  res.status(204).send();
};

export const sendResetEmailController = async (req, res) => {
  const { email } = req.body;
  try {
    // Перевіряємо чи існує користувач
    const user = await UserCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User with this email not found',
      });
    }

    // Генеруємо токен
    const resetToken = jwt.sign(
      { userId: user._id, email },
      env('JWT_SECRET'),
      { expiresIn: '20m' },
    );

    // Читаємо шаблон листа
    const templatePath = path.join(TEMPLATES_DIR, 'reset-password-email.html');
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    // URL для редіректу на фронтенд
    const resetUrl = `${env('APP_DOMAIN')}/reset-password/${resetToken}`;

    const html = template({
      name: user.name || email,
      link: resetUrl,
    });

    // Відправляємо емейл через transporter
    const transporter = nodemailer.createTransport({
      host: env(SMTP.SMTP_HOST),
      port: Number(env(SMTP.SMTP_PORT)),
      secure: false,
      auth: {
        user: env(SMTP.SMTP_USER),
        pass: env(SMTP.SMTP_PASSWORD),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });

    res.json({
      status: 200,
      message: 'Reset instructions sent to email',
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      status: 500,
      message: err.message || 'Failed to send email',
    });
  }
};

export const resetPasswordController = async (req, res) => {
  const { password, token } = req.body;

  await authServices.resetPassword({ password, token });

  res.json({
    status: 200,
    message: 'Password has been reset successfully',
  });
};
