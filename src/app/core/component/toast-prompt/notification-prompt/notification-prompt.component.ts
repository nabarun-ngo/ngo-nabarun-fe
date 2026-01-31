import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/core/service/notification/notification.service';

@Component({
    selector: 'app-notification-prompt',
    template: `
    <app-generic-toast-prompt
      [show]="showPrompt"
      icon="🔔"
      title="Enable Notifications"
      description="Get real-time updates for donations and activities"
      dismissText="Not now"
      actionText="Enable"
      (onDismiss)="dismissPrompt()"
      (onAction)="enableNotifications()"
    ></app-generic-toast-prompt>
  `
})
export class NotificationPromptComponent implements OnInit {
    showPrompt = false;

    constructor(private notificationService: NotificationService) { }

    public showManually(): void {
        this.showPrompt = true;
    }

    ngOnInit(): void {
        this.checkStatus();
    }

    private checkStatus(): void {
        // Check if permission is already granted or denied
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                // Check if user previously dismissed the prompt
                const dismissed = localStorage.getItem('notification-prompt-dismissed');
                if (dismissed) {
                    const dismissedTime = parseInt(dismissed, 10);
                    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
                    // Show again after 3 days
                    if (daysSinceDismissed < 3) {
                        return;
                    }
                }

                // Suggest showing prompt after a delay for better UX
                setTimeout(() => {
                    this.showPrompt = true;
                }, 5000);
            }
        }
    }

    enableNotifications(): void {
        this.notificationService.requestPermission().subscribe({
            next: (token) => {
                console.log('Push notifications enabled successfully');
                this.showPrompt = false;
            },
            error: (err) => {
                console.error('Failed to enable push notifications', err);
                this.showPrompt = false;
            }
        });
    }

    dismissPrompt(): void {
        this.showPrompt = false;
        // Store dismissal time
        localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
    }
}
