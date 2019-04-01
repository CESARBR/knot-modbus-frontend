import express from 'express';
import morgan from 'morgan';
import path from 'path';
import config from 'config';
import setupProxy from '../src/setupProxy';
import SlaveService from './SlaveService';

const devServ = new SlaveService(config.get('protocol'), config.get('slave'));
const app = express();

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

setupProxy(app);

app.use(express.static(path.resolve(__dirname, '..', 'build')));

devServ.execute();

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

app.get('/slaves', (req, res) => {
  try {
    res.send(devServ.list());
  } catch (err) {
    res.status(err.code).send(err.message);
  }
});

devServ.onAdded(slave => console.log('callback onAdded:', slave));
devServ.onRemoved(slave => console.log('callback onRemoved:', slave));

app.get('/slave/:id', (req, res) => {
  try {
    res.send(devServ.get(Number(req.params.id)));
  } catch (err) {
    res.status(err.code).send(err.message);
  }
});

app.listen(config.get('server.port'));
