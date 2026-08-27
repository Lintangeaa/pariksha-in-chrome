export interface FloatingButtonProps {
  recording: boolean;
  onClick: () => void;
}

/** Fixed-position circular launcher for the event panel; turns red while a recording is in progress. */
export function FloatingButton({ recording, onClick }: FloatingButtonProps) {
  return (
    <button
      type="button"
      class={`pariksha-fab${recording ? " recording" : ""}`}
      onClick={onClick}
      aria-label={recording ? "Pariksha recording in progress" : "Open Pariksha panel"}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.25" />
        <circle cx="12" cy="12" r="5" fill="currentColor" />
      </svg>
    </button>
  );
}
