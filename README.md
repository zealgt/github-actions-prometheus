# github-actions-prometheus

![Docker Pulls](https://img.shields.io/docker/pulls/zealgt/github-actions-prometheus)

GitHub Prometheus exporter for monitor self-host runners and workflows status

Docker image : https://hub.docker.com/repository/docker/zealgt/github-actions-prometheus

## Features

- Monitor selected GitHub workflows deployment status
- Monitor all self-host runners status (for Organization account)
- Monitor API rate limit remaining
- Support both Personal access tokens (classic) and Fine-grained personal access tokens
- Require only necessary permissions
- Easy to setup!!

## Getting started

#### Create Github access token

You can use one of `Personal access tokens (classic)` or `Fine-grained personal access tokens`

For `Personal access tokens (classic)`

- Go to https://github.com/settings/tokens/new
- Set Note and Expiration time
- Set Scopes only `repo` and `admin:org` (see [image](https://github.com/zealgt/github-actions-prometheus/blob/main/doc/images/permission1.png))

For `Fine-grained personal access tokens`

- Go to https://github.com/settings/personal-access-tokens/new
- Set Token name and Expiration time
- Set Resource owner
- Set Repository access
- Set Permissions
  - Repository permissions: Actions access level is Read-only (see [image](https://github.com/zealgt/github-actions-prometheus/blob/main/doc/images/permission2.png))
  - Organization permissions: Self-hosted runners access level is Read-only (see [image](https://github.com/zealgt/github-actions-prometheus/blob/main/doc/images/permission3.png))

#### Install via docker-compose.yml

Create [config.yml](https://github.com/zealgt/github-actions-prometheus/blob/main/configs/config.example.yml) file at /etc/github-actions-exporter/config.yml

```YAML
version: '3'

services:
  github_actions_exporter:
    image: zealgt/github-actions-prometheus:1
    container_name: github_actions_exporter
    ports:
      - "9988:9988"
    volumes:
      - /etc/github-actions-exporter:/usr/app/configs
    restart: unless-stopped
```

## config.yml

```YAML
token: github_personal_access_tokens_OR_fine_grained_access_tokens # require
scrape_interval: 15 # optional
port: 9988 # optional
runner: # optional
  enabled: true
  org: organization_name
workflow: # optional
  enabled: true
  owner: owner_name # optional, apply to all list
  list:
    - owner: owner_name # optional, override workflow.owner
      name: custom_name # optional, name for github_workflow_status
      repo: repo_name_1
    - repo: repo_name_2
    - repo: repo_name_3
    - repo: repo_name_4
```

## Example metrics

```
# HELP github_rate_limit_remaining API rate limit remaining (reset every 60 minutes)
# TYPE github_rate_limit_remaining gauge
github_rate_limit_remaining 3836

# HELP github_runner_status Runner status (0=offine, 1=online, 2=running)
# TYPE github_runner_status gauge
github_runner_status{id="143",name="Runner 1",os="Linux"} 1
github_runner_status{id="144",name="Runner 2",os="Linux"} 2
github_runner_status{id="145",name="Runner 3",os="Linux"} 1

# HELP github_workflow_status Latest workflow status for each repository (0=unknown, 1=queued, 2=in_progress, 3=cancelled, 4=failure, 5=success)
# TYPE github_workflow_status gauge
github_workflow_status{name="custom_name",repo_name="repo_name_1",workflow_name="Development"} 5
github_workflow_status{name="repo_name_2",repo_name="repo_name_2",workflow_name="Development"} 2
github_workflow_status{name="repo_name_3",repo_name="repo_name_3",workflow_name="Production"} 1
github_workflow_status{name="repo_name_4",repo_name="repo_name_4",workflow_name="Production"} 1
```

## Troubleshooting

### HttpError: Bad credentials - GET ...

- Make sure you have config a valid GitHub token (No expire)

### HttpError: Not Found - GET /repos/ ...

- Make sure you have grant a valid permision for GitHub token ([link](#create-github-access-token))
- Make sure you config a valid `repo` name in `config.yml` file
- Make sure you have permission to access the repository

### HttpError: Must have admin rights to Repository. - GET /orgs/ ...

- Make sure you have grant a valid permision for GitHub token ([link](#create-github-access-token))
- Make sure you have permission to access the Self-host runner for config org
