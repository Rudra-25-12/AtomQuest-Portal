'use client'

import { useEffect, useMemo, useState } from 'react'

type StatCard = {
  label: string
  value: number | string
  color: string
  sub: string
}

function parseCardValue(value: number | string) {
  if (typeof value === 'number') return { numeric: value, suffix: '' }
  const percentage = String(value).trim()
  const matches = percentage.match(/^(-?\d+(?:\.\d+)?)(.*)$/)
  if (!matches) return { numeric: 0, suffix: String(value) }
  return { numeric: Number(matches[1]), suffix: matches[2] }
}

function formatDisplayValue(value: number, suffix: string) {
  const rounded = Number.isInteger(value) ? value : Math.round(value)
  return `${rounded}${suffix}`
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export default function AnimatedStatCards({ cards }: { cards: StatCard[] }) {
  const parsed = useMemo(() => cards.map(card => parseCardValue(card.value)), [cards])
  const [displayValues, setDisplayValues] = useState<string[]>(
    parsed.map(({ suffix }) => `0${suffix}`)
  )

  useEffect(() => {
    let frameId = 0
    const duration = 800
    const start = performance.now()

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = easeOutCubic(progress)

      setDisplayValues(parsed.map(({ numeric, suffix }) => {
        const value = numeric * eased
        return formatDisplayValue(value, suffix)
      }))

      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      }
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [parsed])

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={card.label} className="rounded-2xl p-5"
          style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
          <p className="text-xs font-medium mb-3" style={{ color: '#475569' }}>{card.label}</p>
          <p className="text-3xl font-black mb-1" style={{ color: card.color }}>{displayValues[index]}</p>
          <p className="text-xs" style={{ color: '#334155' }}>{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
