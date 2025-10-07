import express from 'express';
import { getFooter, saveFooter } from '../controllers/footer.controller';

const router = express.Router();
router.get('/:userId/:templateId', getFooter);
router.put('/:userId/:templateId', saveFooter);
export default router;
