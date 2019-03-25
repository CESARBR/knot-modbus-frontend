import DBus from 'dbus';
import { promisify } from 'util';

const DBUS_SERVICE_NAME = 'org.freedesktop.DBus';
const DBUS_INTERFACE_NAME = 'org.freedesktop.DBus';
const DBUS_OBJECT_PATH = '/org/freedesktop/DBus';
const NAME_OWNER_CHANGED_NAME = 'NameOwnerChanged';

const SERVICE_NAME = 'br.org.cesar.modbus';

class DbusServices {
  constructor(config) {
    process.env.DISPLAY = ':0';
    process.env.DBUS_SESSION_BUS_ADDRESS = config.address; // FIXME: make an address tcp work
    this.bus = DBus.getBus('system');
    this.getInterface = promisify(this.bus.getInterface.bind(this.bus));
  }

  execute() {
    this.getInterface(DBUS_SERVICE_NAME, DBUS_OBJECT_PATH, DBUS_INTERFACE_NAME)
      .then((iface) => {
        console.log('Watching slave service initialization');
        iface.on(NAME_OWNER_CHANGED_NAME, (name, oldOwner, newOwner) => {
          if (name !== SERVICE_NAME) {
            return;
          }

          if (!oldOwner) {
            console.log('Slave service is up');
          } else if (!newOwner) {
            console.log('Slave service is down');
          }
        });
      })
      .catch((err) => {
        // TODO: parse dbus error
        console.error(err);
        throw err;
      });
  }

  list() { // eslint-disable-line class-methods-use-this
  }

  get(id) { // eslint-disable-line no-unused-vars, class-methods-use-this
  }
}

export default DbusServices;
