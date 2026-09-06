import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import {generateTokens, generateRandomPassword, setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME} from '../utils/token';

export const registerCustomer = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const existingCustomer = await prisma.customer.findUnique({ where: { email } });
    if (existingCustomer) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await prisma.customer.create({
      data: { email, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });

    return res.status(201).json({ message: 'Customer registered successfully', customer });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering customer' });
  }
};

export const customerLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      return res.status(401).json({ message: 'Invalid credentials or unauthorized role' });
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens({
      userId: customer.id,
      role: 'CUSTOMER',
    });

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      accessToken,
      user: { id: customer.id, email: customer.email, role: 'CUSTOMER' },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error during login' });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials or unauthorized role' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens({
      userId: admin.id,
      role: 'ADMIN',
    });

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      accessToken,
      user: { id: admin.id, email: admin.email, role: 'ADMIN', isSuperAdmin: admin.isSuperAdmin },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error during login' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  // Read refresh token from the cookie
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing in cookies' });
  }

  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

  try {
    const decoded = jwt.verify(refreshToken, refreshSecret) as {
      userId: string;
      role: 'CUSTOMER' | 'ADMIN';
    };

    let userExists = false;
    if (decoded.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { id: decoded.userId } });
      userExists = !!customer;
    } else if (decoded.role === 'ADMIN') {
      const admin = await prisma.admin.findUnique({ where: { id: decoded.userId } });
      userExists = !!admin;
    }

    if (!userExists) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Issue a fresh access token and rotate the refresh token
    const tokens = generateTokens({ userId: decoded.userId, role: decoded.role });
    setRefreshCookie(res, tokens.refreshToken);

    return res.status(200).json({ accessToken: tokens.accessToken });
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(403).json({ message: 'Expired or invalid refresh token' });
  }
};

export const logout = async (_req: Request, res: Response) => {
  clearRefreshCookie(res);
  return res.status(200).json({ message: 'Logged out successfully' });
};

export const createAdmin = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin email already exists' });
    }

    const temporaryPassword = generateRandomPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        isSuperAdmin: false,
      },
      select: {
        id: true,
        email: true,
        isSuperAdmin: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: 'Admin account created successfully',
      admin: newAdmin,
      temporaryPassword,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating admin' });
  }
};