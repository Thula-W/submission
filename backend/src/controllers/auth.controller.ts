import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/prisma';
import { generateTokens, generateRandomPassword } from '../utils/token';

export const registerCustomer = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const existingCustomer = await prisma.customer.findUnique({ where: { email } });
    if (existingCustomer) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await prisma.customer.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
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

    const tokens = generateTokens({ userId: customer.id, role: 'CUSTOMER' });

    return res.status(200).json(tokens);
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

    const tokens = generateTokens({ userId: admin.id, role: 'ADMIN' });

    return res.status(200).json(tokens);
  } catch (error) {
    return res.status(500).json({ message: 'Error during login' });
  }
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