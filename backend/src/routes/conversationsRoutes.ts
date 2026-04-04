import { Router } from 'express';
import { ConversationsController } from '../controllers/ConversationsController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateJWT); // All conversation routes are protected

router.get('/', ConversationsController.getAll);
router.post('/', ConversationsController.startChat);
router.get('/:id/messages', ConversationsController.getMessages);
router.post('/:id/messages', ConversationsController.send);

export default router;
