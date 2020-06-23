import { Router } from 'express';
import authHandler from './authentication.handler';

const router = Router();

router.get('/login', authHandler.authenticate());
router.post('/callback', authHandler.authenticate(), authHandler.handleUser);

export default router;
