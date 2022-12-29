import { Gauge } from 'prom-client'

import octokit from '../helper/octokit.js'
import { runner } from '../configs.js'

const runnerGauge = new Gauge({
  name: 'github_runner_status',
  help: 'Runner status (0=offine, 1=online, 2=running)',
  labelNames: ['id', 'name', 'os'],
})

const fetchRunners = async () => {
  const { enabled, org } = runner
  if (enabled) {
    const { data: { runners = [] } = {} } = await octokit.rest.actions.listSelfHostedRunnersForOrg({
      org,
    })

    runners.forEach(({ id, name, os, status, busy }) => {
      runnerGauge.set({ id, name, os }, busy ? 2 : status === 'online' ? 1 : 0)
    })
  }
}

export default fetchRunners
