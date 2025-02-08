// import createHttpError from 'http-errors';
import * as authServices from '../services/auth.js';

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

export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  await authServices.forgotPassword(email);

  res.json({
    status: 200,
    message: 'Password reset instructions sent'
  });
};//контролер для форготпас
