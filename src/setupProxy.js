const proxy = require('http-proxy-middleware');

module.exports = (app) => {
  const apiHostname = process.env.API_HOSTNAME || process.env.API_HOST || 'localhost';
  const apiPort = process.env.API_PORT || 3003;
  const apiTarget = `http://${apiHostname}:${apiPort}`;

  app.use(proxy('/api', {
    target: apiTarget,
    pathRewrite: { '^/api': '/' }
  }));
};
