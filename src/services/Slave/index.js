import WebSocket from 'isomorphic-ws';
import EventEmitter from 'eventemitter3';

const PROXY_EVENTS = ['close', 'error', 'unexpected-response', 'ping', 'pong', 'open'];

class SlaveService extends EventEmitter {
  constructor() {
    super();
    if (this.socket) {
      this.socket.close();
    }
    const { hostname } = window.location;
    const port = window.location.protocol === 'https:' ? 443 : 3004;
    this.socket = new WebSocket(`ws://${hostname}:${port}/ws`);
    this.socket.addEventListener('message', this.handleMessage.bind(this));
    const onOpen = () => {
      this.isOpen = true;
      this.socket.removeEventListener('open', onOpen);
    };
    this.socket.addEventListener('open', onOpen);
    this.socket.addEventListener('close', () => {
      this.isOpen = false;
      // TODO: handle reconnection if is an abnormal closure
      this.socket.close();
    });
    PROXY_EVENTS.forEach((eventName) => {
      this.socket.addEventListener(eventName, event => this.emit(eventName, event));
    });
  }

  handleMessage(event) {
    const { type, data } = JSON.parse(event.data);
    this.emit(type, data);
  }

  buildFrame(type, data) {
    return JSON.stringify({ type, data });
  }

  async listSlaves() {
    return new Promise((resolve, reject) => {
      if (this.isOpen) {
        this.socket.send(this.buildFrame('listSlaves'));
        this.once('slaves', slaves => resolve(slaves));
        this.once('error', err => reject(err));
        return;
      }
      reject(new Error('Connection is no opened'));
    });
  }
  // TODO: listen to events: slaveAdded, slaveRemoved and SlaveUpdated
}

export default SlaveService;
