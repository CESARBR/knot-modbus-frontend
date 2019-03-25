import axios from 'axios';

class SlaveService {
  listSlaves() {
    return axios.get('/api/slaves');
  }
}

export default SlaveService;
