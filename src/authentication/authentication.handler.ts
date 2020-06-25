import passport from 'passport';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

const { Strategy: ShragaStrategy } = require('passport-shraga');

const MINUTE = 60; // 60 seconds in minute
const {
  minutesExpires,
  token: tokenCookie,
  shragaURL,
  secret
} = config.authentication;

/**
 * initializes the passport strategy
 * returns the `passport.initialize()` middleware which must be called 
 * at the start of connect or express based apps.
 * `app.use(initialize())`
 */
export function initialize() {
  passport.use(new ShragaStrategy({ shragaURL }, (profile: any, done: any) => {
    done(null, profile);
  }));
  return passport.initialize();
}

/**
 * Middleware to handle the user after successful authentication.
 * signs a token, responds with `set-cookie`and then redirects the 
 * user.
 * @param req express Request
 * @param res express Response
 */
export function handleUser(req: Request, res: Response) {
  // issued at and expires
  const iat = Date.now() / 1000;
  const exp = iat + minutesExpires * MINUTE;

  const { RelayState, ...user } = req.user as any;
  // generate the token
  const token = jwt.sign({ ...user, iat, exp }, secret);

  const redirectTo = RelayState || config.clientEndpoint;

  res.cookie(tokenCookie, token);
  res.redirect(redirectTo);
}

/**
 * Returns a middleware that uses the strategy to authenticate the user.
 * should be used on routes to trigger a login and on the callback routes (idp callback)
 */
export function authenticate() {
  return passport.authenticate('shraga', { session: false });
}

export default {
  authenticate,
  initialize,
  handleUser,
};
