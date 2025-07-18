import { MarqueeAnimation } from '@/components/ui/marquee-effect'

function MarqueeEffectDoubleExample() {
  return (
    <div className="flex flex-col gap-4">
      <MarqueeAnimation
        direction="left"
        baseVelocity={-3}
        className="bg-black text-white py-4 mb-2 mt-8"
      >
        HAIRCREW PROFESSIONALS
      </MarqueeAnimation>
      <MarqueeAnimation
        direction="right"
        baseVelocity={-3}
        className="bg-purple-500 text-white py-4 mb-8"
      >
        HAIRCREW PROFESSIONALS
      </MarqueeAnimation>
    </div>
  )
}

export { MarqueeEffectDoubleExample }
