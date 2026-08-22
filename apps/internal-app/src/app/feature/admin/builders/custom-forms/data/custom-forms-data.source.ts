import { Observable } from 'rxjs';
import type {
  CreateCustomFormInput,
  CustomForm,
  CustomFormField,
  CustomFormStatus,
  UpdateCustomFormInput,
  UpsertCustomFormFieldInput,
} from '../domain';

export abstract class CustomFormsDataSource {
  abstract listForms(entityType: string, status?: CustomFormStatus): Observable<CustomForm[]>;
  abstract getForm(formId: string): Observable<CustomForm>;
  abstract createForm(input: CreateCustomFormInput): Observable<CustomForm>;
  abstract updateForm(formId: string, input: UpdateCustomFormInput): Observable<CustomForm>;
  abstract publishForm(formId: string): Observable<CustomForm>;
  abstract disableForm(formId: string): Observable<CustomForm>;

  abstract addField(formId: string, input: UpsertCustomFormFieldInput & { key: string }): Observable<CustomFormField>;
  abstract updateField(formId: string, fieldId: string, input: UpsertCustomFormFieldInput): Observable<CustomFormField>;
  abstract disableField(formId: string, fieldId: string): Observable<CustomFormField>;
  abstract reorderFields(formId: string, items: Array<{ id: string; sortOrder: number }>): Observable<CustomFormField[]>;
}
