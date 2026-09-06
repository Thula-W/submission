import { Router } from 'express';
import {registerCustomer, customerLogin, adminLogin, createAdmin, logout, refreshAccessToken} from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticateToken, requireRole } from '../middleware/auth';
import {registerSchema, loginSchema, createAdminSchema} from '../schemas/auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), registerCustomer);
router.post('/login/customer', validate(loginSchema), customerLogin);
router.post('/login/admin', validate(loginSchema), adminLogin);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

router.post('/admin', authenticateToken, requireRole('ADMIN'), validate(createAdminSchema), createAdmin);

export default router;