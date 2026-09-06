import { Router } from 'express';
import { createSubmission, getSubmissions, updateSubmission, deleteSubmission} from '../controllers/submission.controller';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createSubmissionSchema, updateSubmissionSchema} from '../schemas/submission.schema';

const router = Router();


router.post(
  '/',
  authenticateToken,
  requireRole('CUSTOMER'),
  validate(createSubmissionSchema),
  createSubmission
);


router.get(
  '/',
  authenticateToken,
  requireRole('ADMIN'),
  getSubmissions
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  validate(updateSubmissionSchema),
  updateSubmission
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  deleteSubmission
);

export default router;