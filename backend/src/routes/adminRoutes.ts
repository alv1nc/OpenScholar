import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateJWT, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Globally lock this entire router structurally to only 'admin' roles visually!
router.use(authenticateJWT, requireRole(['admin']));

router.get('/users', AdminController.getAllUsers);
router.delete('/users/:id', AdminController.deleteUser);
router.post('/users/:id/role', AdminController.elevateRole);

router.get('/papers', AdminController.getAllPapers);
router.delete('/papers/:id', AdminController.deletePaper);

export default router;
