const { RegistryService } = require('./registryService')
const { Healthcheck } = require('./healthcheck')
const { RedisCache } = require('./redisCache')

module.exports = {
  RegistryService,
  Healthcheck,
  RedisCache,
}
