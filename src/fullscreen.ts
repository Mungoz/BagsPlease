// Fullscreen helpers. Browsers only allow fullscreen from a user gesture (a tap/click),
// so on touch devices we go fullscreen on the first tap and try to lock to landscape.

type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };

export const isTouch = () => matchMedia('(pointer: coarse)').matches;

export function isFullscreen(): boolean {
  const d = document as FsDoc;
  return !!(d.fullscreenElement ?? d.webkitFullscreenElement);
}

/** False on e.g. iPhone Safari, which has no fullscreen API for pages. */
export function canFullscreen(): boolean {
  const el = document.documentElement as FsEl;
  return !!(el.requestFullscreen || el.webkitRequestFullscreen) && document.fullscreenEnabled !== false;
}

export async function enterFullscreen() {
  const el = document.documentElement as FsEl;
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
    else el.webkitRequestFullscreen?.();
  } catch {
    return; // blocked (e.g. iframe without allowfullscreen)
  }
  try {
    // Only works once fullscreen, and only on some browsers (mostly Android Chrome).
    await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape');
  } catch {
    /* not supported */
  }
}

export function toggleFullscreen() {
  const d = document as FsDoc;
  if (isFullscreen()) {
    try {
      if (d.exitFullscreen) void d.exitFullscreen();
      else d.webkitExitFullscreen?.();
    } catch {
      /* ignore */
    }
  } else void enterFullscreen();
}

/** On phones/tablets: the first tap anywhere goes fullscreen (once per page load). */
export function autoFullscreenOnFirstTap() {
  if (!isTouch() || !canFullscreen()) return;
  const go = (e: PointerEvent) => {
    // The FULLSCREEN button handles itself; don't double-toggle.
    if ((e.target as Element | null)?.closest?.('.btn-fs')) return;
    window.removeEventListener('pointerup', go);
    if (!isFullscreen()) void enterFullscreen();
  };
  window.addEventListener('pointerup', go);
}
