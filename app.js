const Koa = require('koa')
const koaBody = require('koa-body')
const responseTime = require('koa-response-time')
const redis = require('redis')
const { promisifyAll } = require('bluebird')

const { transports } = require('winston')
const { merge } = require('lodash')

const router = require('./routes')
const config = require('./config/config')
const { logger } = require('./logger')

const { RedisCache, Healthcheck, RegistryService } = require('./services')
const { RegistryClient } = require('./clients/registryClient')

const defaultConfig = config.development
const environment = process.env.NODE_ENV || defaultConfig
const environmentConfig = config[environment]
const finalConfig = merge(defaultConfig, environmentConfig)

const HOST = finalConfig.redis.host
const PORT = finalConfig.redis.port

const app = new Koa()
app.use(responseTime({}))

promisifyAll(redis)
const client = redis.createClient(process.env.REDIS_URL || { port: PORT, host: HOST })

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

app.use(koaBody())

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console())
}
//Error handling
app.use(async function (ctx, next) {
  try {
    await next()
  } catch (err) {
    ctx.app.emit('error', err, ctx)
  }
})

// Load the router into the Koa app
app.use(router.routes())
app.use(router.allowedMethods())

app.context.logger = logger
app.context.registryService = registryService
app.context.redisClient = redisClient
app.context.registryClient = registryClient
app.context.healthcheck = healthcheck

// Start server
const port = 8000
app.listen(port, function () {
  logger.info(`Server listening on ${port}`)
})

module.exports = {
  app,
}
