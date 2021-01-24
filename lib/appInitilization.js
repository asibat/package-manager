const redis = require('redis')
const { promisifyAll } = require('bluebird')
const { transports } = require('winston')
const { merge } = require('lodash')

const { RedisCache, Healthcheck, RegistryService } = require('../services')
const { RegistryClient } = require('../clients/registryClient')

const { logger } = require('./logger')
const config = require('../config/config')

const defaultConfig = config.development
const environment = process.env.NODE_ENV || defaultConfig
const environmentConfig = config[environment]
const finalConfig = merge(defaultConfig, environmentConfig)

const HOST = finalConfig.redis.host
const PORT = finalConfig.redis.port

function initApp(app) {
  promisifyAll(redis)
  const client = redis.createClient(PORT, HOST)

  client.on('error', (error) => {
    logger.error('Redis connection error!')
    throw error
  })

  client.on('connect', () => {
    logger.info('Redis Connected!')
  })

  const registryUrl = finalConfig.registryUrl
  const registryClient = new RegistryClient({ registryUrl, logger })
  const redisClient = new RedisCache(client)
  const healthcheck = new Healthcheck(client)
  const registryService = new RegistryService({ registryClient, redisClient, logger })

  app.context.logger = logger
  app.context.registryService = registryService
  app.context.redisClient = redisClient
  app.context.registryClient = registryClient
  app.context.healthcheck = healthcheck

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console())
  }
}

module.exports = {
  initApp,
}
