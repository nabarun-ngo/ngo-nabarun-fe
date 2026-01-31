import { Component, OnInit, OnDestroy } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-pwa-install-prompt',
  template: `
    <app-generic-toast-prompt
      [show]="showInstallPrompt"
      icon="📱"
      title="Install Nabarun App"
      description="Install our app for a better experience and offline access"
      dismissText="Not now"
      actionText="Install"
      (onDismiss)="dismissPrompt()"
      (onAction)="installApp()"
    ></app-generic-toast-prompt>
  `
})
export class PwaInstallPromptComponent implements OnInit, OnDestroy {
  showInstallPrompt = false;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installPromptDismissed = false;

  ngOnInit(): void {
    // Check if already installed
    if (this.isInstalled()) {
      return;
    }

    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }
    console.log('showInstallPrompt', this.showInstallPrompt, dismissed);
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this));
  }

  private handleBeforeInstallPrompt(e: Event): void {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    // Stash the event so it can be triggered later
    this.deferredPrompt = e as BeforeInstallPromptEvent;

    // Show the install prompt
    this.showInstallPrompt = true;
  }

  async installApp(): Promise<void> {
    if (!this.deferredPrompt) {
      return;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    this.deferredPrompt = null;
    this.showInstallPrompt = false;
  }

  dismissPrompt(): void {
    this.showInstallPrompt = false;
    // Store dismissal time
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }

  private isInstalled(): boolean {
    // Check if running as standalone (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check for iOS
    if ((window.navigator as any).standalone === true) {
      return true;
    }

    return false;
  }
}

