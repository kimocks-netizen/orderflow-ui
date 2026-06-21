export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64 pt-12">
      <AppLoader />
    </div>
  );
}

export function AppLoader() {
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      {/* Outer ring — clockwise, thin with gap */}
      <svg
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: '2s', animationTimingFunction: 'linear' }}
        viewBox="0 0 96 96"
        fill="none"
      >
        <circle
          cx="48" cy="48" r="44"
          stroke="hsl(217 91% 60%)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="72 207"
          strokeDashoffset="0"
          opacity="0.9"
        />
      </svg>

      {/* Inner ring — counter-clockwise, different colour */}
      <svg
        className="absolute animate-spin"
        style={{
          animationDuration: '1.4s',
          animationTimingFunction: 'linear',
          animationDirection: 'reverse',
          inset: '12px',
        }}
        viewBox="0 0 72 72"
        fill="none"
      >
        <circle
          cx="36" cy="36" r="32"
          stroke="hsl(199 89% 48%)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="52 149"
          strokeDashoffset="0"
          opacity="0.9"
        />
      </svg>

      {/* Logo center */}
      <img
        src="/small-logo.png"
        alt="Loading"
        className="w-9 h-9 object-contain relative z-10 opacity-90"
      />
    </div>
  );
}
