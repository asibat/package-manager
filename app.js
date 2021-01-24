const Koa = require('koa')
const koaBody = require('koa-body')
const responseTime = require('koa-response-time')

const router = require('./routes')
const { logger } = require('./lib/logger')
const { initApp } = require('./lib/appInitilization')

const app = new Koa()
app.use(responseTime({}))
app.use(koaBody())

//Error handling
app.use(async function (ctx, next) {
  try {
    await next()
  } catch (err) {
    ctx.app.emit('error', err, ctx)
  }
})
initApp(app)
// Load the router into the Koa app
app.use(router.routes())
app.use(router.allowedMethods())

// Start server
const port = 8000
app.listen(port, function () {
  logger.info(`Server listening on ${port}`)
})

module.exports = {
  app,
}
