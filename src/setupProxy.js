const proxy = require('http-proxy-middleware');
const config = require('config');

module.exports = (app) => {
  const apiHostname = config.get('server.host');
  const apiPort = config.get('server.port');
  const apiTarget = `http://${apiHostname}:${apiPort}`;

  app.use(proxy('/api', {
    target: apiTarget,
    pathRewrite: { '^/api': '/' }
  }));
};
