import { Router } from 'express';
import multer from 'multer';
import { PapersController } from '../controllers/PapersController';
import { authenticateJWT, requireRole } from '../middlewares/authMiddleware';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '.pdf'); // Storing safely as a known format
  }
});

const upload = multer({ storage });

router.get('/recent', PapersController.getRecent);
router.get('/', PapersController.getAll);
router.get('/:id', PapersController.getById);
router.get('/:id/pdf', PapersController.getPdf);

// Protected routes
router.post('/', authenticateJWT, upload.single('file'), PapersController.create);
router.post('/:id/citations', authenticateJWT, requireRole(['faculty', 'admin']), PapersController.addCitation);

export default router;
