export default function CatLogo({ color = "#0e0e0e", size = 64 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M32 4L54 16V40L32 60L10 40V16L32 4Z" fill={color} />
      <ellipse cx="22" cy="28" rx="5" ry="6.5" fill="white" />
      <ellipse cx="42" cy="28" rx="5" ry="6.5" fill="white" />
      <ellipse cx="22" cy="29" rx="3" ry="4.5" fill={color} />
      <ellipse cx="42" cy="29" rx="3" ry="4.5" fill={color} />
    </svg>
  );
}
