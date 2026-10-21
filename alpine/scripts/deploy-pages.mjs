import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const project = path.resolve(import.meta.dirname, '..')
const repository = 'homelucmc-hash/Luc'
const branch = 'codex/val-thorens-site'
const source = { branch, path: '/' }
const resultFile = path.join(project, 'artifacts', 'pages-deployment.json')

function sanitize(message) {
  return String(message).replace(/(https?:\/\/)[^\s/@]+(?::[^\s/@]*)?@/g, '$1')
}

function command(program, args, options = {}) {
  const response = spawnSync(program, args, {
    cwd: project,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
    ...options,
  })
  if (response.error) throw new Error(`${program}: ${sanitize(response.error.message)}`)
  return response
}

function checked(program, args, options = {}) {
  const response = command(program, args, options)
  if (response.status !== 0) {
    throw new Error(`${program} failed: ${sanitize(response.stderr || response.stdout || `exit ${response.status}`)}`)
  }
  return response.stdout.trim()
}

function git(args, options = {}) {
  return checked('git', ['-C', path.resolve(project, '..'), ...args], options)
}

function parseJson(text) {
  try { return JSON.parse(text) } catch { return null }
}

function github(args, input) {
  const response = command('gh', ['api', ...args], input ? { input: JSON.stringify(input) } : {})
  return { ...response, body: parseJson(response.stdout) }
}

function apiError(response) {
  return sanitize(response.body?.message || response.stderr || response.stdout || `exit ${response.status}`)
}

function readPages() {
  const response = github([`repos/${repository}/pages`, '--method', 'GET'])
  if (response.status === 0) return response.body
  if (String(response.body?.status) === '404' || /HTTP 404/.test(response.stderr)) return null
  throw new Error(`Cannot inspect GitHub Pages: ${apiError(response)}`)
}

function checkPagesSource(pages) {
  if (!pages) return
  if (pages.source?.branch !== source.branch || pages.source?.path !== source.path) {
    throw new Error('GitHub Pages already uses another source. Existing Pages settings were preserved.')
  }
}

function remoteIdentity(remote) {
  try {
    const url = new URL(remote)
    return { host: url.hostname.toLowerCase(), name: url.pathname.replace(/^\/+|\/+$/g, '').replace(/\.git$/i, '') }
  } catch {
    const scp = remote.match(/^(?:[^@]+@)?([^:]+):(.+)$/)
    if (!scp) throw new Error('Origin has an unsupported fetch URL.')
    return { host: scp[1].toLowerCase(), name: scp[2].replace(/^\/+|\/+$/g, '').replace(/\.git$/i, '') }
  }
}

const args = process.argv.slice(2)
let publish = false
let htmlFile = path.join(project, 'artifacts', 'val-thorens.html')
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--publish') publish = true
  else if (args[i] === '--html' && args[i + 1]) htmlFile = path.resolve(args[++i])
  else if (args[i].startsWith('--html=')) htmlFile = path.resolve(args[i].slice('--html='.length))
  else if (args[i] === '--help') {
    console.log('Usage: node scripts/deploy-pages.mjs [--html path/to/site.html] [--publish]\n\nWithout --publish, prepares and reports a root-only Git tree without pushing or changing Pages.\nWith --publish, pushes a new commit to codex/val-thorens-site and configures Pages only for that source.\nThe current checkout, staged files and main branch remain unchanged.')
    process.exit(0)
  } else throw new Error(`Unknown argument: ${args[i]}`)
}

let temporary
let originalHead
const result = {
  repository,
  branch,
  source_file: htmlFile,
  mode: publish ? 'publish' : 'prepare',
  status: 'preparing',
  commit: null,
  html_url: null,
  pushed: false,
}

