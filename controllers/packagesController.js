async function show(ctx) {
  const { packageName, version } = ctx.request.params

  try {
    ctx.body = await ctx.registryService.mapPackageDependencies(packageName, version)
  } catch (error) {
    if (error.hasOwnProperty('statusCode')) {
      ctx.logger.warn(`packagesController.show.packageDependencies.Failed.NotFound - ${error}`)
      ctx.body = error.message
      ctx.status = 404
      return
    }
    ctx.logger.error(`packagesController.show.packageDependencies.Failed - ${error}`)
    ctx.body = error.message
    ctx.status = 500
  }
}

module.exports = {
  show,
}
