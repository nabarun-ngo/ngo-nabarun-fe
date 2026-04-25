import { Directive, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { FormAutosaveService } from 'src/app/core/service/form-autosave.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appAutosave]',
  standalone: true // Making it standalone for easier integration if needed, but we can also add to SharedModule
})
export class FormAutosaveDirective implements OnInit, OnDestroy {
  @Input('appAutosave') autosaveId!: string;
  
  private formGroupDirective = inject(FormGroupDirective);
  private autosaveService = inject(FormAutosaveService);
  private subscription: Subscription | undefined;

  async ngOnInit() {
    if (!this.autosaveId) {
      console.warn('FormAutosaveDirective: No autosaveId provided');
      return;
    }

    // 1. Try to restore saved data
    const savedData = await this.autosaveService.getSavedForm(this.autosaveId);
    if (savedData) {
      // Use patchValue to restore saved fields. 
      // We use emitEvent: false to avoid triggering a save immediately after restore
      this.formGroupDirective.form.patchValue(savedData, { emitEvent: false });
    }

    // 2. Subscribe to value changes to save data
    this.subscription = this.formGroupDirective.form.valueChanges.subscribe(value => {
      this.autosaveService.saveForm(this.autosaveId, value);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
