export function LoadingSpinner({ size = 22 }: Readonly<{ size?: number }>) {
  return (
    <span
      className="material-symbols-outlined animate-spin"
      style={{ fontSize: `${size}px` }}
    >
      progress_activity
    </span>
  );
}
