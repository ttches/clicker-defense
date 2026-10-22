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
        hudPublishes: game.hudPublishes,
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
        currency: game.currency,
        enemies: game.enemies,
        hudPublishes: game.hudPublishes,
        renderCalls: game.renderCalls,
        renderTriangles: game.renderTriangles,
        hudCurrency:
          document.querySelector('[data-hud="currency"]')?.textContent ?? '',
        hudEnemies:
          document.querySelector('[data-hud="enemies"]')?.textContent ?? '',
        running: game.running,
      }
    })

    const tickDelta = data.tick - start.tick
    const framesDelta = data.frames - start.frames
    const backgroundDelta = data.background - start.background
    const hudDelta = data.hudPublishes - start.hudPublishes
    const scale = data.pixelRatio
    const expectedWidth = Math.floor(data.rectWidth * scale)
    const expectedHeight = Math.floor(data.rectHeight * scale)
    const hudCurrency = Number.parseFloat(data.hudCurrency)
    const hudEnemies = Number.parseInt(data.hudEnemies, 10)

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
      [
        'render call budget',
        data.renderCalls <= 8,
        `calls=${data.renderCalls}`,
      ],
      [
        'background triangles drawn',
        data.renderTriangles >= 6,
        `triangles=${data.renderTriangles}`,
      ],
      [
        'HUD publishes near 10 Hz',
        hudDelta >= 4 && hudDelta <= 12,
        `hudDelta=${hudDelta}`,
      ],
      [
        'HUD currency matches debug',
        Number.isFinite(hudCurrency) &&
          Math.abs(hudCurrency - data.currency) <= 0.01,
        `hud=${data.hudCurrency} debug=${data.currency}`,
      ],
      [
        'hud enemies matches debug',
        hudEnemies === data.enemies,
        `hud=${data.hudEnemies} debug=${data.enemies}`,
      ],
      ['no page or console errors', errors.length === 0, errors.join(' | ')],
    )

    await page.mouse.click(640, 360)
    await page.mouse.click(640, 360)
    // Input queues for the next tick, so wait for the shot to land instead of
    // reading a cooldown that a mid-frame evaluate could still see as zero.
    await page.waitForFunction(
      () => (globalThis.__game?.clickCooldown ?? 0) >= 1,
      undefined,
      { timeout: 1000 },
    )
    const { cooldown, interval } = await page.evaluate(() => ({
      cooldown: globalThis.__game?.clickCooldown ?? -1,
      interval: globalThis.__game?.clickIntervalTicks ?? 0,
    }))
    checks.push([
      'pointer fire reaches sim',
      interval > 0 && cooldown >= 1 && cooldown <= interval,
      `cooldown=${cooldown} interval=${interval}`,
    ])

    await page.screenshot({ path: screenshotPath })
  } finally {
    await context.close().catch(() => {})
  }

  return { checks, screenshotPath }
}

const runStressPass = async (browser) => {
  const screenshotPath = '/tmp/clicker-smoke-stress.png'
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
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
    await page.goto(`${url}?stress=2048`, { waitUntil: 'commit' })
    await page.waitForFunction(
      () => globalThis.__game?.enemies === 2048,
      undefined,
      { timeout: 30000 },
    )

    const start = await page.evaluate(() => {
      const game = globalThis.__game
      if (!game) throw new Error('window.__game missing')
      return {
        enemies: game.enemies,
        drawn: game.drawn.enemies,
        frames: game.framesTotal,
        renderCalls: game.renderCalls,
        renderTriangles: game.renderTriangles,
        hudEnemies:
          document.querySelector('[data-hud="enemies"]')?.textContent ?? '',
      }
    })
    await page.waitForTimeout(1000)
    const end = await page.evaluate(() => {
      const game = globalThis.__game
      if (!game) throw new Error('window.__game missing')
      return {
        frames: game.framesTotal,
        enemies: game.enemies,
        drawn: game.drawn.enemies,
        renderCalls: game.renderCalls,
        renderTriangles: game.renderTriangles,
        popups: game.popups,
        tracersSpawned: game.tracersSpawned,
      }
    })

    const framesDelta = end.frames - start.frames
    checks.push(
      ['stress spawned 2,048', start.enemies === 2048, `n=${start.enemies}`],
      [
        'stress draws every instance',
        start.drawn === 2048,
        `drawn=${start.drawn}`,
      ],
      [
        'stress HUD matches 2,048',
        Number.parseInt(start.hudEnemies, 10) === 2048,
        `hud=${start.hudEnemies}`,
      ],
      [
        'stress is one instanced call',
        start.renderCalls <= 8,
        `calls=${start.renderCalls}`,
      ],
      [
        'stress triangles cover the horde',
        start.renderTriangles >= 6000,
        `triangles=${start.renderTriangles}`,
      ],
      [
        'stress wave survives the window',
        end.enemies === 2048 && end.drawn === 2048,
        `enemies=${end.enemies} drawn=${end.drawn}`,
      ],
      ['stress frame floor', framesDelta >= 8, `framesDelta=${framesDelta}`],
    )

    await page.screenshot({ path: screenshotPath })

    // The 2,048 wave's front-most enemy leaks before ten 1-damage hits land
    // (measured: 0 kills / 1,228 leaks in 8 s), so the combat chain is proven
    // on a clean run inside this pass instead of faking stress-page state.
    await page.goto(url, { waitUntil: 'load' })
    await page.waitForFunction(
      () => globalThis.__game?.running === true,
      undefined,
      { timeout: 15000 },
    )
    await page.waitForFunction(
      () => (globalThis.__game?.enemies ?? 0) >= 1,
      undefined,
      { timeout: 15000 },
    )
    await page.mouse.move(640, 360)
    await page.mouse.down()
    await page.waitForFunction(
      () => (globalThis.__game?.kills ?? 0) >= 1,
      undefined,
      { timeout: 8000 },
    )
    await page.mouse.up()
    await page.waitForTimeout(150)

    const combat = await page.evaluate(() => {
      const game = globalThis.__game
      if (!game) throw new Error('window.__game missing')
      return {
        kills: game.kills,
        currency: game.currency,
        tracersSpawned: game.tracersSpawned,
        tracersSeen: game.tracersSeen,
        popups: game.popups,
        popupsPushed: game.popupsPushed,
      }
    })
    checks.push(
      [
        'click reaches damage and kill',
        combat.kills >= 1,
        `kills=${combat.kills}`,
      ],
      ['kill pays bounty', combat.currency >= 1, `currency=${combat.currency}`],
      [
        'tracers spawned',
        combat.tracersSpawned > 0,
        `tracersSpawned=${combat.tracersSpawned}`,
      ],
      [
        'tracers rendered',
        combat.tracersSeen > 0,
        `tracersSeen=${combat.tracersSeen}`,
      ],
      ['bounty popup visible', combat.popups >= 1, `popups=${combat.popups}`],
      [
        'bounty popup pushed',
        combat.popupsPushed > 0,
        `popupsPushed=${combat.popupsPushed}`,
      ],
      ['no page or console errors', errors.length === 0, errors.join(' | ')],
    )

    await page.screenshot({ path: '/tmp/clicker-smoke-combat.png' })
    console.log('screenshot /tmp/clicker-smoke-combat.png')
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
  passes.push(await runStressPass(browser))

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
