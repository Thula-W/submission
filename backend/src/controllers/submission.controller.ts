import { Request, Response } from 'express';
import { Prisma, Gender } from '@prisma/client';
import prisma from '../config/prisma';

export const createSubmission = async (req: Request, res: Response) => {
  const customerId = req.user?.userId;

  if (!customerId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { firstName, lastName, email, gender, mobileNumber, address, feedback } = req.body;

  try {
    const existingSubmission = await prisma.submission.findFirst({ where: { email } });
    if (existingSubmission) {
      return res.status(409).json({ message: 'A submission with this email already exists' });
    }

    const submission = await prisma.submission.create({
      data: {
        firstName,
        lastName,
        email,
        gender,
        mobileNumber,
        address,
        feedback,
        customerCreatedId: customerId,
      },
    });

    return res.status(201).json({
      message: 'Form submitted successfully',
      submission,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error submitting form' });
  }
};

export const getSubmissions = async (req: Request, res: Response) => {
  const { gender, search } = req.query;

  try {
    const where: Prisma.SubmissionWhereInput = {};

    if (gender && ['MALE', 'FEMALE', 'OTHER'].includes(gender as string)) {
      where.gender = gender as Gender;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
      ];
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        customerCreated: {
          select: { id: true, email: true },
        },
        adminModified: {
          select: { id: true, email: true },
        },
      },
      orderBy: { dateCreated: 'desc' },
    });

    return res.status(200).json({ submissions });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching submissions' });
  }
};

export const updateSubmission = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const adminId = req.user?.userId;

  try {
    const existingSubmission = await prisma.submission.findUnique({ where: { id } });
    if (!existingSubmission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        ...req.body,
        adminModifiedId: adminId,
        dateModified: new Date(),
      },
    });

    return res.status(200).json({
      message: 'Submission updated successfully',
      submission: updatedSubmission,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating submission' });
  }
};

export const deleteSubmission = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const existingSubmission = await prisma.submission.findUnique({ where: { id } });
    if (!existingSubmission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    await prisma.submission.delete({ where: { id } });

    return res.status(200).json({ message: 'Submission deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting submission' });
  }
};