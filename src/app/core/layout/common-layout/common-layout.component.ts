import { Component } from '@angular/core';

@Component({
  selector: 'app-common-layout',
  template: `
     <router-outlet></router-outlet>
     <app-pwa-install-prompt></app-pwa-install-prompt>
  `,
  styles: [
  ]
})
export class CommonLayoutComponent {

}
