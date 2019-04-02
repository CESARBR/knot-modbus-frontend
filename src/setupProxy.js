const proxy = require('http-proxy-middleware');
const config = require('config');

module.exports = (app) => {
  const wsHostname = config.get('server.host');
  const wsPort = config.get('server.port');
  const wsTarget = `ws://${wsHostname}:${wsPort}`;

  app.use(proxy('/ws', {
    target: wsTarget,
    ws: true
  }));
};
