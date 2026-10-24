import styles from './FloatingText.module.css'

/** Most labels alive at once; older ones are reused first. */
const MAX_LABELS = 48

/**
 * Pooled "+1.00" labels that rise and fade over the canvas. Imperative DOM,
 * outside React, because they appear many times a second.
 */
export class FloatingText {
  private readonly labels: HTMLSpanElement[] = []
  private readonly container: HTMLElement
  private next = 0

  public constructor(container: HTMLElement) {
    this.container = container
  }

  public show(text: string, x: number, y: number): void {
    let label = this.labels[this.next]
    if (!label) {
      label = document.createElement('span')
      label.className = styles.label
      label.addEventListener('animationend', () => {
        label.style.visibility = 'hidden'
      })
      this.container.append(label)
      this.labels[this.next] = label
    }
    this.next = (this.next + 1) % MAX_LABELS

    label.textContent = text
    label.style.left = `${x}px`
    label.style.top = `${y}px`
    label.style.visibility = 'visible'
    // Restart the animation on a reused label.
    label.classList.remove(styles.rising)
    void label.offsetWidth
    label.classList.add(styles.rising)
  }

  public dispose(): void {
    for (const label of this.labels) label.remove()
    this.labels.length = 0
  }
}
