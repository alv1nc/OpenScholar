import { Router } from 'express';
import { UsersController } from '../controllers/UsersController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();
router.get('/:id', UsersController.getProfile);
router.patch('/:id', authenticateJWT, UsersController.updateProfile);

export default router;
