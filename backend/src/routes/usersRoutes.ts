import { Router } from 'express';
import { UsersController } from '../controllers/UsersController';

const router = Router();
router.get('/:id', UsersController.getProfile);

export default router;
