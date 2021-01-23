const router = require('koa-router')()

const packagesController = require('./controllers/packagesController')
const healthcheck = require('./controllers/healthcheck')

router.get('/healthcheck', healthcheck.getHealth)

router.get('/package/:packageName/version/:version', packagesController.show)
router.get('/package/:packageName', packagesController.show)

module.exports = router
