import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Response, CookieOptions } from 'express';

export const REFRESH_COOKIE_NAME = 'refreshToken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

export const generateTokens = (payload: { userId: string; role: string }) => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const generateRandomPassword = (length = 12): string => {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
};

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 1 * 24 * 60 * 60 * 1000, 
  path: '/api/auth', 
};

export const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...refreshCookieOptions,
    maxAge: 0,
  });
};