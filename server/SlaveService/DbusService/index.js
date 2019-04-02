/* eslint-disable no-console */
import DBus from 'dbus';
import { promisify } from 'util';
import _ from 'lodash';

const DBUS_SERVICE_NAME = 'org.freedesktop.DBus';
const DBUS_INTERFACE_NAME = 'org.freedesktop.DBus';
const DBUS_OBJECT_PATH = '/org/freedesktop/DBus';
const NAME_OWNER_CHANGED_NAME = 'NameOwnerChanged';
const OBJECT_MANAGER_INTERFACE_NAME = `${DBUS_SERVICE_NAME}.ObjectManager`;
const PROPERTIES_INTERFACE_NAME = `${DBUS_SERVICE_NAME}.Properties`;
const OBJECT_PATH = '/';

const SERVICE_NAME = 'br.org.cesar.modbus';
const SLAVE_INTERFACE_NAME = `${SERVICE_NAME}.Slave1`;

const INVALID_ARGUMENTS = `${SERVICE_NAME}.InvalidArgs`;

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

function parseDbusError(err) {
  let code;
  switch (err.dbusName) {
    case INVALID_ARGUMENTS:
      code = 400;
      break;
    default:
      code = 500;
      break;
  }
  err.code = code;
  return err;
}

class DbusServices {
  constructor(config) {
    process.env.DISPLAY = ':0';
    if (config.address) {
      process.env.DBUS_SYSTEM_BUS_ADDRESS = config.address;
    }
    this.bus = DBus.getBus('system');
    this.getInterface = promisify(this.bus.getInterface.bind(this.bus));
    this.slaves = [];
    this.idPathMap = {};
    this.started = false;
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

  async monitorSlaveProperties(slave, objPath) {
    const iface = await this.getInterface(SERVICE_NAME, objPath, PROPERTIES_INTERFACE_NAME);
    iface.on('PropertiesChanged', (changedInterface, properties) => {
      if (changedInterface === SLAVE_INTERFACE_NAME) {
        const changedProperties = setKeysToLowerCase(properties);
        console.log(`Changes to slave ${slave.id}: ${JSON.stringify(changedProperties)}`);
        _.merge(slave, changedProperties);
        if (this.updatedCb) {
          this.updatedCb(slave.id, changedProperties);
        }
      }
    });
    console.log(`Monitoring slave ${slave.id} properties`);
  }

  async startSlaveMonitoring() {
    const iface = await this.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE_NAME);
    await this.loadSlaves();
    this.slaves.forEach(slave => this.monitorSlaveProperties(slave, this.idPathMap[slave.id]));

    iface.on('InterfacesAdded', async (objPath, addedInterface) => {
      const slave = mapInterfaceToSlave(addedInterface);
      // The slave can be undefined if the interface added is not DEVICE_INTERFACE
      if (slave) {
        console.log('Slave added:', slave);
        this.addSlave(slave, objPath);
        await this.monitorSlaveProperties(slave, objPath);
        if (this.addedCb) {
          this.addedCb(slave);
        }
      }
    });
    iface.on('InterfacesRemoved', objPath => this.removeSlave(objPath));

    console.log('Monitoring slaves being added and removed');
    this.started = true;
  }

  async stopSlaveMonitoring() {
    this.slaves = [];
    this.idPathMap = {};
    this.started = false;
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
            console.error(err);
            throw parseDbusError(err);
          });
      })
      .catch((err) => {
        console.error(err);
        throw parseDbusError(err);
      });
  }

  list() {
    if (!this.started) {
      const err = new Error('DBus service is unavailable');
      err.code = 503;
      throw err;
    }
    return this.slaves;
  }

  get(id) {
    const slave = _.find(this.slaves, { id });
    if (!slave) {
      const error = new Error(`Not found slave ${id}`);
      error.code = 404;
      throw error;
    }
    return slave;
  }
}

export default DbusServices;
