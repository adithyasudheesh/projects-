export function GlassDefs() {
  return (
    <defs>
      <linearGradient id="glassWall" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
        <stop offset="12%" stopColor="rgba(200,230,255,0.12)" />
        <stop offset="35%" stopColor="rgba(150,200,255,0.04)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
        <stop offset="65%" stopColor="rgba(150,200,255,0.04)" />
        <stop offset="88%" stopColor="rgba(200,230,255,0.12)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
      </linearGradient>
      <linearGradient id="glassShine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
        <stop offset="12%" stopColor="rgba(255,255,255,0.65)" />
        <stop offset="24%" stopColor="rgba(255,255,255,0.1)" />
        <stop offset="70%" stopColor="rgba(255,255,255,0.04)" />
        <stop offset="82%" stopColor="rgba(255,255,255,0.35)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      <linearGradient id="rimGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(220,240,255,0.85)" />
        <stop offset="100%" stopColor="rgba(150,190,230,0.3)" />
      </linearGradient>
      <radialGradient id="heatGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(255,140,40,0.8)" />
        <stop offset="100%" stopColor="rgba(255,80,20,0)" />
      </radialGradient>
      <linearGradient id="meniscusShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(0,0,0,0.22)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </linearGradient>
      <radialGradient id="sparkleGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
        <stop offset="45%" stopColor="rgba(255,255,255,0.4)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
      <radialGradient id="flameCore" cx="50%" cy="80%" r="60%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
        <stop offset="35%" stopColor="rgba(255,210,90,0.9)" />
        <stop offset="75%" stopColor="rgba(255,130,30,0.7)" />
        <stop offset="100%" stopColor="rgba(255,90,20,0)" />
      </radialGradient>
      <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
    </defs>
  );
}
