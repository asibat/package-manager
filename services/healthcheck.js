class Healthcheck {
  constructor(client) {
    this.client = client
  }

  async run() {
    return await this.client.ping()
  }
}

module.exports = { Healthcheck }
