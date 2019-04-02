import axios from 'axios';

class SlaveService {
  // TODO: change here to use websockets
  listSlaves() {
    return axios.get('/api/slaves');
  }
  // TODO: listen to events: slaveAdded, slaveRemoved and SlaveUpdated
}

export default SlaveService;
