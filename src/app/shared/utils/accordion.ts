import { Paginator } from "src/app/shared/utils/paginator";
import { AccordionButton, AccordionCell, AccordionData, AccordionList, AccordionRow } from "../model/accordion-list.model";
import { DetailedView, DetailedViewField } from "../model/detailed-view.model";
import { FormControl, ValidatorFn } from "@angular/forms";
import { BehaviorSubject, Subscription } from "rxjs";
import { FileUpload } from "../components/generic/file-upload/file-upload.component";
import { AfterContentInit, AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { KeyValue } from "../model/key-value.model";

/**
 * Type definition for field visibility rules
 * Maps field control names to visibility condition functions
 */
export type FieldVisibilityRule<NumType = any> = {
  fieldName: string;
  condition: (formValue: NumType) => boolean;
};

@Component({
  template: 'app-base-accordion',
})
export abstract class Accordion<NumType> extends Paginator implements OnInit, AfterContentInit {


  private viewInitialized = false;
  private page!: AccordionData<NumType>;

  @Input({ required: true, alias: 'refData' }) set referenceDataInput(data: { [name: string]: KeyValue[]; } | undefined) {
    this.setRefData(data);
  }

  @Input({ required: true }) set accordionData(page: AccordionData<NumType>) {
    if (page) {
      this.page = page;
      if (this.viewInitialized) {
        this.setContent(page.content!, page.totalSize);
      }
    }
  }

  /**
   * Do not override this method
   */
  ngOnInit() {
    //super.ngOnInit();
    this.onInitHook();
  }


  abstract onInitHook(): void;

  ngAfterContentInit(): void {
    this.setContent(this.page?.content!, this.page?.totalSize);
    this.viewInitialized = true;
  }

  private accordionList: AccordionList = {
    contents: [],
    searchValue: ''
  };
  private actionButtons: AccordionButton[] = [
    {
      button_id: 'CANCEL',
      button_name: 'Cancel'
    },
    {
      button_id: 'CONFIRM',
      button_name: 'Confirm'
    }
  ];
  private functionButtons: AccordionButton[] = [];
  protected activeButtonId: string | undefined = undefined;
  protected abstract prepareHighLevelView(data: NumType, options?: { [key: string]: any }): AccordionCell[];
  protected abstract prepareDetailedView(data: NumType, options?: { [key: string]: any }): DetailedView[];
  protected abstract prepareDefaultButtons(data: NumType, options?: { [key: string]: any }): AccordionButton[];
  protected abstract onClick(event: { buttonId: string; rowIndex: number; }): void;
  protected abstract onAccordionOpen(event: { rowIndex: number }): void;
  public readonly itemList: NumType[] = [];

  getAccordionList() {
    return this.accordionList;
  }
  /**
   * 
   * @param headers 
   * Set header row details
   */
  setHeaderRow(headers: AccordionCell[]) {
    this.accordionList.headers = headers;
  }

  /**
   * 
   * @param data 
   */
  setRefData(data: { [name: string]: KeyValue[]; } | undefined) {
    this.accordionList.refData = data;
  }

  getRefData(options?: { isActive?: boolean }) {
    const refData = this.accordionList.refData;
    if (!refData || !options?.isActive) {
      return refData;
    }

    const filtered: { [name: string]: KeyValue[] } = {};

    Object.keys(refData).forEach(key => {
      filtered[key] = refData[key].filter(e => e.active);
    });

    return filtered;
  }

  getRefValue(type: string, key: string) {
    const refData = this.accordionList.refData;
    if (!refData) {
      return key;
    }
    return refData[type].find(e => e.key == key)?.displayValue;
  }

  /**
   * 
   */
  clearContents() {
    this.accordionList.contents.splice(0);
    this.itemList.splice(0);
  }

  setContent(dataList: NumType[], totalSize?: number) {
    this.clearContents()
    if (dataList) {
      dataList.forEach(e => {
        this.addContentRow(e);
      })
    }
    if (totalSize) {
      this.totalItemLength = totalSize;
    }
  }

  /**
   * 
   * @param data 
   */
  addContentRow(data: NumType, insert_top: boolean = false) {
    let row = {
      columns: this.prepareHighLevelView(data),
      detailed: this.prepareDetailedView(data),
      buttons: this.prepareDefaultButtons(data)
    } as AccordionRow;
    //////console.log(row);
    if (insert_top) {
      this.accordionList.contents.unshift(row);
      this.itemList.unshift(data);
    } else {
      this.accordionList.contents.push(row);
      this.itemList.push(data);
    }
  }

  updateContentRow(data: NumType, rowIndex: number) {
    let row = {
      columns: this.prepareHighLevelView(data),
      detailed: this.prepareDetailedView(data),
      buttons: this.prepareDefaultButtons(data)
    } as AccordionRow;
    this.accordionList.contents[rowIndex] = row;
    this.itemList[rowIndex] = data;
  }

  removeContentRow(rowIndex: number) {
    this.accordionList.contents.splice(rowIndex, 1);
    this.itemList.splice(rowIndex, 1);
  }

  /**
   * Regenerate the detailed view sections for a row with new options.
   * This is useful when switching modes (e.g., from view to edit).
   * 
   * @param rowIndex - The row index to regenerate
   * @param options - Options to pass to prepareDetailedView (e.g., { mode: 'edit' })
   * 
   * @example
   * ```typescript
   * // Switch to edit mode
   * this.regenerateDetailedView(rowIndex, { mode: 'edit' });
   * ```
   */
  protected regenerateDetailedView(rowIndex: number, options?: { [key: string]: any }): void {
    const data = this.itemList[rowIndex];
    if (!data) {
      console.warn(`No data found at rowIndex: ${rowIndex}`);
      return;
    }

    // Regenerate detailed view with new options
    const newDetailedView = this.prepareDetailedView(data, options);

    // Replace the detailed sections
    this.accordionList.contents[rowIndex].detailed = newDetailedView;
  }

  /**
   * Update existing sections to switch between view and edit modes WITHOUT regenerating.
   * This is more efficient than regenerateDetailedView when you only need to toggle editability.
   * 
   * @param rowIndex - The row index to update
   * @param mode - The mode to switch to ('view' or 'edit')
   * @param sectionIds - Optional array of section IDs to update (updates all if not provided)
   * 
   * @example
   * ```typescript
   * // Switch to edit mode (more efficient)
   * this.updateSectionsMode(rowIndex, 'edit');
   * 
   * // Update only specific sections
   * this.updateSectionsMode(rowIndex, 'edit', ['donation_detail', 'donor_detail']);
   * ```
   */
  protected updateSectionsMode(
    rowIndex: number,
    mode: 'view' | 'edit',
    sectionIds?: string[]
  ): void {
    const sections = this.accordionList.contents[rowIndex]?.detailed;

    if (!sections) {
      console.warn(`No sections found at rowIndex: ${rowIndex}`);
      return;
    }

    // Filter sections if specific IDs provided
    const sectionsToUpdate = sectionIds
      ? sections.filter(s => sectionIds.includes(s.section_html_id!))
      : sections;

    // Update each section
    sectionsToUpdate.forEach(section => {
      section.content?.forEach(field => {
        // Toggle editable based on mode and field configuration
        // Only make editable if the field has a form control
        if (field.form_control_name) {
          field.editable = mode === 'edit';
        }
      });
    });
  }

  /**
   * Update validators for specific form controls dynamically.
   * Useful when validation rules change based on form state.
   * 
   * @param sectionId - The section HTML ID
   * @param rowIndex - The row index
   * @param validatorRules - Map of field names to validator arrays
   * @param create - Whether this is for create mode
   * 
   * @example
   * ```typescript
   * // Update validators when status changes
   * form?.get('status')?.valueChanges.subscribe(status => {
   *   this.updateFieldValidators('donation_detail', rowIndex, {
   *     'paymentMethod': status === 'PAID' ? [Validators.required] : [],
   *     'paidOn': status === 'PAID' ? [Validators.required] : []
   *   });
   * });
   * ```
   */
  protected updateFieldValidators(
    sectionId: string,
    rowIndex: number,
    validatorRules: { [fieldName: string]: ValidatorFn[] },
    create?: boolean
  ): void {
    const form = this.getSectionForm(sectionId, rowIndex, create);

    if (!form) {
      console.warn(`Form not found for section: ${sectionId}`);
      return;
    }

    Object.entries(validatorRules).forEach(([fieldName, validators]) => {
      const control = form.get(fieldName);
      if (control) {
        control.setValidators(validators);
        control.updateValueAndValidity();
      }
    });
  }

  /**
   * Update the select options for a dropdown field.
   * Useful when dropdown options depend on other field values.
   * 
   * @param sectionId - The section HTML ID
   * @param rowIndex - The row index
   * @param fieldName - The form control name of the field
   * @param options - The new list of options (KeyValue[])
   * @param create - Whether this is for create mode
   */
  protected updateFieldOptions(
    sectionId: string,
    rowIndex: number,
    fieldName: string,
    options: KeyValue[],
    create?: boolean
  ): void {
    const section = this.getSectionInAccordion(sectionId, rowIndex, create);

    if (!section?.content) {
      console.warn(`Section content not found for: ${sectionId}`);
      return;
    }

    const field = section.content.find(f => f.form_control_name === fieldName);

    if (field && field.form_input) {
      field.form_input.selectList = options;
    } else {
      console.warn(`Field ${fieldName} not found or has no form_input in section ${sectionId}`);
    }
  }

  protected addSectionInAccordion(section_detail: DetailedView, rowIndex: number, create?: boolean) {
    section_detail.content?.forEach(m1 => {
      section_detail.section_form?.setControl(m1.form_control_name!, new FormControl(m1.field_value, m1.form_input_validation));
    })
    if (create) {
      let indexAddDet = this.accordionList.addContent?.detailed.findIndex(f => f.section_html_id == section_detail.section_html_id)!;
      if (indexAddDet == -1) {
        this.accordionList.addContent?.detailed.push(section_detail);
      } else if (this.accordionList.addContent) {
        this.accordionList.addContent.detailed[indexAddDet] = section_detail;
      }
    } else {
      let indexAddDet = this.accordionList.contents[rowIndex].detailed.findIndex(f => f.section_html_id == section_detail.section_html_id);
      if (indexAddDet == -1) {
        this.accordionList.contents[rowIndex].detailed.push(section_detail);
      } else {
        this.accordionList.contents[rowIndex].detailed[indexAddDet] = section_detail;
      }
    }

  }

  protected removeSectionInAccordion(section_id: string, rowIndex: number, create?: boolean) {
    if (create) {
      let indexAddDet = this.accordionList.addContent?.detailed.findIndex(f => f.section_html_id == section_id)!;
      if (indexAddDet != -1) {
        this.accordionList.addContent?.detailed.splice(indexAddDet, 1);
      }
    } else {
      let indexAddDet = this.accordionList.contents[rowIndex].detailed.findIndex(f => f.section_html_id == section_id);
      if (indexAddDet != -1) {
        this.accordionList.contents[rowIndex]?.detailed.splice(indexAddDet, 1);
      }
    }
  }

  protected getSectionInAccordion(section_id: string, rowIndex: number, create?: boolean) {
    if (create) {
      let indexAddDet = this.accordionList.addContent?.detailed.findIndex(f => f.section_html_id == section_id)!;
      return this.accordionList.addContent?.detailed[indexAddDet];
    } else {
      let indexAddDet = this.accordionList.contents[rowIndex].detailed.findIndex(f => f.section_html_id == section_id);
      return this.accordionList.contents[rowIndex]?.detailed[indexAddDet];
    }
  }

  getSectionForm(sectionId: string, rowIndex: number, create?: boolean) {
    if (create) {
      return this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId)?.section_form;
    } else {
      return this.accordionList.contents[rowIndex]?.detailed.find(f => f.section_html_id == sectionId)?.section_form;
    }
  }

  protected getSectionField(sectionId: string, fieldId: string, rowIndex: number, create?: boolean) {
    if (create) {
      return this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId)?.content?.find(f => f.field_html_id == fieldId)!;
    }
    return this.accordionList.contents[rowIndex]?.detailed.find(f => f.section_html_id == sectionId)?.content?.find(f => f.field_html_id == fieldId)!;
  }

  protected addSectionField(sectionId: string, field_detail: DetailedViewField, rowIndex: number, create?: boolean) {
    if (create) {
      let section = this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId);
      let indexAddDet = section?.content?.findIndex(f => f.field_html_id == field_detail.field_html_id)!;
      if (indexAddDet == -1) {
        ////console.log(section, 1)
        section?.section_form?.setControl(field_detail.form_control_name!, new FormControl(field_detail.field_value, field_detail.form_input_validation));
        section?.content?.push(field_detail)
        ////console.log(section?.content)
      } else {
        ////console.log(section, 2)
        section!.content![indexAddDet] = field_detail;
      }
    } else {
      let section = this.accordionList?.contents[rowIndex].detailed.find(f => f.section_html_id == sectionId);
      let indexAddDet = section?.content?.findIndex(f => f.field_html_id == field_detail.field_html_id)!;
      if (indexAddDet == -1) {
        section?.section_form?.setControl(field_detail.form_control_name!, new FormControl(field_detail.field_value, field_detail.form_input_validation));
        section?.content?.push(field_detail)
      } else {
        section!.content![indexAddDet] = field_detail;
      }
    }
  }


  protected removeSectionField(sectionId: string, field_id: string, rowIndex: number, create?: boolean) {
    if (create) {
      let section = this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId);
      let field = section?.content?.find(f => f.field_html_id == field_id);
      let fieldIndex = section?.content?.findIndex(f => f.field_html_id == field_id)!;
      if (fieldIndex != -1) {
        section?.section_form.removeControl(field?.form_control_name!);
        section?.content?.splice(fieldIndex, 1);
      }

    } else {
      let section = this.accordionList.contents[rowIndex]?.detailed.find(f => f.section_html_id == sectionId);
      let field = section?.content?.find(f => f.field_html_id == field_id);
      let fieldIndex = section?.content?.findIndex(f => f.field_html_id == field_id)!;
      if (fieldIndex != -1) {
        section?.section_form.removeControl(field?.form_control_name!);
        section?.content?.splice(fieldIndex, 1);
      }
    }
  }

  showCreateForm(data?: NumType, options?: { [key: string]: any, create?: boolean }) {
    if (!options) {
      options = {};
    }
    options.create = true;
    let row = {
      columns: this.prepareHighLevelView(data!, options),
      detailed: this.prepareDetailedView(data!, options),
      buttons: this.prepareDefaultButtons(data!, options)
    } as AccordionRow;
    this.accordionList.addContent = row;
    return this.accordionList.addContent.detailed.map(m => {
      //////console.log(m)
      m.show_form = true;
      if (m.hide_section != true) {
        m.hide_section = false;
      }
      m.content?.map(m => {
        if (m.hide_field != true) {
          m.hide_field = false;
        }
        return m;
      })
      if (m.section_type == 'doc_list') {
        m.doc!.docList = new BehaviorSubject<FileUpload[]>([]);
        m.doc!.docChange.subscribe(m.doc!.docList)
        ////console.log("Testt")
      }
      return m;
    });
  }

  showEditForm(rowIndex: number, section_ids: string[]) {
    this.accordionList.contents[rowIndex].detailed.filter(f => section_ids.includes(f.section_html_id!)).map(m => {
      m.show_form = true;
      m.hide_section = false;
      m.content?.map(m => {
        //m.hide_field = false;
        return m;
      })
      if (m.section_type == 'doc_list') {
        m.doc!.docList = new BehaviorSubject<FileUpload[]>([]);
        m.doc!.docChange.subscribe(m.doc!.docList)
      }
      return m;
    });
    //////console.log(this.accordionList.contents)
    this.functionButtons = [];
    this.accordionList.contents[rowIndex].buttons?.forEach(b => {
      this.functionButtons.push(b)
    });

    this.accordionList.contents[rowIndex].buttons?.splice(0);
    //////console.log(this.accordionList.contents[rowIndex].buttons, this.functionButtons)
    this.actionButtons.forEach(b => {
      this.accordionList.contents[rowIndex].buttons?.push(b);
    })
    //////console.log(this.accordionList.contents[rowIndex].buttons, this.actionButtons)
  }
  hideForm(rowIndex: number, create?: boolean) {
    if (create) {
      this.accordionList.addContent = undefined;
    } else {
      this.accordionList.contents[rowIndex].detailed.map(m => {
        m.show_form = false;
        //EXPERIMENTAL//m.section_form?.reset();
        return m;
      });
      this.accordionList.contents[rowIndex].buttons?.splice(0);
      this.functionButtons.forEach(b => {
        this.accordionList.contents[rowIndex].buttons?.push(b);
      })
    }

  }

  getSectionAccordion(sectionId: string, rowIndex: number, create?: boolean) {
    if (create) {
      return this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId)?.accordion?.object;
    }
    return this.accordionList.contents[rowIndex]?.detailed.find(f => f.section_html_id == sectionId)?.accordion?.object;
  }

  getSectionDocuments(sectionId: string, rowIndex: number, create?: boolean) {
    if (create) {
      return this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId)?.doc?.docList?.value;
    } else {
      return this.accordionList.contents[rowIndex]?.detailed.find(f => f.section_html_id == sectionId)?.doc?.docList?.value;
    }
  }

  removeButton(buttonId: string, rowIndex: number, create?: boolean) {
    if (create) {
      let index = this.accordionList.addContent?.buttons?.findIndex(f => f.button_id == buttonId)!;
      return this.accordionList.addContent?.buttons?.splice(index, 1);
    } else {
      let index = this.accordionList.contents[rowIndex]?.buttons?.findIndex(f => f.button_id == buttonId)!;
      return this.accordionList.contents[rowIndex]?.buttons?.splice(index, 1);
    }
  }

  /* ──────────────────────────────────────────────────────────────
   * Dynamic Field Visibility
   * ────────────────────────────────────────────────────────────── */

  /**
   * Setup dynamic field visibility based on form value changes.
   * This method subscribes to form changes and updates field visibility
   * based on the provided rules.
   * 
   * @param sectionId - The section HTML ID containing the fields
   * @param rowIndex - The row index in the accordion
   * @param rules - Array of visibility rules
   * @param create - Whether this is for create mode
   * @returns Subscription that should be unsubscribed when done
   * 
   * @example
   * ```typescript
   * this.setupFieldVisibilityRules('donation_detail', rowIndex, [
   *   {
   *     fieldName: 'paidOn',
   *     condition: (formValue) => formValue.status === 'PAID'
   *   },
   *   {
   *     fieldName: 'paidUsingUPI',
   *     condition: (formValue) => formValue.status === 'PAID' && formValue.paymentMethod === 'UPI'
   *   }
   * ]);
   * ```
   */
  protected setupFieldVisibilityRules(
    sectionId: string,
    rowIndex: number,
    rules: FieldVisibilityRule<NumType>[],
    create?: boolean
  ): Subscription | undefined {
    const form = this.getSectionForm(sectionId, rowIndex, create);

    if (!form) {
      console.warn(`Form not found for section: ${sectionId}`);
      return undefined;
    }

    // Subscribe to form changes
    const subscription = form.valueChanges.subscribe(formValue => {
      const section = this.getSectionInAccordion(sectionId, rowIndex, create);

      if (!section?.content) return;

      // Apply each rule
      rules.forEach(rule => {
        const field = section.content?.find(f => f.form_control_name === rule.fieldName);
        if (field) {
          // Show field if condition is true, hide if false
          field.hide_field = !rule.condition(formValue);
        }
      });
    });

    // Trigger initial visibility update in next change detection cycle
    // This prevents ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      const section = this.getSectionInAccordion(sectionId, rowIndex, create);
      if (section?.content) {
        const currentValue = form.value;
        rules.forEach(rule => {
          const field = section.content?.find(f => f.form_control_name === rule.fieldName);
          if (field) {
            field.hide_field = !rule.condition(currentValue);
          }
        });
      }
    }, 0);

    return subscription;
  }

  /**
   * Update visibility of a single field based on a condition.
   * This is a simpler alternative to setupFieldVisibilityRules for one-off updates.
   * 
   * @param sectionId - The section HTML ID
   * @param fieldName - The form control name of the field
   * @param rowIndex - The row index
   * @param shouldShow - Whether the field should be visible
   * @param create - Whether this is for create mode
   * 
   * @example
   * ```typescript
   * this.updateFieldVisibility('donation_detail', 'paidOn', rowIndex, status === 'PAID');
   * ```
   */
  protected updateFieldVisibility(
    sectionId: string,
    fieldName: string,
    rowIndex: number,
    shouldShow: boolean,
    create?: boolean
  ): void {
    const section = this.getSectionInAccordion(sectionId, rowIndex, create);
    const field = section?.content?.find(f => f.form_control_name === fieldName);

    if (field) {
      field.hide_field = !shouldShow;
    }
  }

  /**
   * Batch update visibility for multiple fields.
   * Useful when you need to update several fields at once without setting up rules.
   * 
   * @param sectionId - The section HTML ID
   * @param rowIndex - The row index
   * @param updates - Map of field names to visibility (true = show, false = hide)
   * @param create - Whether this is for create mode
   * 
   * @example
   * ```typescript
   * this.updateFieldsVisibility('donation_detail', rowIndex, {
   *   'paidOn': status === 'PAID',
   *   'paidToAccount': status === 'PAID',
   *   'paymentMethod': status === 'PAID',
   *   'paidUsingUPI': status === 'PAID' && paymentMethod === 'UPI'
   * });
   * ```
   */
  protected updateFieldsVisibility(
    sectionId: string,
    rowIndex: number,
    updates: { [fieldName: string]: boolean },
    create?: boolean
  ): void {
    const section = this.getSectionInAccordion(sectionId, rowIndex, create);

    if (!section?.content) return;

    Object.entries(updates).forEach(([fieldName, shouldShow]) => {
      const field = section.content?.find(f => f.form_control_name === fieldName);
      if (field) {
        field.hide_field = !shouldShow;
      }
    });
  }

  /**
   * Helper method to regenerate a section with a different mode.
   * Useful when switching from view to edit mode.
   * 
   * @param rowIndex - The row index
   * @param sectionId - The section HTML ID to replace
   * @param newSection - The new section to replace with
   * @param create - Whether this is for create mode
   * 
   * @example
   * ```typescript
   * const editSection = getDonationSection(donation, {
   *   mode: 'edit',
   *   refData: this.getRefData({ isActive: true })
   * });
   * this.replaceSectionWithMode(rowIndex, 'donation_detail', editSection);
   * ```
   */
  protected replaceSectionWithMode(
    rowIndex: number,
    sectionId: string,
    newSection: DetailedView,
    create?: boolean
  ): void {
    if (create) {
      const sectionIndex = this.accordionList.addContent?.detailed
        .findIndex(s => s.section_html_id === sectionId);
      if (sectionIndex !== undefined && sectionIndex !== -1 && this.accordionList.addContent) {
        this.accordionList.addContent.detailed[sectionIndex] = newSection;
      }
    } else {
      const sectionIndex = this.accordionList.contents[rowIndex]?.detailed
        .findIndex(s => s.section_html_id === sectionId);
      if (sectionIndex !== undefined && sectionIndex !== -1) {
        this.accordionList.contents[rowIndex].detailed[sectionIndex] = newSection;
      }
    }
  }
} 