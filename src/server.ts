import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import authenticationHandler from './authentication/authentication.handler';
import authenticationRouter from './authentication/authentication.router';

const port = 3000;

class Server {
  public app: Application;

  constructor() {
    this.app = express();
    this.configureMiddlewares();
    this.initializeAuthentication();
    this.configureRoutes();
  }

  public start() {
    this.app.listen(port, () => console.log(`server is listening on port ${port}`));
  }

  private configureMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeAuthentication() {
    this.app.use(authenticationHandler.initialize());
    this.app.use('/auth', authenticationRouter);
  }

  private configureRoutes() {
    this.app.get('/', (req: Request, res: Response) => res.send('home'));
    this.app.all('*', (req: Request, res: Response) => res.send(req.path));
  }
}

const server = new Server();

export default server;
