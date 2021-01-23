const rp = require('request-promise')

class RegistryClient {
  constructor(opts) {
    this.registryUrl = opts.registryUrl
    this.options = {}
    this.logger = opts.logger
  }

  async getPackageSetOfDependencies(packageName, version = 'latest') {
    this.options.url = `${this.registryUrl}/${packageName}/${version}`

    let response = await rp(this.options)
    response = JSON.parse(response)

    return this._pickPackageResults(response)
  }

  _pickPackageResults(packageResults) {
    const pickedPackage = {}
    const { version, dependencies } = packageResults

    pickedPackage.version = version

    if (dependencies) {
      pickedPackage.dependencies = dependencies
    }

    return pickedPackage
  }
}

module.exports = { RegistryClient }
