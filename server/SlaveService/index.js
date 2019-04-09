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

  list() {
    return this.service.list();
  }

  get(id) {
    return this.service.get(id);
  }

  listSources(id) {
    return this.service.listSources(id);
  }

  onAdded(addedCb) {
    this.service.addedCb = addedCb;
  }

  onRemoved(removedCb) {
    this.service.removedCb = removedCb;
  }

  onUpdated(updatedCb) {
    this.service.updatedCb = updatedCb;
  }
}

export default SlaveService;
