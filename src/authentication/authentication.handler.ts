import passport from 'passport';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const { Strategy: ShragaStrategy } = require('passport-shraga');

const shragaURL = 'http://13.79.7.3';
const useEnrichId = true;
const token = 'phxToken';
const expiresInSeconds = 120;
const clientEndpoint = '/';
const secret = 'nitrooo';

function initialize() {
  passport.use(new ShragaStrategy({ shragaURL, useEnrichId }, (profile: any, done: any) => {
    done(null, profile);
  }));
  return passport.initialize();
}

function handleUser(req: Request, res: Response) {
  const iat = Date.now()/1000;
  const exp = iat + expiresInSeconds;

  const { RelayState, ...user } = req.user as any;
  const userToken: any = { ...user, iat, exp };

  const redirectTo = RelayState || clientEndpoint;

  const signedToken = jwt.sign(userToken, secret);
  res.cookie(token, signedToken);
  res.redirect(redirectTo);
}

function authenticate() {
  return passport.authenticate('shraga', { session: false });
}

export default {
  authenticate,
  initialize,
  handleUser,
};
