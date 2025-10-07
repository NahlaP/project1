// import express from 'express';
// import { getContactInfo, saveContactInfo } from '../controllers/contact.controller';

// const router = express.Router();

// router.get('/:userId/:templateId', getContactInfo);
// router.put('/:userId/:templateId', saveContactInfo);

// export default router;




import express from 'express';
import { getContactInfo, saveContactInfo } from '../controllers/contact.controller';

const router = express.Router();

// mount this at: app.use('/api/contact-info', router);
router.get('/:userId/:templateId', getContactInfo);
router.put('/:userId/:templateId', saveContactInfo);

export default router;


