import express, { Application } from 'express';

const port = 3000;

class Server {
  public app: Application;

  constructor() {
    this.app = express();
  }

  public start() {
    this.app.listen(port, () => console.log(`server is listening on port ${port}`));
  }
}

const server = new Server();

export default server;
