/* eslint-disable no-console */
import http from 'http';
import Websocket from 'ws';
import ConnectionHandler from './ConnectionHandler';

class WebsocketServer {
  constructor(port, slaveService) {
    this.port = port;
    this.slaveService = slaveService;
  }

  async start() {
    const server = http.createServer();
    server.on('request', this.healthcheck.bind(this));

    const wss = new Websocket.Server({ server });
    wss.on('connection', (socket) => {
      try {
        const connectionHandler = new ConnectionHandler(socket, this.slaveService);
        connectionHandler.start();
      } catch (err) {
        console.error(`Failed to start connection handler: ${err.message}`);
        socket.close();
      }
    });
    wss.on('close', () => console.log('Closed'));
    wss.on('error', err => console.error(err));

    return new Promise((resolve) => {
      server.listen(this.port, () => {
        console.log(`Listening on port ${this.port}`);
        resolve();
      });
    });
  }

  healthcheck(req, res) {
    if (req.url === '/healthcheck') {
      res.writeHead(200);
      res.write(JSON.stringify({ online: true }));
      res.end();
      return;
    }

    res.writeHead(404);
    res.end();
  }
}

export default WebsocketServer;
