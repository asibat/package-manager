const sinon = require('sinon')
const { find } = require('lodash')
const chai = require('chai')

chai.should()
chai.use(require('sinon-chai'))
chai.use(require('chai-http'))

const { response: registryClientResponse, notFoundResponse } = require('./fixutres/registryClientResponse')
const registryPackageDependencies = require('./fixutres/registryPackageDpendencies.json')

const { app } = require('../app')

const client = app.context.redisClient

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

describe('Packages Controller', function () {
  let sandbox
  before(async function () {
    sandbox = sinon.createSandbox()

    sandbox.stub(app.context.registryClient, 'getPackageSetOfDependencies').value(stubRegistryClientApi)
  })

  after(async () => {
    await client.flush()
    sandbox.restore()
  })

  describe('show', function () {
    it.skip('returns 404 for none published package', async () => {
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
