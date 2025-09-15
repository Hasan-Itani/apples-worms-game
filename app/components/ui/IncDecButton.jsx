// app/components/ui/IncDecButton.jsx
"use client";

export default function IncDecButton({
  children,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  disabled,
  size = "md",
  className = "",
}) {
  const sizeClass = size === "sm" ? "w-6 h-6" : "w-10 h-10";
  const skin =
    "flex items-center justify-center rounded-lg text-lg font-bold text-white " +
    "bg-[url('/inc-dec-dark-button.png')] bg-cover bg-center " +
    "hover:bg-[url('/inc-dec-button.png')] active:scale-95 transition " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      disabled={disabled}
      className={`${sizeClass} ${skin} ${className}`}
    >
      {children}
    </button>
  );
}
