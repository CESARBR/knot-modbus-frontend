/* eslint-disable no-console */
import shortid from 'shortid';
import Client from './Client';

class ConnectionHandler {
  constructor(socket, slaveService) {
    this.id = shortid.generate();
    this.slaveService = slaveService;
    this.client = new Client(socket);
  }

  start() {
    this.slaveService.onAdded(slave => this.client.send('slaveAdded', slave));
    this.slaveService.onRemoved(id => this.client.send('slaveRemoved', id));
    this.slaveService.onUpdated((id, properties) => this.client.send('slaveUpdated', { id, properties }));
    this.slaveService.onSourceUpdated((id, addr, properties) => this.client.send('sourceUpdated', { id, addr, properties }));
    this.client.on('message', this.onMessage.bind(this));
    this.client.on('error', err => console.error(err.message));
    this.client.on('close', (code, reason) => {
      console.log(`Disconnected ${this.id}. Code: ${code} Reason: ${reason}`);
    });
    console.log(`Connected ${this.id}`);
  }

  onMessage({ type, data }) {
    let frame;
    try {
      console.log(`Received message ${type} from ${this.id}`);
      switch (type) {
        case 'listSlaves':
          frame = this.buildFrame('slaves', this.slaveService.list());
          break;
        case 'getSlave':
          frame = this.buildFrame('slave', this.slaveService.get(Number(data.id)));
          break;
        case 'listSources':
          frame = this.buildFrame('sources', this.slaveService.listSources(Number(data.id)));
          break;
        default:
          console.error(`Unknown event type '${type}'`);
          break;
      }
    } catch ({ message, code, stack }) {
      console.error(stack);
      frame = this.buildFrame('error', { message, code });
    }
    this.client.send(frame.type, frame.data);
  }

  buildFrame(type, data) {
    return { type, data };
  }
}

export default ConnectionHandler;
