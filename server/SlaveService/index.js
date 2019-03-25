import DbusService from './DbusService';

class SlaveService {
  constructor(protocol, config) {
    switch (protocol) {
      case 'DBUS':
        this.service = new DbusService(config);
        break;
      default:
        break;
    }
  }

  execute() {
    this.service.execute();
  }

  list() { // eslint-disable-line class-methods-use-this
  }

  get(id) { // eslint-disable-line no-unused-vars, class-methods-use-this
  }
}

export default SlaveService;
