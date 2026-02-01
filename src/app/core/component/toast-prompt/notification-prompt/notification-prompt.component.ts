import { Component, OnInit } from '@angular/core';
import { SpinnerVisibilityService } from 'ng-http-loader';
import { NotificationService } from 'src/app/core/service/notification/notification.service';

@Component({
    selector: 'app-notification-prompt',
    template: `
    <app-generic-toast-prompt
      [show]="showPrompt"
      icon="🔔"
      [title]="title"
      [description]="description"
      [dismissText]="dismissText"
      [actionText]="actionText"
      [showAction]="showAction"
      (onDismiss)="dismissPrompt()"
      (onAction)="enableNotifications()"
    ></app-generic-toast-prompt>
  `
})
export class NotificationPromptComponent implements OnInit {
    showPrompt: boolean = false;
    title!: string;
    description!: string;
    dismissText!: string;
    actionText!: string;
    showAction: boolean = true;

    constructor(private notificationService: NotificationService,
    ) { }

    public showManually(): void {
        this.showPrompt = true;
    }

    ngOnInit(): void {
        this.defaultPromptState();
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
        this.title = 'Enabling Notifications...';
        this.description = 'Please click on the Allow button to enable notifications...';
        this.showAction = false;
        this.notificationService.requestPermission().subscribe({
            next: (token) => {
                console.log('Push notifications enabled successfully');
                this.showPrompt = false;
                this.defaultPromptState();
            },
            error: (err) => {
                console.error('Failed to enable push notifications', err);
                this.showPrompt = false;
                this.defaultPromptState()
            }
        });
    }

    dismissPrompt(): void {
        this.showPrompt = false;
        // Store dismissal time
        localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
    }

    private defaultPromptState(): void {
        this.title = 'Enable Notifications';
        this.description = 'Get real-time updates for donations and activities';
        this.dismissText = 'Not now';
        this.actionText = 'Enable';
        this.showAction = true;
    }
}