try {
  const identity = remoteIdentity(git(['remote', 'get-url', 'origin']))
  if (identity.host !== 'github.com' || identity.name.toLowerCase() !== repository.toLowerCase()) {
    throw new Error('Origin does not identify github.com/homelucmc-hash/Luc. Nothing was pushed.')
  }
  originalHead = git(['rev-parse', '--verify', 'HEAD^{commit}'])
  const fileInfo = await stat(htmlFile)
  if (!fileInfo.isFile() || fileInfo.size === 0 || fileInfo.size >= 100 * 1024 * 1024) {
    throw new Error('The input must be a nonempty HTML file smaller than GitHub’s 100 MiB file limit.')
  }
  const html = await readFile(htmlFile)
  if (!/<!doctype\s+html/i.test(html.subarray(0, 1024).toString())) {
    throw new Error('The input is not a standalone HTML document. Run npm run export:html first.')
  }
  result.bytes = html.length
  result.html_sha256 = createHash('sha256').update(html).digest('hex')

  const pages = readPages()
  checkPagesSource(pages)
  result.html_url = pages?.html_url || null
  result.pages_action = pages ? (pages.build_type === 'legacy' ? 'preserve' : 'update_same_source') : 'create'

  const remoteRef = git(['ls-remote', '--heads', 'origin', `refs/heads/${branch}`])
  const parent = remoteRef ? remoteRef.split(/\s+/)[0] : null
  if (parent && !/^[a-f0-9]{40}$/.test(parent)) throw new Error('The deployment branch returned an invalid commit identifier.')
  if (parent) git(['fetch', '--no-tags', '--no-write-fetch-head', 'origin', parent])

  temporary = await mkdtemp(path.join(os.tmpdir(), 'val-thorens-pages-'))
  const indexEnvironment = { ...process.env, GIT_INDEX_FILE: path.join(temporary, 'index') }
  git(['read-tree', '--empty'], { env: indexEnvironment })
  const htmlBlob = git(['hash-object', '-w', htmlFile])
  const emptyBlob = git(['hash-object', '-w', '--stdin'], { input: '' })
  git(['update-index', '--add', '--cacheinfo', `100644,${htmlBlob},index.html`], { env: indexEnvironment })
  git(['update-index', '--add', '--cacheinfo', `100644,${emptyBlob},.nojekyll`], { env: indexEnvironment })
  const tree = git(['write-tree'], { env: indexEnvironment })
  if (git(['ls-tree', '--name-only', tree]) !== '.nojekyll\nindex.html') throw new Error('The deployment tree contains unexpected files.')
  const commitEnvironment = {
    ...process.env,
    GIT_AUTHOR_NAME: 'Codex',
    GIT_AUTHOR_EMAIL: 'codex@openai.com',
    GIT_COMMITTER_NAME: 'Codex',
    GIT_COMMITTER_EMAIL: 'codex@openai.com',
  }
  result.commit = git(['-c', 'commit.gpgSign=false', 'commit-tree', tree, ...(parent ? ['-p', parent] : [])], {
    env: commitEnvironment,
    input: 'Publish the portable Val Thorens website\n',
  })
  result.tree = tree
  result.parent_commit = parent
  result.status = 'prepared'

  if (publish) {
    // A concurrent remote change is refused by normal fast-forward rules.
    // No force option and no local branch checkout are used.
    git(['push', 'origin', `${result.commit}:refs/heads/${branch}`])
    result.pushed = true
    result.status = 'branch_pushed'

    // Recheck before editing settings in case another actor configured Pages.
    const latestPages = readPages()
    checkPagesSource(latestPages)
    if (!latestPages || latestPages.build_type !== 'legacy') {
      const response = github([
        `repos/${repository}/pages`,
        '--method', latestPages ? 'PUT' : 'POST',
        '--input', '-',
      ], { source, build_type: 'legacy' })
      if (response.status !== 0) throw new Error(`Deployment branch is pushed, but Pages configuration failed: ${apiError(response)}`)
    }
    const configured = readPages()
    checkPagesSource(configured)
    if (!configured) throw new Error('Pages configuration could not be confirmed after saving.')
    result.html_url = configured.html_url || null
    result.status = 'build_pending'
    result.pages_status = configured.status || null
  }
} catch (error) {
  result.status = result.pushed ? 'branch_pushed_pages_unconfirmed' : 'failed'
  result.error = sanitize(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  if (temporary) await rm(temporary, { recursive: true, force: true })
  if (originalHead && git(['rev-parse', '--verify', 'HEAD^{commit}']) !== originalHead) {
    result.status = 'checkout_changed'
    result.error = 'HEAD changed during deployment. No reset was attempted.'
    process.exitCode = 1
  }
  await mkdir(path.dirname(resultFile), { recursive: true })
  await writeFile(resultFile, `${JSON.stringify(result, null, 2)}\n`)
  console.log(JSON.stringify(result, null, 2))
}
