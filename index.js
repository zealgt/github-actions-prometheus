import express from 'express'
import { register } from 'prom-client'

import fetchRunners from './src/metrics/fetchRunners.js'
import fetchWorkflows from './src/metrics/fetchWorkflows.js'
import { token, scrape_interval, port } from './src/config.js'

const PORT = port || 9988

if (!token) {
  console.error('Missing `token` value, please check config.yml file')
  process.exit()
}

const scrapeData = () => {
  fetchRunners()
  fetchWorkflows()
}

setInterval(scrapeData, (scrape_interval || 15) * 1000)
scrapeData()

const server = express()

server.get('/', (req, res) => {
  res.send('Welcome to Github workflow exporter for Prometheus')
})

server.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  } catch (ex) {
    res.status(500).end(ex)
  }
})

server.listen(PORT, () => {
  console.log(`Server listening to ${PORT}, metrics exposed on /metrics`)
})

// const getAllRepo = async () => {
//   const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
//     org: GITHUB_ORG,
//   })

//   return repos
// }
