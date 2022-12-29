import yaml from 'js-yaml'
import fs from 'fs'

let config = {}
try {
  config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
} catch (e) {
  console.log(e.toString())
  process.exit()
}

export const token = config.token
export const scrape_interval = config.scrape_interval
export const port = config.port
export const runner = config.runner || {}
export const workflow = config.workflow || {}
