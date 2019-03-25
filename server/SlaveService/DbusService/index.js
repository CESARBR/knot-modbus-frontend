import DBus from 'dbus';
import { promisify } from 'util';

const DBUS_SERVICE_NAME = 'org.freedesktop.DBus';
const DBUS_INTERFACE_NAME = 'org.freedesktop.DBus';
const DBUS_OBJECT_PATH = '/org/freedesktop/DBus';
const NAME_OWNER_CHANGED_NAME = 'NameOwnerChanged';
const OBJECT_MANAGER_INTERFACE_NAME = 'org.freedesktop.DBus.ObjectManager';
const OBJECT_PATH = '/';

const SERVICE_NAME = 'br.org.cesar.modbus';

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
    return getManagedObjects();
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
            this.slaves = await this.loadSlaves();
          } else if (!newOwner) {
            console.log('Slave service is down');
          }
        });
        this.slaves = await this.loadSlaves();
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

  get(id) { // eslint-disable-line no-unused-vars, class-methods-use-this
  }
}

export default DbusServices;
