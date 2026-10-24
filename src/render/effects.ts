import { TAU } from '@/engine/math'
import type { GameEvent } from '@/sim/events'
import { PALETTE, type Rgb } from '@/render/palette'
import type { ShapeLayer } from '@/render/shape-layer'

/**
 * Short-lived visual particles (muzzle flashes, hit sparks, kill bursts).
 * Purely cosmetic and outside the sim, so it uses Math.random freely.
 */

const CAPACITY = 2048

type Kind = 'spark' | 'flash'

export class Effects {
  private readonly x = new Float32Array(CAPACITY)
  private readonly y = new Float32Array(CAPACITY)
  private readonly vx = new Float32Array(CAPACITY)
  private readonly vy = new Float32Array(CAPACITY)
  private readonly life = new Float32Array(CAPACITY)
  private readonly maxLife = new Float32Array(CAPACITY)
  private readonly size = new Float32Array(CAPACITY)
  private readonly grow = new Float32Array(CAPACITY)
  private readonly color: Rgb[] = []
  private count = 0

  public emit(event: GameEvent): void {
    switch (event.type) {
      case 'shot':
        this.add(
          'flash',
          event.x,
          event.y,
          0,
          0,
          0.06,
          14,
          0,
          event.source === 'click' ? PALETTE.clickBullet : PALETTE.towerBullet,
        )
        break
      case 'hit':
        for (let index = 0; index < 3; index += 1)
          this.spark(event.x, event.y, 220, PALETTE.spark)
        break
      case 'kill':
        this.add(
          'flash',
          event.x,
          event.y,
          0,
          0,
          0.18,
          18,
          160,
          PALETTE.killFlash,
        )
        for (let index = 0; index < 10; index += 1)
          this.spark(event.x, event.y, 360, PALETTE.enemyBody)
        break
      case 'leak':
        this.add(
          'flash',
          event.x,
          event.y,
          0,
          0,
          0.35,
          10,
          90,
          PALETTE.leakFlash,
        )
        break
      case 'bought':
        break
    }
  }

  private spark(x: number, y: number, speed: number, color: Rgb): void {
    const angle = Math.random() * TAU
    const velocity = speed * (0.4 + Math.random() * 0.6)
    this.add(
      'spark',
      x,
      y,
      Math.cos(angle) * velocity,
      Math.sin(angle) * velocity,
      0.15 + Math.random() * 0.2,
      4 + Math.random() * 3,
      0,
      color,
    )
  }

  private add(
    _kind: Kind,
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    size: number,
    grow: number,
    color: Rgb,
  ): void {
    if (this.count >= CAPACITY) return
    const index = this.count
    this.x[index] = x
    this.y[index] = y
    this.vx[index] = vx
    this.vy[index] = vy
    this.life[index] = life
    this.maxLife[index] = life
    this.size[index] = size
    this.grow[index] = grow
    this.color[index] = color
    this.count += 1
  }

  /** Age particles by real elapsed time and drop the finished ones. */
  public update(seconds: number): void {
    for (let index = this.count - 1; index >= 0; index -= 1) {
      this.life[index] -= seconds
      if (this.life[index] <= 0) {
        this.remove(index)
        continue
      }
      this.x[index] += this.vx[index] * seconds
      this.y[index] += this.vy[index] * seconds
      this.vx[index] *= 0.9
      this.vy[index] *= 0.9
      this.size[index] += this.grow[index] * seconds
    }
  }

  private remove(index: number): void {
    const last = this.count - 1
    this.count = last
    if (index === last) return
    this.x[index] = this.x[last]
    this.y[index] = this.y[last]
    this.vx[index] = this.vx[last]
    this.vy[index] = this.vy[last]
    this.life[index] = this.life[last]
    this.maxLife[index] = this.maxLife[last]
    this.size[index] = this.size[last]
    this.grow[index] = this.grow[last]
    this.color[index] = this.color[last]
  }

  public draw(layer: ShapeLayer): void {
    for (let index = 0; index < this.count; index += 1) {
      const fade = this.life[index] / this.maxLife[index]
      const size = this.size[index]
      layer.push(
        this.x[index],
        this.y[index],
        size,
        size,
        0,
        this.color[index],
        fade,
      )
    }
  }
}
