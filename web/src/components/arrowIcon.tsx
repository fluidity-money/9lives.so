import { combineClass } from "@/utils/combineClass";

export default function ArrowIcon({
  variant,
  size,
  className,
}: {
  variant: "up" | "down";
  size?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 7 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={combineClass(
        variant === "up" ? "text-green-600" : "rotate-90 text-red-600",
        size ?? "size-2",
        className,
      )}
    >
      <path
        d="M6.76599 5.76991L5.65894 5.7761V1.91072L0.804025 6.76563L2.67137e-05 5.96164L4.85494 1.10672L0.992656 1.10981L0.995749 -0.000326327L6.76599 -0.000325653V5.76991Z"
        fill="currentColor"
      />
    </svg>
  );
}
