const chai = require('chai')

chai.should()
chai.use(require('chai-http'))

describe('healthcheck', function () {
  it('returns healthy state', async function () {
    const res = await chai.request('http://localhost:8000').get('/healthcheck')

    res.ok.should.be.true
  })
})
