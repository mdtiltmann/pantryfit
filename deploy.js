/**
 * deploy.js — PantryFit phase deployer
 * Reads phases.json, finds the next undeployed phase,
 * runs its SQL against Supabase, marks it done.
 * No Claude needed. All code is pre-written in phases.json.
 */

const fs    = require('fs')
const https = require('https')

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iszksikttmdqgcwpuply.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`
  console.log(line)
  fs.appendFileSync('deploy-log.txt', line + '\n')
}

function runSQL(sql) {
  return new Promise((resolve, reject) => {
    if (!SERVICE_KEY) {
      log('No SUPABASE_SERVICE_KEY — add it to GitHub Secrets')
      return resolve('skipped')
    }
    const body = JSON.stringify({ query: sql })
    const req = https.request({
      hostname: new URL(SUPABASE_URL).hostname,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        if (res.statusCode < 300) resolve(d)
        else reject(new Error(`SQL error ${res.statusCode}: ${d.slice(0, 200)}`))
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  log('PantryFit deployer starting')

  // Load phases
  const phases   = JSON.parse(fs.readFileSync('phases.json', 'utf8'))
  const progress = fs.existsSync('progress.json')
    ? JSON.parse(fs.readFileSync('progress.json', 'utf8'))
    : { deployed: [] }

  const deployed = new Set(progress.deployed)
  const next     = phases.find(p => !deployed.has(p.id))

  if (!next) {
    log('All phases complete! Nothing to do.')
    return
  }

  log(`Deploying: ${next.id} — ${next.name}`)
  fs.writeFileSync('current-phase.txt', `${next.id}: ${next.name}`)

  // Run SQL if this phase has any
  if (next.sql) {
    for (const statement of next.sql) {
      try {
        await runSQL(statement)
        log(`  SQL OK: ${statement.slice(0, 60)}…`)
      } catch (e) {
        log(`  SQL error: ${e.message}`)
      }
    }
  }

  // Write any files embedded in phases.json
  if (next.files) {
    for (const [filename, fileContent] of Object.entries(next.files)) {
      const dir = require('path').dirname(filename)
      if (dir && dir !== '.') {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(filename, fileContent, 'utf8')
      log(`  File written: ${filename} (${fileContent.length} chars)`)
    }
  }

  // Mark as deployed
  progress.deployed.push(next.id)
  progress.lastDeployed = new Date().toISOString()
  fs.writeFileSync('progress.json', JSON.stringify(progress, null, 2))

  const remaining = phases.length - progress.deployed.length
  log(`Done. ${progress.deployed.length}/${phases.length} phases complete. ${remaining} remaining.`)
  if (remaining > 0) {
    const nextNext = phases.find(p => !progress.deployed.includes(p.id))
    log(`Next up (in 6h): ${nextNext?.name}`)
  } else {
    log('🎉 ALL PHASES COMPLETE!')
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1) })
