import { Router } from 'express';
import { authenticate, handleUser } from './authentication.handler';

const router = Router();

router.get('/login', authenticate());
router.post('/callback', authenticate(), handleUser);

export default router;
