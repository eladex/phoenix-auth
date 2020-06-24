import passport from 'passport';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

const { Strategy: ShragaStrategy } = require('passport-shraga');

const MINUTE = 60; // 60 seconds in minute
const {
  minutesExpires,
  token,
  shragaURL,
  secret
} = config.authentication;

function initialize() {
  passport.use(new ShragaStrategy({ shragaURL }, (profile: any, done: any) => {
    done(null, profile);
  }));
  return passport.initialize();
}

function handleUser(req: Request, res: Response) {
  const iat = Date.now() / 1000;
  const exp = iat + minutesExpires * MINUTE;

  const { RelayState, ...user } = req.user as any;
  const userToken: any = { ...user, iat, exp };

  const redirectTo = RelayState || config.clientEndpoint;

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
