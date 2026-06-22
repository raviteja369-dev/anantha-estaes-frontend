import { useEffect, useRef, useState } from 'react'

export default function Counter({ to = 0, duration = 1.8, prefix = '', suffix = '', decimals = 0, delay = 0 }) {
  const [val, setVal] = useState(0)
  const rafRef = useRef()

  useEffect(() => {
    let start
    let timeout
    const animate = (now) => {
      if (!start) start = now
      const p = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(eased * to)
      if (p < 1) rafRef.current = requestAnimationFrame(animate)
      else setVal(to)
    }
    timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate)
    }, delay * 1000)
    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(rafRef.current)
    }
  }, [to, duration, delay])

  const display = decimals > 0
    ? val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(val).toLocaleString('en-IN')

  return (
    <span className="tabular-nums">
      {prefix}{display}{suffix}
    </span>
  )
}
