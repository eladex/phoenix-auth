import { IAuthenticator, AuthenticateOptions } from './authenticator.interface';
import { Request, Response, NextFunction, RequestHandler } from 'express'
import jwt from 'jsonwebtoken';
import passport from 'passport';
const { Strategy: ShragaStrategy } = require('passport-shraga');
import config from '../config';
import { dateFromNumericDate } from '../utils/utils';

export type ShragaAuthenticatorConfig = {
  cookieName: string,
  cookieExpiresMinutes: number,
  cookieSecret: string | Buffer,
  callbackURL: string,
  shragaURL: string,
}

const algorithm = 'HS256';
const strategyName = 'shraga';
const MINUTE = 60;
const defaultSuccessRedirect = config.clientEndpoint;

class ShragaJWTAuthenticator implements IAuthenticator {

  private config: ShragaAuthenticatorConfig;

  constructor(config: ShragaAuthenticatorConfig) {
    this.config = { ...config };
    const { shragaURL, callbackURL } = this.config;
    // configure sharaga strategy
    passport.use(strategyName, new ShragaStrategy({ shragaURL, callbackURL, useEnrichId: true }, 
      (profile: any, done: any) => {
      done(null, profile);
    }));
  }

  private async verifyJWT(token: string): Promise<{err: any, result: any}> {
    const { cookieSecret } = this.config;
    return new Promise((resolve, reject) => {
      jwt.verify(token, cookieSecret, { algorithms: [algorithm] }, (err, decoded) => {
        return resolve({err, result: decoded});
      })
    });
  }

  private signJWT(payload: object): string {
    const { cookieSecret } = this.config;
    // generate the token
    const token = jwt.sign({ ...payload }, cookieSecret, { algorithm });
    return token;
  }

  private generate_iat_and_expires() {
    const { cookieExpiresMinutes } = this.config;
    const iat = Date.now() / 1000;
    const exp = iat + cookieExpiresMinutes * MINUTE;
    return { iat, exp };
  }

  /**
   * Authenticate a user with the passport-shraga strategy.
   * handles the strategy callback: responds with a signed cookie 
   * upon success and with an error / redirect when authentication fails.
   * @param req 
   * @param res 
   * @param next 
   * @param opts 
   */
  private _authenticate(
    req: Request, 
    res: Response, 
    next: NextFunction, 
    opts: AuthenticateOptions
  ) {
    const { successRedirect, failureRedirect, redirectToOriginalRoute } = opts;
    // make passport-shraga remember the original route via 'relayState'
    if (redirectToOriginalRoute) {
      req.query.RelayState = req.path;
    }
    return passport.authenticate(strategyName, { session: false }, 
      (err, user, info) => {
        // handle failure
        if (!user || err) {
          if(failureRedirect) {
            return res.redirect(failureRedirect);
          }
          return res.status(401).send('unauthorized');
        }
        // successfull authentication: sign token, send cookie and redirect
        const { RelayState, ...tokenPayload } = user;
        const { iat, exp } = this.generate_iat_and_expires();
        const signedToken = this.signJWT({ ...tokenPayload, iat, exp });
        res.cookie(cookieName, signedToken, { 
          expires: dateFromNumericDate(exp),
          httpOnly: true,
        });
        const redirectTo = RelayState || successRedirect || defaultSuccessRedirect;
        return res.redirect(redirectTo);
    })(req, res, next);
  }

  /**
   * Returns an express middleware to handle authnetication flow.
   * use it before routes that requires authentication: 
   * `
   * app.use('/protected', authenticator.authenticate(opts))
   * `
   * @param opts 
   */
  public authenticate(opts: AuthenticateOptions = {}) {
    const { cookieName } = this.config;
    return async (req: Request, res: Response, next: NextFunction) => {
      // retrieve token and verify
      const cookie = req.cookies[cookieName];
      const { err, result } = await this.verifyJWT(cookie);
      // verification success: set the user on the `req` object and continue
      if (!!cookie && !err) {
        req.user = result;
        return next();
      }
      // verification fail:
      // perform shraga authentication
      return this._authenticate(req, res, next, opts);
    }
  }
}

const {
  minutesExpires: cookieExpiresMinutes,
  secret: cookieSecret,
  token: cookieName,
  shragaURL,
  callbackURL
} = config.authentication;

const authenticator = new ShragaJWTAuthenticator({
  shragaURL,
  cookieExpiresMinutes,
  cookieSecret,
  cookieName,
  callbackURL,
});

export default authenticator;