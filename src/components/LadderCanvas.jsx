import React, { useEffect, useRef, useState } from 'react'
import LADDER_CONFIG from '../config/ladderConfig'

const LadderCanvas = ({ players, results, ladder, movingPlayers, onFinish, colors, theme, speed }) => {
  const canvasRef = useRef(null)
  const [positions, setPositions] = useState([])
  const intervalRef = useRef(null)
  const ROWS = ladder.length

  const getCenterOffset = (canvasWidth) => {
    const totalLadderWidth = (players.length - 1) * LADDER_CONFIG.COL_WIDTH
    return (canvasWidth - totalLadderWidth) / 2
  }

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    const centerOffset = getCenterOffset(ctx.canvas.width)
    const lineColor = theme === 'dark' ? '#eee' : '#000'
    const fontColor = theme === 'dark' ? '#fff' : '#000'

    ctx.strokeStyle = lineColor
    ctx.lineWidth = 1

    for (let c = 0; c < players.length; c++) {
      const x = centerOffset + c * LADDER_CONFIG.COL_WIDTH
      ctx.beginPath()
      ctx.moveTo(x, LADDER_CONFIG.PADDING)
      ctx.lineTo(x, LADDER_CONFIG.PADDING + (ROWS - 1) * LADDER_CONFIG.ROW_HEIGHT)
      ctx.stroke()
    }

    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 0; c < players.length - 1; c++) {
        if (ladder[r][c]) {
          const x1 = centerOffset + c * LADDER_CONFIG.COL_WIDTH
          const x2 = centerOffset + (c + 1) * LADDER_CONFIG.COL_WIDTH
          const y = LADDER_CONFIG.PADDING + r * LADDER_CONFIG.ROW_HEIGHT
          ctx.beginPath()
          ctx.moveTo(x1, y)
          ctx.lineTo(x2, y)
          ctx.stroke()
        }
      }
    }

    ctx.fillStyle = fontColor
    ctx.font = '16px sans-serif'
    players.forEach((name, i) => {
      const x = centerOffset + i * LADDER_CONFIG.COL_WIDTH
      ctx.fillText(name, x - ctx.measureText(name).width / 2, LADDER_CONFIG.PADDING - 20)
    })
    results.forEach((res, i) => {
      const x = centerOffset + i * LADDER_CONFIG.COL_WIDTH
      ctx.fillText(res, x - ctx.measureText(res).width / 2, LADDER_CONFIG.PADDING + (ROWS - 1) * LADDER_CONFIG.ROW_HEIGHT + 40)
    })

    positions.forEach((p) => {
      ctx.strokeStyle = p.color
      ctx.lineWidth = 2
      ctx.beginPath()
      p.path.forEach(([px, py], idx) => {
        if (idx === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    })
  }

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    draw(ctx)
  }, [positions, ladder, players, results, theme])

  useEffect(() => {
    if (movingPlayers.length === 0) return
    const ctx = canvasRef.current.getContext('2d')
    const centerOffset = getCenterOffset(ctx.canvas.width)

    setPositions((prev) => {
      const existing = prev.map(p => p.index)
      const added = movingPlayers
        .filter(p => !existing.includes(p.index))
        .map(p => {
          const x = centerOffset + p.index * LADDER_CONFIG.COL_WIDTH
          return {
            index: p.index,
            col: p.index,
            row: 0,
            x,
            y: LADDER_CONFIG.PADDING,
            direction: 'down',
            path: [[x, LADDER_CONFIG.PADDING]],
            targetX: x,
            targetY: LADDER_CONFIG.PADDING + LADDER_CONFIG.ROW_HEIGHT,
            color: colors[p.index],
            done: false
          }
        })
      return [...prev, ...added]
    })

    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setPositions((prev) => {
        const updated = prev.map((p) => {
          if (p.done) return p

          const dx = p.targetX - p.x
          const dy = p.targetY - p.y
          const dist = Math.hypot(dx, dy)

          let x = p.x
          let y = p.y
          let col = p.col
          let row = p.row
          let direction = p.direction
          let targetX = p.targetX
          let targetY = p.targetY

          if (dist <= speed) {
            x = targetX
            y = targetY

            if (direction === 'right' || direction === 'left') {
              direction = 'down'
              targetX = x
              targetY = y + LADDER_CONFIG.ROW_HEIGHT
            } else {
              row += 1
              if (row >= ROWS) {
                onFinish(p.index, col)
                return { ...p, x, y, done: true }
              }

              if (col < players.length - 1 && ladder[row][col]) {
                direction = 'right'
                col += 1
                targetX = centerOffset + col * LADDER_CONFIG.COL_WIDTH
                targetY = y
              } else if (col > 0 && ladder[row][col - 1]) {
                direction = 'left'
                col -= 1
                targetX = centerOffset + col * LADDER_CONFIG.COL_WIDTH
                targetY = y
              } else {
                direction = 'down'
                targetX = x
                targetY = y + LADDER_CONFIG.ROW_HEIGHT
              }
            }
          } else {
            const angle = Math.atan2(dy, dx)
            x += speed * Math.cos(angle)
            y += speed * Math.sin(angle)
          }

          return {
            ...p,
            x,
            y,
            col,
            row,
            direction,
            targetX,
            targetY,
            path: [...p.path, [x, y]]
          }
        })

        const allDone = updated
          .filter(p => movingPlayers.some(mp => mp.index === p.index))
          .every(p => p.done)

        if (allDone) clearInterval(intervalRef.current)
        return updated
      })
    }, LADDER_CONFIG.INTERVAL_MS)

    return () => clearInterval(intervalRef.current)
  }, [movingPlayers, speed])

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        width={players.length * LADDER_CONFIG.COL_WIDTH + LADDER_CONFIG.PADDING * 2}
        height={LADDER_CONFIG.ROW_HEIGHT * ladder.length + LADDER_CONFIG.PADDING * 2}
        style={{
          border: '3px solid #aaa',
          borderRadius: '16px',
          backgroundColor: theme === 'dark' ? '#111' : '#fff',
          boxShadow: '0 6px 14px rgba(0, 0, 0, 0.15)'
        }}
      />
    </div>
  )
}

export default LadderCanvas
