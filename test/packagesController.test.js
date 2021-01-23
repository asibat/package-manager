const sinon = require('sinon')
const redis = require('redis-mock')
const { find } = require('lodash')
const chai = require('chai')

chai.should()
chai.use(require('sinon-chai'))
chai.use(require('chai-http'))

const { response: registryClientResponse, notFoundResponse } = require('./fixutres/registryClientResponse')
const registryPackageDependencies = require('./fixutres/registryPackageDpendencies.json')
const cachedPackagesKeys = require('./fixutres/cachedPackagesKeys')

const { app } = require('../app')
const config = require('../config/config.json').test

const HOST = config.redis.host
const PORT = config.redis.port

const stubRegistryClientApi = (packageName, version) => {
  let registryPackage
  if (version === 'latest') {
    registryPackage = find(registryClientResponse, { name: packageName, isLatest: true })
  } else {
    registryPackage = find(registryClientResponse, { name: packageName, version })
  }

  if (!registryPackage) {
    throw notFoundResponse
  }
  return registryPackage
}

const deleteTestPackages = async (packagesKeys) => {
  const client = app.context.redisClient
  for (const packageKey of packagesKeys) {
    await client.del(packageKey)
  }
}

describe('Packages Controller', function () {
  let sandbox
  before(async function () {
    sandbox = sinon.createSandbox()

    const client = redis.createClient(PORT, HOST)

    sandbox.stub(app.context, 'redisClient').value(client)
    sandbox.stub(app.context.registryClient, 'getPackageSetOfDependencies').value(stubRegistryClientApi)
  })

  after(async () => {
    await deleteTestPackages(cachedPackagesKeys)
    sandbox.restore()
  })

  describe('show', function () {
    it('returns 404 for none published package', async () => {
      const packageName = 'koadmoiamd'
      const packageVersion = '100.100.100'

      const res = await chai.request('http://localhost:8000').get(`/package/${packageName}/version/${packageVersion}`)
      res.status.should.eql(404)
    })
    it('returns package with specific version', async () => {
      const packageName = registryClientResponse[0].name
      const packageVersion = registryClientResponse[0].version

      const res = await chai.request('http://localhost:8000').get(`/package/${packageName}/version/${packageVersion}`)
      res.status.should.eql(200)
      res.body.should.eql(registryPackageDependencies)
    })
    it('returns package with latest version if no version was specified', async () => {
      const packageName = 'acceptss'

      const res = await chai.request('http://localhost:8000').get(`/package/${packageName}`)
      res.status.should.eql(200)
      res.body.should.eql(registryPackageDependencies)
    })
  })
})
