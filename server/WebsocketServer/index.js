import http from 'http';
import Websocket from 'ws';

class WebsocketServer {
  constructor(port) {
    this.port = port;
  }

  async start() {
    const server = http.createServer();
    server.on('request', this.healthcheck.bind(this));

    const wss = new Websocket.Server({ server });
    wss.on('connection', (socket) => {
      this.socket = socket;
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
