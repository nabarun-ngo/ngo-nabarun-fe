import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-generic-toast-prompt',
  template: `
    <div *ngIf="show" class="toast-prompt" [style.bottom.px]="bottomOffset">
      <div class="prompt-content">
        <div class="prompt-icon" *ngIf="icon">{{ icon }}</div>
        <div class="prompt-text">
          <h3>{{ title }}</h3>
          <p>{{ description }}</p>
        </div>
        <div class="prompt-actions" *ngIf="showAction">
          <button (click)="onDismiss.emit()" class="btn-dismiss">{{ dismissText }}</button>
          <button (click)="onAction.emit()" class="btn-action" [style.background-color]="actionColor">{{ actionText }}</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./generic-toast-prompt.component.scss']
})
export class GenericToastPromptComponent {
  @Input() show = false;
  @Input() icon = '';
  @Input() title = '';
  @Input() description = '';
  @Input() dismissText = 'Not now';
  @Input() actionText = 'Action';
  @Input() actionColor = '#6366f1';
  @Input() bottomOffset = 20;
  @Input() showAction = true;

  @Output() onDismiss = new EventEmitter<void>();
  @Output() onAction = new EventEmitter<void>();
}
