export function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <radialGradient id="logo-g" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffd18a" />
          <stop offset="1" stopColor="#e0902c" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#logo-g)" />
      <path d="M15.5 17.5a12 12 0 0 1 17 0" fill="none" stroke="#0b0907" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <path d="M19 21a7 7 0 0 1 10 0" fill="none" stroke="#0b0907" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <text x="24" y="35" textAnchor="middle" fontFamily="Fraunces Variable, Georgia, serif" fontStyle="italic" fontWeight="800" fontSize="13.5" fill="#0b0907">
        XII
      </text>
    </svg>
  );
}
