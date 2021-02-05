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
      this.logger.warn(`registryService.get.package.failed - ${error.message} - ${packageName}`)
      if ([404, 405].includes(error.statusCode)) {
        return []
      }
      throw error
    }
  }

  async mapPackageDependencies(packageName, parentPackages = [], packageVersion = 'latest') {
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
        const dependencyParents = [...parentPackages, packageName]
        if (this.isCircularDependency(dependencyPackageName, dependencyParents)) {
          this.logger.error(
            `registryService.mapping.package.failed.CircularDependency - ${dependencyPackageName} - ${dependencyParents}`
          )
          return
        }
        return this.mapPackageDependencies(dependencyPackageName, dependencyParents, dependencyPackageVersion)
      },
      {
        concurrency: MAPPING_CONCURRENCY,
      }
    )
    return result
  }

  isCircularDependency(packageName, packageParents) {
    return packageParents.includes(packageName)
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
