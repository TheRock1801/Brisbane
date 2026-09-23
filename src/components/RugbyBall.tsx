export function RugbyBall({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse
        cx="20"
        cy="20"
        rx="19"
        ry="11"
        transform="rotate(-20 20 20)"
        fill="#f2b134"
        stroke="#12263f"
        strokeWidth="1.5"
      />
      <path
        d="M4 24 Q20 14 36 16"
        stroke="#12263f"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M15.5 18.3 L13 22.8" stroke="#12263f" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M19.8 17 L17.6 21.9" stroke="#12263f" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24.1 15.9 L22.2 21" stroke="#12263f" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
