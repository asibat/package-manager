const response = [
  {
    name: 'acceptss',
    version: '100.100.100',
    isLatest: true,
    dependencies: {
      'mime-types': '200.200.200',
      negotiator: '300.300.300',
    },
  },
  {
    name: 'mime-types',
    version: '200.200.200',
    dependencies: {
      'mime-db': '400.400.400',
    },
  },
  {
    name: 'negotiator',
    version: '300.300.300',
  },
  {
    name: 'mime-db',
    version: '400.400.400',
  },
]

const notFoundResponse = {
  statusCode: 404,
  message: 'Not Found',
}

module.exports = {
  response,
  notFoundResponse,
}
