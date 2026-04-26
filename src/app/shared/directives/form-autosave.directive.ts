import { Directive, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { FormGroupDirective, FormArray, FormGroup, FormControl } from '@angular/forms';
import { FormAutosaveService } from 'src/app/core/service/form-autosave.service';
import { Subscription } from 'rxjs';
import { DetailedView } from '../model/detailed-view.model';
import { buildRowValidator } from '../utils/row-validator.factory';


@Directive({
  selector: '[appAutosave]',
  standalone: true // Making it standalone for easier integration if needed, but we can also add to SharedModule
})
export class FormAutosaveDirective implements OnInit, OnDestroy {
  @Input('appAutosave') autosaveId!: string;
  @Input('appAutosaveView') view?: DetailedView;


  private formGroupDirective = inject(FormGroupDirective);
  private autosaveService = inject(FormAutosaveService);
  private subscription: Subscription | undefined;

  async ngOnInit() {
    if (!this.autosaveId) {
      console.warn('FormAutosaveDirective: No autoSaveId provided for ' + this.view?.section_name + ' section.');
      return;
    }

    // Subscribe to value changes to save data, but only if we are in edit mode
    this.subscription = this.formGroupDirective.form.valueChanges.subscribe(value => {
      if (this.view?.show_form) {
        this.autosaveService.saveForm(this.autosaveId, value);
      }
    });
  }




  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
