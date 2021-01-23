async function getHealth(ctx) {
  ctx.logger.info('healthcheck.started')

  const isHealthy = await ctx.healthcheck.run()

  if (!isHealthy) {
    ctx.logger.error('healthcheck.failed')

    ctx.body = 'Redis is not here!'
    ctx.status = 500
    return
  }
  ctx.logger.info('healthcheck.success')
  ctx.body = 'up'
}

module.exports = {
  getHealth,
}
