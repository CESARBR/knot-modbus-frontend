import express from 'express';
import morgan from 'morgan';
import path from 'path';
import config from 'config';
import setupProxy from '../src/setupProxy';
import SlaveService from './SlaveService';
import WebsocketServer from './WebsocketServer';

const slaveServ = new SlaveService(config.get('protocol'), config.get('slave'));
const wss = new WebsocketServer(config.get('server.port'), slaveServ);
const app = express();

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

setupProxy(app);

app.use(express.static(path.resolve(__dirname, '..', 'build')));

slaveServ.execute();

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

wss.start();
