import { useEffect, useRef } from 'react'

const waves = [
  { yOffset: 0.5, amplitude: 30, length: 0.003, speed: 0.015, color: 'rgba(195, 218, 250, 0.6)' },
  { yOffset: 0.6, amplitude: 45, length: 0.002, speed: 0.01, color: 'rgba(168, 199, 250, 0.4)' },
  { yOffset: 0.7, amplitude: 20, length: 0.004, speed: 0.025, color: 'rgba(210, 227, 252, 0.5)' },
]

function WaveCanvas({ pulseKey }) {
  const canvasRef = useRef(null)
  const multiplierRef = useRef(1)

  useEffect(() => {
    multiplierRef.current = 2.5
    const timeoutId = setTimeout(() => {
      multiplierRef.current = 1
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [pulseKey])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    if (!canvas || !ctx) {
      return undefined
    }

    let width = 0
    let height = 0
    let time = 0
    let frameId = 0

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight * 0.6
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      if (multiplierRef.current > 1) {
        multiplierRef.current -= 0.02
      } else {
        multiplierRef.current = 1
      }

      waves.forEach((wave) => {
        ctx.beginPath()
        ctx.moveTo(0, height)

        const baseY = height * wave.yOffset

        for (let x = 0; x <= width; x += 10) {
          const y =
            baseY +
            Math.sin(x * wave.length + time * wave.speed) * (wave.amplitude * multiplierRef.current) +
            Math.sin(x * wave.length * 0.5 - time * wave.speed * 1.5) *
              (wave.amplitude * 0.5 * multiplierRef.current)

          ctx.lineTo(x, y)
        }

        ctx.lineTo(width, height)
        ctx.lineTo(0, height)
        ctx.closePath()

        ctx.fillStyle = wave.color
        ctx.fill()
      })

      time += 1
      frameId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    resize()
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return <canvas id="wave-canvas" ref={canvasRef} />
}

export default WaveCanvas
