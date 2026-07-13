import { UI_TEXT } from "../uiText";

export default function LoadingProgressBar({ progress }) {
  const isIndeterminate = progress == null;
  const value = isIndeterminate ? undefined : Math.min(100, Math.max(0, progress));

  return (
    <div
      className={`loading-progress${isIndeterminate ? " loading-progress--indeterminate" : ""}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={UI_TEXT.LOADING_PROGRESS_ARIA_LABEL}
    >
      <div
        className="loading-progress-bar"
        style={isIndeterminate ? undefined : { width: `${value}%` }}
      />
    </div>
  );
}
