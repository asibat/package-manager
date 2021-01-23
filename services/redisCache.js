const redis = require('redis')
const { promisifyAll } = require('bluebird')
const { isString } = require('lodash')

const config = require('../config/config.json')

const currentConfigEnv = config[process.env.NODE_ENV || 'development']
const redisConfig = currentConfigEnv.redis

const defaultTtl = 86400

class RedisCache {
  constructor(client) {
    this._client = client
  }
  get client() {
    const HOST = redisConfig.host
    const PORT = redisConfig.port
    if (!this._client) {
      promisifyAll(redis)
      this._client = redis.createClient(PORT, HOST)
    }

    return this._client
  }

  async set(key, value, ttl = defaultTtl) {
    const redisValue = value && !isString(value) ? JSON.stringify(value) : value
    return await this.client.setAsync(key, redisValue, 'EX', ttl)
  }

  async get(key) {
    const data = await this.client.getAsync(key)
    try {
      return JSON.parse(data)
    } catch (e) {
      return data
    }
  }

  async del(key) {
    return await this.client.delAsync(key)
  }

  async ttl(key) {
    return await this.client.ttlAsync(key)
  }

  async flush() {
    return await this.client.flushallAsync()
  }
}

module.exports = { RedisCache }
