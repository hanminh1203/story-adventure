export function prefersReducedMotion() {
  return (
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function flightDuration(base) {
  return prefersReducedMotion() ? 0 : base;
}
