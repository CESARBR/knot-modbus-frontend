import DBus from 'dbus';
import { promisify } from 'util';
import _ from 'lodash';

const DBUS_SERVICE_NAME = 'org.freedesktop.DBus';
const DBUS_INTERFACE_NAME = 'org.freedesktop.DBus';
const DBUS_OBJECT_PATH = '/org/freedesktop/DBus';
const NAME_OWNER_CHANGED_NAME = 'NameOwnerChanged';
const OBJECT_MANAGER_INTERFACE_NAME = 'org.freedesktop.DBus.ObjectManager';
const OBJECT_PATH = '/';

const SERVICE_NAME = 'br.org.cesar.modbus';
const SLAVE_INTERFACE_NAME = `${SERVICE_NAME}.Slave1`;

function setKeysToLowerCase(obj) {
  return _.mapKeys(obj, (v, k) => k.toLowerCase());
}

function mapObjectsToSlaves(objects) {
  return _.chain(objects)
    .pickBy(object => _.has(object, SLAVE_INTERFACE_NAME))
    .map(object => setKeysToLowerCase(object[SLAVE_INTERFACE_NAME]))
    .value();
}

function mapObjectsToIdPath(objects) {
  return _.chain(objects)
    .pickBy(object => _.has(object, SLAVE_INTERFACE_NAME))
    .mapValues(iface => _.get(iface[SLAVE_INTERFACE_NAME], 'Id'))
    .invert()
    .value();
}

function mapInterfaceToSlave(iface) {
  return mapObjectsToSlaves([iface])[0];
}

class DbusServices {
  constructor(config) {
    process.env.DISPLAY = ':0';
    process.env.DBUS_SESSION_BUS_ADDRESS = config.address; // FIXME: make an address tcp work
    this.bus = DBus.getBus('system');
    this.getInterface = promisify(this.bus.getInterface.bind(this.bus));
  }

  async loadSlaves() {
    const iface = await this.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE_NAME);
    const getManagedObjects = promisify(iface.GetManagedObjects.bind(iface));
    const objects = await getManagedObjects();
    this.slaves = await mapObjectsToSlaves(objects);
    this.idPathMap = await mapObjectsToIdPath(objects);
  }

  removeSlave(path) {
    const id = Number(_.findKey(this.idPathMap, value => value === path));
    if (id) {
      delete this.idPathMap[id];
      _.remove(this.slaves, slave => slave.id === id);
      if (this.removedCb) {
        this.removedCb(id);
      }
    }
  }

  addSlave(slave, path) {
    if (_.has(this.idPathMap, slave.id)) {
      // Remove old device with same id
      this.removeSlave(this.idPathMap[slave.id]);
    }
    this.idPathMap[slave.id] = path;
    this.slaves = _.concat(this.slaves, slave);
  }

  async startSlaveMonitoring() {
    const iface = await this.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE_NAME);
    await this.loadSlaves();
    iface.on('InterfacesAdded', (objPath, addedInterface) => {
      const slave = mapInterfaceToSlave(addedInterface);
      // The slave can be undefined if the interface added is not DEVICE_INTERFACE
      if (slave) {
        console.log('Slave added:', slave);
        this.addSlave(slave, objPath);
        if (this.addedCb) {
          this.addedCb(slave);
        }
      }
    });
    iface.on('InterfacesRemoved', objPath => this.removeSlave(objPath));

    console.log('Monitoring slaves being added and removed');
  }

  async stopSlaveMonitoring() {
    this.slaves = [];
    this.idPathMap = {};
  }

  execute() {
    this.getInterface(DBUS_SERVICE_NAME, DBUS_OBJECT_PATH, DBUS_INTERFACE_NAME)
      .then(async (iface) => {
        console.log('Watching slave service initialization');
        iface.on(NAME_OWNER_CHANGED_NAME, async (name, oldOwner, newOwner) => {
          if (name !== SERVICE_NAME) {
            return;
          }

          if (!oldOwner) {
            console.log('Slave service is up');
            this.startSlaveMonitoring();
          } else if (!newOwner) {
            console.log('Slave service is down');
            this.stopSlaveMonitoring();
          }
        });

        this.startSlaveMonitoring()
          .catch((err) => {
            // TODO: parse dbus error
            console.error(err);
            throw err;
          });
      })
      .catch((err) => {
        // TODO: parse dbus error
        console.error(err);
        throw err;
      });
  }

  list() {
    return this.slaves;
  }

  get(id) {
    return _.find(this.slaves, { id });
  }
}

export default DbusServices;
