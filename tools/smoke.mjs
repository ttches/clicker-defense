import { execFileSync, spawn } from 'node:child_process'
import { once } from 'node:events'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('..', import.meta.url))
const url = 'http://127.0.0.1:4173/'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const isServing = async () => {
  try {
    await fetch(url, { signal: AbortSignal.timeout(1000) })
    return true
  } catch {
    return false
  }
}

// Never validate a stranger's server.
if (await isServing()) {
  console.error(
    `FAIL preflight: ${url} already answers; stop that server before running the smoke gate`,
  )
  process.exit(1)
}

const server = spawn(
  'npm',
  ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
  {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
  },
)

let serverLog = ''
server.stdout.on('data', (chunk) => {
  serverLog += chunk
})
server.stderr.on('data', (chunk) => {
  serverLog += chunk
})

const stopServer = async () => {
  if (!server.pid || server.exitCode !== null) return
  try {
    process.kill(
      process.platform === 'win32' ? server.pid : -server.pid,
      'SIGTERM',
    )
  } catch {
    return
  }
  await Promise.race([once(server, 'exit'), sleep(2000)])
  if (server.exitCode === null) {
    try {
      process.kill(
        process.platform === 'win32' ? server.pid : -server.pid,
        'SIGKILL',
      )
    } catch {
      // already gone
    }
  }
}

const waitForServer = async () => {
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`dev server exited with ${server.exitCode}\n${serverLog}`)
    }
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // not listening yet
    }
    await sleep(250)
  }
  throw new Error(`dev server did not answer in 30 s\n${serverLog}`)
}

const launchBrowser = async () => {
  try {
    return await chromium.launch({ args: ['--no-sandbox'] })
  } catch (error) {
    console.error(`chromium launch failed: ${error.message}`)
    console.error('installing chromium and retrying once')
    try {
      execFileSync('npx', ['playwright', 'install', 'chromium'], {
        cwd: root,
        stdio: 'inherit',
      })
      return await chromium.launch({ args: ['--no-sandbox'] })
    } catch (retryError) {
      throw new Error(`chromium still unavailable: ${retryError.message}`)
    }
  }
}

const runPass = async (browser, deviceScaleFactor) => {
  const screenshotPath = `/tmp/clicker-smoke-dpr${deviceScaleFactor}.png`
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor,
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => {
    errors.push(`pageerror: ${error.message}`)
  })
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })

  const checks = []
  try {
    await page.goto(url, { waitUntil: 'load' })
    await page.waitForFunction(
      () => Boolean(globalThis.__game) && globalThis.__game.running === true,
      undefined,
      { timeout: 15000 },
    )

    const start = await page.evaluate(() => {
      const game = globalThis.__game
      return {
        tick: game.tick,
        frames: game.framesTotal,
        background: game.drawn.background,
      }
    })
    await page.waitForTimeout(800)

    const data = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      if (!canvas) throw new Error('canvas missing')
      const game = globalThis.__game
      if (!game) throw new Error('window.__game missing')
      const rect = canvas.getBoundingClientRect()
      return {
        rectWidth: rect.width,
        rectHeight: rect.height,
        width: canvas.width,
        height: canvas.height,
        devicePixelRatio: window.devicePixelRatio,
        tick: game.tick,
        frames: game.framesTotal,
        loops: game.loops,
        pixelRatio: game.canvas.pixelRatio,
        background: game.drawn.background,
        running: game.running,
      }
    })

    const tickDelta = data.tick - start.tick
    const framesDelta = data.frames - start.frames
    const backgroundDelta = data.background - start.background
    const scale = data.pixelRatio
    const expectedWidth = Math.floor(data.rectWidth * scale)
    const expectedHeight = Math.floor(data.rectHeight * scale)

    checks.push(
      [
        'viewport laid out',
        data.rectWidth > 0 && data.rectHeight > 0,
        `${data.rectWidth}x${data.rectHeight}`,
      ],
      [
        'one 60 Hz loop (tick)',
        tickDelta >= 20 && tickDelta <= 75,
        `tickDelta=${tickDelta}`,
      ],
      [
        'one 60 Hz loop (frames)',
        framesDelta >= 8 && framesDelta <= 75,
        `framesDelta=${framesDelta}`,
      ],
      ['one active loop', data.loops === 1, `loops=${data.loops}`],
      [
        'loop still feeding draws',
        backgroundDelta >= 10,
        `backgroundDelta=${backgroundDelta}`,
      ],
      [
        `canvas buffer at DPR ${scale}`,
        data.width === expectedWidth && data.height === expectedHeight,
        `${data.width}x${data.height} expected ${expectedWidth}x${expectedHeight}`,
      ],
      ['loop running', data.running === true, `running=${data.running}`],
      ['no page or console errors', errors.length === 0, errors.join(' | ')],
    )

    await page.screenshot({ path: screenshotPath })
  } finally {
    await context.close().catch(() => {})
  }

  return { checks, screenshotPath }
}

let browser
let failed = true

try {
  await waitForServer()
  browser = await launchBrowser()

  const passes = []
  for (const deviceScaleFactor of [1, 2]) {
    passes.push(await runPass(browser, deviceScaleFactor))
  }

  failed = false
  for (const { checks, screenshotPath } of passes) {
    for (const [label, passed, detail] of checks) {
      if (!passed) failed = true
      console.log(
        `${passed ? 'PASS' : 'FAIL'} ${label}${detail ? ` (${detail})` : ''}`,
      )
    }
    console.log(`screenshot ${screenshotPath}`)
  }
} catch (error) {
  console.error(`FAIL smoke: ${error.message}`)
  failed = true
} finally {
  if (browser) await browser.close().catch(() => {})
  await stopServer()
}

process.exit(failed ? 1 : 0)
