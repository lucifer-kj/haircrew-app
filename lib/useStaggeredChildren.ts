import { staggerContainer } from './motion.config'
import { useReducedMotion } from './useReducedMotion'

export function useStaggeredChildren() {
  const reduced = useReducedMotion()
  return reduced
    ? { parent: { hidden: {}, show: {} }, child: { hidden: {}, show: {} } }
    : {
        parent: staggerContainer,
        child: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
      }
}
