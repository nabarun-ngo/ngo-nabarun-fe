import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Set by the inline bootstrap script in index.html before Angular loads. */
type PwaInstallWindow = Window & {
  __pwaInstallPrompt?: BeforeInstallPromptEvent | null;
  __pwaInstalled?: boolean;
  MSStream?: unknown;
};

export type InstallOutcome = 'accepted' | 'dismissed' | 'manual' | 'unavailable';

const INSTALLED_DISPLAY_MODES = [
  '(display-mode: standalone)',
  '(display-mode: minimal-ui)',
  '(display-mode: fullscreen)',
  '(display-mode: window-controls-overlay)',
];

/**
 * Tracks whether the app can still be installed on this device.
 *
 * Chrome fires `beforeinstallprompt` once per page load, typically before any
 * component exists, so the deferred event is read from the window buffer as
 * well as from a live listener.
 */
@Injectable({ providedIn: 'root' })
export class PwaInstallService implements OnDestroy {
  private readonly installable = new BehaviorSubject<boolean>(false);
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installed = false;

  /** iOS/iPadOS never fires the prompt event; install is a manual Share-sheet step. */
  readonly requiresManualSteps = isIosLike();

  readonly installable$: Observable<boolean> = this.installable.asObservable();

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    const pwaWindow = window as PwaInstallWindow;
    this.deferredPrompt = pwaWindow.__pwaInstallPrompt ?? null;
    this.installed = pwaWindow.__pwaInstalled === true || isRunningInstalled();

    window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
    window.addEventListener('appinstalled', this.onAppInstalled);
    this.publish();
  }

  ngOnDestroy(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
    window.removeEventListener('appinstalled', this.onAppInstalled);
  }

  async promptInstall(): Promise<InstallOutcome> {
    if (this.deferredPrompt) {
      const prompt = this.deferredPrompt;
      this.deferredPrompt = null;
      (window as PwaInstallWindow).__pwaInstallPrompt = null;

      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        this.installed = true;
      }
      this.publish();
      return outcome;
    }

    return this.requiresManualSteps ? 'manual' : 'unavailable';
  }

  private readonly onBeforeInstallPrompt = (event: Event): void => {
    event.preventDefault();
    this.deferredPrompt = event as BeforeInstallPromptEvent;
    this.installed = false;
    this.publish();
  };

  private readonly onAppInstalled = (): void => {
    this.deferredPrompt = null;
    this.installed = true;
    this.publish();
  };

  private publish(): void {
    this.installable.next(this.computeInstallable());
  }

  private computeInstallable(): boolean {
    if (this.installed || isRunningInstalled()) {
      return false;
    }

    return this.deferredPrompt !== null || this.requiresManualSteps;
  }
}

function isRunningInstalled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const navigatorStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return (
    navigatorStandalone === true ||
    INSTALLED_DISPLAY_MODES.some((mode) => window.matchMedia(mode).matches)
  );
}

function isIosLike(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  const isIosDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as PwaInstallWindow).MSStream;
  // iPadOS 13+ reports a desktop Safari user agent, touch points are the tell.
  const isIpadOs = /Macintosh/.test(userAgent) && window.navigator.maxTouchPoints > 1;

  return isIosDevice || isIpadOs;
}
