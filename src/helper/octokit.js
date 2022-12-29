import { Octokit } from 'octokit'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { Gauge } from 'prom-client'

import { token } from '../configs.js'

const rateLimitGauge = new Gauge({
  name: 'github_rate_limit_remaining',
  help: 'API rate limit remaining (reset every 60 minutes)',
})

const CustomOctokit = Octokit.plugin(restEndpointMethods)
const octokit = new CustomOctokit({ auth: token })

octokit.hook.after('request', async (response, options) => {
  rateLimitGauge.set(+response.headers['x-ratelimit-remaining'])
})

octokit.hook.error('request', async (error, options) => {
  // Replace {param} in url with options['param']
  const url = options.url
    .split('/')
    .map((v) => options[v.replace(/[{}]/g, '')] || v)
    .join('/')

  console.log(`${error.toString()} - ${options.method} ${url} `)

  // No need to handle
  // throw error
})

export default octokit
