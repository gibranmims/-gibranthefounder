import { useRef } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

// Landing-page motion language: lively spring (Reveal "pop") + expo-out ease.
// Same exported names as before — all importers retune from this one file.
export const mechanicalSpring = {
  type: 'spring',
  stiffness: 110,
  damping: 17,
  mass: 0.9,
}

// Signature expo-out ease from coworlds.io
export const expoOut = { duration: 0.5, ease: [0.16, 1, 0.3, 1] }

// Panel / menu reveal
export const menuReveal = {
  initial:    { opacity: 0, scale: 0.95, y: -8 },
  animate:    { opacity: 1, scale: 1,    y:  0 },
  exit:       { opacity: 0, scale: 0.95, y: -8 },
  transition: { type: 'spring', stiffness: 110, damping: 17, mass: 0.9 },
}

// Staggered list entry
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
}

export const staggerItem = {
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0 },
  transition: mechanicalSpring,
}

// Card entrance — landing "pop"
export const bentoReveal = {
  initial:    { opacity: 0, scale: 0.97, y: 24 },
  animate:    { opacity: 1, scale: 1,    y:  0 },
  transition: mechanicalSpring,
}

// Button micro-interaction — PillButton feel
export const buttonTap = {
  whileHover: { scale: 1.02 },
  whileTap:   { scale: 0.97 },
  transition: { type: 'spring', stiffness: 300, damping: 20 },
}

// Magnetic cursor attraction for primary buttons.
// Returns { ref, x, y, onMouseMove, onMouseLeave } to spread onto a motion element.
export function useMagnetic(strength = 0.3, range = 55) {
  const ref = useRef(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 220, damping: 18 })
  const y = useSpring(rawY, { stiffness: 220, damping: 18 })

  const onMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < range) { rawX.set(dx * strength); rawY.set(dy * strength) }
    else { rawX.set(0); rawY.set(0) }
  }

  const onMouseLeave = () => { rawX.set(0); rawY.set(0) }

  return { ref, x, y, onMouseMove, onMouseLeave }
}
