import { Router, Request, Response } from 'express';
// import { authenticate, handleUser } from './authentication.handler';
import authenticator from './shragaJWTAuthenticator';

const router = Router();

router.get('/login', authenticator.authenticate());
router.get('/user', authenticator.authenticate(), (req: Request, res: Response) => res.send(req.user));
router.post('/callback', authenticator.authenticate({ failureRedirect: '/error' }));

export default router;
