import { Gauge } from 'prom-client'

import octokit from '../helper/octokit.js'
import { workflow } from '../configs.js'

const mapStatus = {
  queued: 1,
  in_progress: 2,
  cancelled: 3,
  failure: 4,
  success: 5,
}

const workflowGauge = new Gauge({
  name: 'github_workflow_status',
  help: 'Latest workflow status for each repository (0=unknown, 1=queued, 2=in_progress, 3=cancelled, 4=failure, 5=success)',
  labelNames: ['name', 'repo_name', 'workflow_name'],
})

const getWorkflowStatus = (status, conclusion) => {
  if (!conclusion) {
    return mapStatus[status] || 0
  } else {
    return mapStatus[conclusion] || 0
  }
}

const fetchWorkflows = async () => {
  const { enabled, owner, list = [] } = workflow
  if (enabled) {
    const fecthList = list.map((v) =>
      octokit.rest.actions.listWorkflowRunsForRepo({
        owner: v.owner || owner,
        repo: v.repo,
        per_page: 1,
      })
    )

    const reponse = await Promise.allSettled(fecthList)
    const workflowList = reponse
      .map((v, i) => {
        if (v.status === 'fulfilled') return v.value?.data?.workflow_runs?.[0]
        console.log(
          `Error while fetch workflow for repository name ${list[i].repo} - ${v.reason.toString()}`
        )
      })
      .filter((v) => v)

    workflowList.forEach(({ repository, name, status, conclusion }) => {
      const { name: displayName } = list.find((v) => v.repo === repository.name) || {}
      workflowGauge.set(
        {
          name: displayName || repository.name,
          repo_name: repository.name,
          workflow_name: name,
        },
        getWorkflowStatus(status, conclusion)
      )
    })
  }
}

export default fetchWorkflows
