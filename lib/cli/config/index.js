const envConfig    = require('./env/' + (process.env.NODE_ENV || 'production') + '.json');
const commonConfig = require('./configuration.json');

module.exports = Object.assign({}, commonConfig, envConfig);