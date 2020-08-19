import { Request, Response, NextFunction, RequestHandler } from 'express'

export interface IAuthenticator {
  authenticate(opts?: AuthenticateOptions): RequestHandler
}

export type AuthenticateOptions = {
  successRedirect?: string,
  redirectToOriginalRoute?: boolean,
  failureRedirect?: string,
}
