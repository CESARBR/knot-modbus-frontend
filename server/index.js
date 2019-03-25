import SlaveService from './SlaveService';

const devServ = new SlaveService('DBUS', { address: 'tcp:host=localhost,port=55556' });
devServ.execute();
