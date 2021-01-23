const bluebird = require('bluebird')
const { formatRegistryPackageVersion } = require('../helpers')

const MAPPING_CONCURRENCY = 5

class RegistryService {
  constructor(opts) {
    this.registryClient = opts.registryClient
    this.cache = opts.redisClient
    this.logger = opts.logger
  }

  async getPackage(packageName, version = 'latest') {
    let packageDependencies
    const cachePackageKey = `${packageName}-${version}`

    try {
      let registryPackage = await this.cache.get(cachePackageKey)

      if (registryPackage) return registryPackage

      packageDependencies = await this.registryClient.getPackageSetOfDependencies(packageName, version)

      await this.cache.set(cachePackageKey, packageDependencies)
      return packageDependencies
    } catch (error) {
      this.logger.warn(`registryService.get.package.failed - ${error.message}`)
      throw error
    }
  }

  async mapPackageDependencies(packageName, packageVersion = 'latest') {
    const result = {
      name: packageName,
    }
    const response = await this.getPackage(packageName, packageVersion)

    const { dependencies, version } = response
    result.version = version

    if (!dependencies) return result

    result.dependencies = await bluebird.map(
      Object.entries(dependencies),
      async (dependency) => {
        const { dependencyPackageName, dependencyPackageVersion } = this._extractDependencyNameAndVersion(dependency)

        return await this.mapPackageDependencies(dependencyPackageName, dependencyPackageVersion)
      },
      {
        concurrency: MAPPING_CONCURRENCY,
      }
    )
    return result
  }

  _extractDependencyNameAndVersion(dependency) {
    const dependencyPackageName = dependency[0]
    let dependencyPackageVersion = dependency[1]

    dependencyPackageVersion = formatRegistryPackageVersion(dependencyPackageVersion)

    return {
      dependencyPackageName,
      dependencyPackageVersion,
    }
  }
}

module.exports = { RegistryService }
