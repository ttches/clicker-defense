import { beforeEach, describe, expect, it } from 'vitest'
import {
  getPopups,
  getPopupsPushed,
  POPUP_TTL_MS,
  prunePopups,
  pushPopup,
  subscribePopups,
} from '@/ui/popup-store'

const NOW = 10_000

beforeEach(() => {
  prunePopups(Number.MAX_SAFE_INTEGER)
})

describe('pushPopup', () => {
  it('adds a popup with its text, coordinates, and birth time', () => {
    pushPopup(120, 340, '+1.0', NOW)

    const [popup] = getPopups()
    expect(getPopups()).toHaveLength(1)
    expect(popup.text).toBe('+1.0')
    expect(popup.x).toBe(120)
    expect(popup.y).toBe(340)
    expect(popup.bornAt).toBe(NOW)
  })

  it('assigns sequential ids', () => {
    pushPopup(1, 2, '+1.0', NOW)
    pushPopup(3, 4, '+1.0', NOW)

    const [first, second] = getPopups()
    expect(second.id).toBe(first.id + 1)
  })

  it('counts pushes monotonically across prunes', () => {
    const before = getPopupsPushed()
    pushPopup(1, 2, '+1.0', NOW)
    pushPopup(3, 4, '+2.0', NOW)
    prunePopups(NOW + POPUP_TTL_MS)

    expect(getPopupsPushed()).toBe(before + 2)
  })
})

describe('prunePopups', () => {
  it('removes only expired entries', () => {
    pushPopup(1, 2, '+1.0', NOW)
    pushPopup(3, 4, '+2.0', NOW + POPUP_TTL_MS / 2)

    prunePopups(NOW + POPUP_TTL_MS)

    expect(getPopups()).toHaveLength(1)
    expect(getPopups()[0].text).toBe('+2.0')
  })

  it('keeps the same array reference when nothing changed', () => {
    pushPopup(1, 2, '+1.0', NOW)
    const before = getPopups()

    prunePopups(NOW + 1)

    expect(getPopups()).toBe(before)
  })
})

describe('subscribePopups', () => {
  it('fires once per mutation and never for an unchanged prune', () => {
    let calls = 0
    const unsubscribe = subscribePopups(() => {
      calls += 1
    })

    pushPopup(1, 2, '+1.0', NOW)
    expect(calls).toBe(1)

    prunePopups(NOW + 1)
    expect(calls).toBe(1)

    prunePopups(NOW + POPUP_TTL_MS)
    expect(calls).toBe(2)

    unsubscribe()
    pushPopup(3, 4, '+2.0', NOW)
    expect(calls).toBe(2)
  })
})
