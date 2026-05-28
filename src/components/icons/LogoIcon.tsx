export default function LogoIcon() {
  return (
    <svg
      class="header-logo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      width="32"
      height="32"
    >
      <defs>
        <linearGradient id="logoCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
        <linearGradient id="logoPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d946ef" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M 32 80 C 44 48, 84 48, 96 80"
        fill="none"
        stroke="url(#logoCyan)"
        stroke-width="6"
        stroke-linecap="round"
        filter="url(#logoGlow)"
      />
      <circle
        cx="32"
        cy="80"
        r="10"
        fill="#0f0c1b"
        stroke="url(#logoCyan)"
        stroke-width="4"
      />
      <circle
        cx="96"
        cy="80"
        r="10"
        fill="#0f0c1b"
        stroke="url(#logoPurple)"
        stroke-width="4"
      />
      <path
        d="M 64 34 C 70 34, 72 40, 64 52 C 56 40, 58 34, 64 34 Z"
        fill="url(#logoPurple)"
        filter="url(#logoGlow)"
      />
    </svg>
  );
}
