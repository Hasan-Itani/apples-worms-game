"use client";

export default function IncDecButton({
  children,
  variant = "dec", // "inc" | "dec"
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  disabled,
  size = "md",
  className = "",
}) {
  const sizeClass = size === "sm" ? "w-6 h-6 text-sm" : "w-10 h-10 text-lg";
  const baseSkin =
    "flex items-center justify-center rounded-lg font-bold text-white " +
    "bg-cover bg-center active:scale-95 transition " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const bg =
    variant === "inc"
      ? "bg-[url('/plus_base_small.png')] hover:bg-[url('/inc-dec-button.png')]"
      : "bg-[url('/minus_base_small.png')] hover:bg-[url('/inc-dec-button.png')]";

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      disabled={disabled}
      aria-label={variant === "inc" ? "Increase" : "Decrease"}
      className={`${sizeClass} ${baseSkin} ${bg} ${className}`}
    >
      {children}
    </button>
  );
}
