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

    // 1. Try to restore saved data
    // Autosave is best-effort; failure to restore should not block the form from rendering.
    try {
      const savedData = await this.autosaveService.getSavedForm(this.autosaveId);
      if (savedData) {
        if (this.view) {
          this.reconstructFormArrays(this.formGroupDirective.form, savedData, this.view);
        }
        // Use patchValue to restore saved fields. 
        // We use emitEvent: false to avoid triggering a save immediately after restore
        this.formGroupDirective.form.patchValue(savedData, { emitEvent: false });
      }
    } catch (err) {
      console.warn('FormAutosaveDirective: Failed to restore form data', err);
    }

    // 2. Subscribe to value changes to save data
    this.subscription = this.formGroupDirective.form.valueChanges.subscribe(value => {
      this.autosaveService.saveForm(this.autosaveId, value);
    });
  }

  private reconstructFormArrays(form: FormGroup, data: any, view: DetailedView) {
    if (view.section_type === 'editable_table' && view.editableTable) {
      const arrayName = view.editableTable.formArrayName;
      const savedArray = data[arrayName];
      if (Array.isArray(savedArray)) {
        const formArray = form.get(arrayName) as FormArray;
        if (formArray) {
          // Clear and rebuild based on saved data length
          while (formArray.length > 0) formArray.removeAt(0);
          savedArray.forEach(() => {
            const row = new FormGroup({}, { validators: buildRowValidator(view.editableTable!.rowValidationRules ?? []) });
            view.editableTable!.columns.forEach(col => {
              row.addControl(col.columnDef, new FormControl(null, col.validators ?? [], col.asyncValidators ?? []));
            });
            formArray.push(row);
          });
        }
      }
    } else if (view.section_type === 'editable_list' && view.editableList) {
      const arrayName = view.editableList.formArrayName;
      const savedArray = data[arrayName];
      if (Array.isArray(savedArray)) {
        const formArray = form.get(arrayName) as FormArray;
        if (formArray) {
          // Clear and rebuild based on saved data length
          while (formArray.length > 0) formArray.removeAt(0);
          savedArray.forEach(() => {
            const item = new FormGroup({}, { validators: buildRowValidator(view.editableList!.rowValidationRules ?? []) });
            view.editableList!.itemFields.forEach(field => {
              item.addControl(field.form_control_name!, new FormControl(field.field_value ?? null, field.form_input_validation ?? []));
            });
            formArray.push(item);
          });
        }
      }
    }
  }


  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
