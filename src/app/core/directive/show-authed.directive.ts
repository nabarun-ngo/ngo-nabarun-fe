import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, ViewRef } from '@angular/core';
import { UserIdentityService } from '../service/user-identity.service';
import { filter, map } from 'rxjs';

@Directive({
  selector: '[appShowAuthed]'
})
/**
 * @deprecated 
 */

export class ShowAuthedDirective implements OnInit {
  constructor(
    private templateRef: TemplateRef<any>,
    private identityService: UserIdentityService,
    private viewContainer: ViewContainerRef
  ) { }

  condition: boolean = false;

  authRef: ViewRef | undefined;

  ngOnInit() {
    //console.log('Directive called')
    // this.identityService.onEvent()
    //   .pipe(filter(data => data.event == 'token_received' || data.event == 'token_refreshed'))
    //   .pipe(map(data => data.status == 'success'))
    //   .subscribe(isAuthenticated => {
    //     if (
    //       (isAuthenticated && this.condition) ||
    //       (!isAuthenticated && !this.condition)
    //     ) {
    //       if (!this.authRef) {
    //         this.authRef = this.viewContainer.createEmbeddedView(
    //           this.templateRef
    //         );
    //       }
    //     } else {
    //       this.viewContainer.clear();
    //     }
    //   })
  }

  @Input() set appShowAuthed(condition: boolean) {
    this.condition = condition;
  }
}



