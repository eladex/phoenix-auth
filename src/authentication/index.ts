import shragaAuthenticator from './shragaJWTAuthenticator';
import router from './authentication.router';
import { IAuthenticator } from './authenticator.interface';

const authenticator: IAuthenticator = shragaAuthenticator

export {
  authenticator,
  router
}
