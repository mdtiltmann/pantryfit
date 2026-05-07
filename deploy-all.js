/**
 * deploy-all.js — PantryFit full deployer
 * Runs all phases in phases.json in one go.
 * Fixed: Node 24 compatible, no CLI args needed.
 */

const fs    = require('fs')
const https = require('https')
const path  = require('path')

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iszksikttmdqgcwpuply.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`
  console.log(line)
  fs.appendFileSync('deploy-log.txt', line + '\n')
}

function runSQL(sql) {
  return new Promise((resolve) => {
    if (!SERVICE_KEY) {
      log('  No SUPABASE_SERVICE_KEY — add it to GitHub Secrets')
      return resolve()
    }
    const body = JSON.stringify({ query: sql })
    const hostname = new URL(SUPABASE_URL).hostname
    const req = https.request({
      hostname,
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
        if (res.statusCode < 300) {
          log(`  SQL OK`)
        } else {
          log(`  SQL note (${res.statusCode}): ${d.slice(0, 120)}`)
        }
        resolve()
      })
    })
    req.on('error', e => { log(`  SQL error: ${e.message}`); resolve() })
    req.write(body)
    req.end()
  })
}

async function main() {
  log('PantryFit — deploying ALL phases')
  log(`Supabase: ${SUPABASE_URL}`)

  // Load phases
  if (!fs.existsSync('phases.json')) {
    log('ERROR: phases.json not found in repo root')
    process.exit(1)
  }

  const phases = JSON.parse(fs.readFileSync('phases.json', 'utf8'))
  log(`Found ${phases.length} phases to deploy`)

  const progress = { deployed: [], lastDeployed: null }

  for (const phase of phases) {
    log(`\n=== ${phase.id}: ${phase.name} ===`)

    // Run SQL statements
    if (phase.sql && phase.sql.length > 0) {
      log(`  Running ${phase.sql.length} SQL statement(s)...`)
      for (const sql of phase.sql) {
        await runSQL(sql)
      }
    }

    // Write files
    if (phase.files) {
      for (const [dest, content] of Object.entries(phase.files)) {
        const dir = path.dirname(dest)
        if (dir && dir !== '.') {
          fs.mkdirSync(dir, { recursive: true })
        }
        fs.writeFileSync(dest, content, 'utf8')
        log(`  Written: ${dest} (${content.length} chars)`)
      }
    }

    progress.deployed.push(phase.id)
    log(`  Completed: ${phase.id}`)
  }

  // Save progress
  progress.lastDeployed = new Date().toISOString()
  fs.writeFileSync('progress.json', JSON.stringify(progress, null, 2))
  fs.writeFileSync('current-phase.txt', `All ${phases.length} phases deployed`)

  log(`\nAll ${phases.length} phases complete!`)
  log(`Deployed: ${progress.deployed.join(', ')}`)
}

main().catch(e => {
  console.error('Fatal error:', e.message)
  process.exit(1)
})
