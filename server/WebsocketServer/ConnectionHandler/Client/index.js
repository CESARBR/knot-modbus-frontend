import _ from 'lodash';

class Client {
  constructor(socket) {
    this.socket = socket;
    this.listeners = {
      message: _.noop(),
      error: _.noop()
    };

    this.socket.on('message', this.onMessage.bind(this));
    this.socket.on('error', this.onError.bind(this));
  }

  async send(type, data) {
    const frame = this.fromEvent(type, data);
    return new Promise((resolve, reject) => {
      this.socket.send(frame, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  on(type, listener) {
    if (type === 'message' || type === 'error') {
      this.listeners[type] = listener;
    } else {
      this.socket.on(type, listener);
    }
  }

  async onMessage(frame) {
    try {
      const event = this.clientMessageToEvent(frame);
      await this.listeners.message(event);
    } catch (error) {
      await this.onError(error);
    }
  }

  async onError(error) {
    await this.listeners.error(error);
  }

  fromEvent(type, data) {
    return JSON.stringify({ type, data });
  }

  clientMessageToEvent(frame) {
    const event = JSON.parse(frame);
    if (!event.type) {
      const err = new Error('Invalid frame');
      err.frame = frame;
      throw err;
    }
    return event;
  }
}

export default Client;
